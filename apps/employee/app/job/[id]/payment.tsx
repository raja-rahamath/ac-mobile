import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../../src/constants/theme';
import { getJobById } from '../../../src/services/jobService';
import {
  getInvoiceById,
  getInvoicesForWorkOrder,
  recordPayment,
  generateReceipt,
  emailReceipt,
} from '../../../src/services/invoiceService';
import { formatCurrency, getDefaultCurrency } from '../../../src/services/inventoryService';
import type { WorkOrder, Invoice, Payment, Currency } from '../../../src/types';

type PaymentMethod = 'CASH' | 'BENEFIT_PAY';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'CASH', label: 'Cash', icon: 'cash' },
  { value: 'BENEFIT_PAY', label: 'BenefitPay', icon: 'card' },
];

export default function PaymentScreen() {
  const { id, invoiceId } = useLocalSearchParams<{ id: string; invoiceId?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [job, setJob] = useState<WorkOrder | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment form
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
    input: {
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
      borderColor: isDark ? colors.borderDark : colors.border,
      color: isDark ? colors.textDark : colors.text,
    },
  };

  useEffect(() => {
    fetchData();
  }, [id, invoiceId]);

  const fetchData = async () => {
    if (!id) return;

    try {
      setError(null);

      // Fetch currency
      const defaultCurrency = await getDefaultCurrency();
      setCurrency(defaultCurrency);

      const jobData = await getJobById(id);
      setJob(jobData);

      // Get invoice
      let invoiceData: Invoice | null = null;
      if (invoiceId) {
        invoiceData = await getInvoiceById(invoiceId);
      } else {
        const invoices = await getInvoicesForWorkOrder(id);
        if (invoices.length > 0) {
          invoiceData = invoices[0];
        }
      }

      if (invoiceData) {
        setInvoice(invoiceData);
        // Pre-fill amount with remaining balance (use 3 decimal places for BHD)
        const paid = invoiceData.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const remaining = (invoiceData.totalAmount || 0) - paid;
        setAmount(remaining.toFixed(defaultCurrency?.decimalPlaces || 3));
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!invoice) {
      Alert.alert('Error', 'No invoice found');
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount');
      return;
    }

    if (paymentMethod === 'BENEFIT_PAY' && !referenceNumber.trim()) {
      Alert.alert('Reference Required', 'Please enter the BenefitPay reference number');
      return;
    }

    setIsProcessing(true);
    try {
      const payment = await recordPayment(invoice.id, {
        amount: paymentAmount,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      // Check if fully paid
      const totalPaid = (invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0) + paymentAmount;
      const isFullyPaid = totalPaid >= (invoice.totalAmount || 0);

      if (isFullyPaid) {
        // Generate receipt
        try {
          const receipt = await generateReceipt(payment.id);

          Alert.alert(
            'Payment Recorded',
            'Invoice has been fully paid. Would you like to email the receipt to the customer?',
            [
              { text: 'Skip', onPress: () => router.replace('/(tabs)/jobs') },
              {
                text: 'Send Email',
                onPress: async () => {
                  try {
                    await emailReceipt(receipt.id);
                    Alert.alert('Success', 'Receipt has been emailed to the customer', [
                      { text: 'OK', onPress: () => router.replace('/(tabs)/jobs') },
                    ]);
                  } catch (emailErr: any) {
                    Alert.alert('Email Failed', emailErr.message || 'Failed to send email', [
                      { text: 'OK', onPress: () => router.replace('/(tabs)/jobs') },
                    ]);
                  }
                },
              },
            ]
          );
        } catch (receiptErr) {
          console.error('Error generating receipt:', receiptErr);
          Alert.alert('Payment Recorded', 'Payment recorded successfully!', [
            { text: 'OK', onPress: () => router.replace('/(tabs)/jobs') },
          ]);
        }
      } else {
        const newRemaining = (invoice.totalAmount || 0) - totalPaid;
        Alert.alert(
          'Partial Payment Recorded',
          `${formatAmount(paymentAmount)} recorded. Remaining balance: ${formatAmount(newRemaining)}`,
          [
            { text: 'OK', onPress: () => fetchData() },
          ]
        );
      }
    } catch (err: any) {
      console.error('Error recording payment:', err);
      Alert.alert('Error', err.message || 'Failed to record payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayFullAmount = () => {
    if (invoice) {
      const paid = invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const remaining = (invoice.totalAmount || 0) - paid;
      setAmount(remaining.toFixed(currency?.decimalPlaces || 3));
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, dynamicStyles.container]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.textMuted]}>Loading...</Text>
      </View>
    );
  }

  if (error || !job || !invoice) {
    return (
      <View style={[styles.errorContainer, dynamicStyles.container]}>
        <Ionicons name="alert-circle" size={64} color={colors.error} />
        <Text style={[styles.errorTitle, dynamicStyles.text]}>
          {!invoice ? 'No Invoice' : 'Failed to Load'}
        </Text>
        <Text style={[styles.errorMessage, dynamicStyles.textMuted]}>
          {error || 'Please generate an invoice first'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => (invoice ? fetchData() : router.back())}
        >
          <Text style={styles.retryButtonText}>{invoice ? 'Try Again' : 'Go Back'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Helper function for currency formatting
  const formatAmount = (amount: number): string => {
    if (currency) {
      return formatCurrency(amount, currency);
    }
    return `BD ${amount.toFixed(3)}`; // Default to BHD if currency not loaded
  };

  // Get currency symbol for labels
  const currencySymbol = currency?.symbol || 'BD';
  const decimalPlaces = currency?.decimalPlaces || 3;

  const totalPaid = invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const remainingBalance = (invoice.totalAmount || 0) - totalPaid;
  const isFullyPaid = remainingBalance <= 0;

  const customerName = job.customer
    ? job.customer.customerType === 'ORGANIZATION'
      ? job.customer.orgName
      : `${job.customer.firstName || ''} ${job.customer.lastName || ''}`.trim()
    : 'Unknown Customer';

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView style={styles.scrollView}>
        {/* Invoice Summary */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Invoice Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, dynamicStyles.textMuted]}>Invoice #:</Text>
            <Text style={[styles.summaryValue, dynamicStyles.text]}>{invoice.invoiceNo}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, dynamicStyles.textMuted]}>Customer:</Text>
            <Text style={[styles.summaryValue, dynamicStyles.text]}>{customerName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, dynamicStyles.textMuted]}>Total Amount:</Text>
            <Text style={[styles.summaryValue, dynamicStyles.text]}>
              {formatAmount(invoice.totalAmount || 0)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, dynamicStyles.textMuted]}>Amount Paid:</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {formatAmount(totalPaid)}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.balanceRow]}>
            <Text style={[styles.balanceLabel, dynamicStyles.text]}>Balance Due:</Text>
            <Text
              style={[
                styles.balanceValue,
                { color: isFullyPaid ? colors.success : colors.error },
              ]}
            >
              {formatAmount(remainingBalance)}
            </Text>
          </View>
        </View>

        {isFullyPaid ? (
          <View style={[styles.paidCard, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text style={[styles.paidTitle, { color: colors.success }]}>Fully Paid</Text>
            <Text style={[styles.paidSubtitle, dynamicStyles.textMuted]}>
              This invoice has been paid in full
            </Text>
          </View>
        ) : (
          <>
            {/* Payment Method */}
            <View style={[styles.card, dynamicStyles.card]}>
              <Text style={[styles.sectionTitle, dynamicStyles.text]}>Payment Method</Text>
              <View style={styles.methodSelector}>
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.value}
                    style={[
                      styles.methodButton,
                      paymentMethod === method.value && styles.methodButtonActive,
                    ]}
                    onPress={() => setPaymentMethod(method.value)}
                  >
                    <Ionicons
                      name={method.icon as any}
                      size={24}
                      color={paymentMethod === method.value ? colors.white : colors.primary}
                    />
                    <Text
                      style={[
                        styles.methodButtonText,
                        paymentMethod === method.value && styles.methodButtonTextActive,
                      ]}
                    >
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment Details */}
            <View style={[styles.card, dynamicStyles.card]}>
              <Text style={[styles.sectionTitle, dynamicStyles.text]}>Payment Details</Text>

              <View style={styles.formGroup}>
                <View style={styles.amountHeader}>
                  <Text style={[styles.inputLabel, dynamicStyles.text]}>Amount ({currencySymbol})</Text>
                  <TouchableOpacity onPress={handlePayFullAmount}>
                    <Text style={styles.payFullLink}>Pay Full Amount</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.input, styles.amountInput, dynamicStyles.input]}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                />
              </View>

              {paymentMethod === 'BENEFIT_PAY' && (
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, dynamicStyles.text]}>
                    Reference Number <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={referenceNumber}
                    onChangeText={setReferenceNumber}
                    placeholder="Enter BenefitPay reference"
                    placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                  />
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.text]}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.notesInput, dynamicStyles.input]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add payment notes..."
                  placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Previous Payments */}
            {invoice.payments && invoice.payments.length > 0 && (
              <View style={[styles.card, dynamicStyles.card]}>
                <Text style={[styles.sectionTitle, dynamicStyles.text]}>Previous Payments</Text>
                {invoice.payments.map((payment, index) => (
                  <View key={payment.id || index} style={styles.paymentRow}>
                    <View style={styles.paymentInfo}>
                      <Text style={[styles.paymentMethod, dynamicStyles.text]}>
                        {payment.paymentMethod?.replace('_', ' ')}
                      </Text>
                      <Text style={[styles.paymentDate, dynamicStyles.textMuted]}>
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleDateString()
                          : 'Unknown date'}
                      </Text>
                    </View>
                    <Text style={[styles.paymentAmount, { color: colors.success }]}>
                      {formatAmount(payment.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action */}
      {!isFullyPaid && (
        <View style={[styles.bottomAction, dynamicStyles.card]}>
          <TouchableOpacity
            style={[styles.actionButton, isProcessing && styles.actionButtonDisabled]}
            onPress={handleRecordPayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Record Payment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.lg,
  },
  errorMessage: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  card: {
    margin: spacing.lg,
    marginBottom: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
  },
  summaryValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  balanceRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 0,
  },
  balanceLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  balanceValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  paidCard: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  paidTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.md,
  },
  paidSubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  methodSelector: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  methodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary + '15',
    gap: spacing.sm,
  },
  methodButtonActive: {
    backgroundColor: colors.primary,
  },
  methodButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  methodButtonTextActive: {
    color: colors.white,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  payFullLink: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  required: {
    color: colors.error,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
  },
  amountInput: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  paymentInfo: {},
  paymentMethod: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  paymentDate: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
