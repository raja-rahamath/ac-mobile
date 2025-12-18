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
  generateInvoice,
  getInvoicesForWorkOrder,
  formatCurrency,
  calculateInvoiceTotals,
} from '../../../src/services/invoiceService';
import type { WorkOrder, Invoice, WorkOrderItem } from '../../../src/types';

export default function InvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [job, setJob] = useState<WorkOrder | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [laborHours, setLaborHours] = useState('1');
  const [laborRate, setLaborRate] = useState('50');
  const [taxRate, setTaxRate] = useState('10');
  const [discount, setDiscount] = useState('0');

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
  }, [id]);

  const fetchData = async () => {
    if (!id) return;

    try {
      setError(null);
      const jobData = await getJobById(id);
      setJob(jobData);

      // Check if invoice already exists
      if (jobData.serviceRequestId) {
        const invoices = await getInvoicesForWorkOrder(id);
        if (invoices.length > 0) {
          setInvoice(invoices[0]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!job?.serviceRequestId) {
      Alert.alert('Error', 'No service request associated with this work order');
      return;
    }

    setIsGenerating(true);
    try {
      const newInvoice = await generateInvoice(job.serviceRequestId);
      setInvoice(newInvoice);
      Alert.alert('Success', 'Invoice generated successfully!');
    } catch (err: any) {
      console.error('Error generating invoice:', err);
      Alert.alert('Error', err.message || 'Failed to generate invoice');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProceedToPayment = () => {
    if (invoice) {
      router.push(`/job/${id}/payment?invoiceId=${invoice.id}`);
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

  if (error || !job) {
    return (
      <View style={[styles.errorContainer, dynamicStyles.container]}>
        <Ionicons name="alert-circle" size={64} color={colors.error} />
        <Text style={[styles.errorTitle, dynamicStyles.text]}>Failed to Load</Text>
        <Text style={[styles.errorMessage, dynamicStyles.textMuted]}>
          {error || 'Job not found'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate totals
  const materials = job.items || [];
  const materialsTotal = materials.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
  const laborTotal = parseFloat(laborHours || '0') * parseFloat(laborRate || '0');
  const subtotal = materialsTotal + laborTotal;
  const taxAmount = subtotal * (parseFloat(taxRate || '0') / 100);
  const discountAmount = parseFloat(discount || '0');
  const total = subtotal + taxAmount - discountAmount;

  const customerName = job.customer
    ? job.customer.customerType === 'ORGANIZATION'
      ? job.customer.orgName
      : `${job.customer.firstName || ''} ${job.customer.lastName || ''}`.trim()
    : 'Unknown Customer';

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView style={styles.scrollView}>
        {/* Invoice Header */}
        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.invoiceHeader}>
            <View>
              <Text style={[styles.invoiceTitle, dynamicStyles.text]}>Invoice</Text>
              {invoice && (
                <Text style={[styles.invoiceNumber, dynamicStyles.textMuted]}>
                  #{invoice.invoiceNo}
                </Text>
              )}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: invoice ? colors.success + '20' : colors.warning + '20' }]}>
              <Text style={{ color: invoice ? colors.success : colors.warning, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
                {invoice ? 'Generated' : 'Draft'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.customerSection}>
            <Text style={[styles.sectionLabel, dynamicStyles.textMuted]}>Bill To:</Text>
            <Text style={[styles.customerName, dynamicStyles.text]}>{customerName}</Text>
            {job.property?.address && (
              <Text style={[styles.customerAddress, dynamicStyles.textMuted]}>
                {job.property.address}
              </Text>
            )}
          </View>
        </View>

        {/* Labor */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Labor</Text>
          <View style={styles.laborRow}>
            <View style={styles.laborInput}>
              <Text style={[styles.inputLabel, dynamicStyles.textMuted]}>Hours</Text>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                value={laborHours}
                onChangeText={setLaborHours}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
              />
            </View>
            <Text style={[styles.laborMultiplier, dynamicStyles.textMuted]}>×</Text>
            <View style={styles.laborInput}>
              <Text style={[styles.inputLabel, dynamicStyles.textMuted]}>Rate/hr ($)</Text>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                value={laborRate}
                onChangeText={setLaborRate}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
              />
            </View>
            <Text style={[styles.laborMultiplier, dynamicStyles.textMuted]}>=</Text>
            <View style={styles.laborTotal}>
              <Text style={[styles.inputLabel, dynamicStyles.textMuted]}>Total</Text>
              <Text style={[styles.laborTotalValue, dynamicStyles.text]}>
                ${laborTotal.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Materials */}
        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Materials & Parts</Text>
            <Text style={[styles.itemCount, dynamicStyles.textMuted]}>
              {materials.length} item(s)
            </Text>
          </View>

          {materials.length === 0 ? (
            <Text style={[styles.emptyText, dynamicStyles.textMuted]}>No materials added</Text>
          ) : (
            <>
              {materials.map((item: WorkOrderItem, index: number) => (
                <View key={item.id || index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, dynamicStyles.text]}>{item.description}</Text>
                    <Text style={[styles.itemMeta, dynamicStyles.textMuted]}>
                      {item.quantity} × ${(item.unitPrice || 0).toFixed(2)}
                    </Text>
                  </View>
                  <Text style={[styles.itemTotal, dynamicStyles.text]}>
                    ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                  </Text>
                </View>
              ))}
              <View style={styles.materialsTotalRow}>
                <Text style={[styles.materialsTotalLabel, dynamicStyles.textMuted]}>
                  Materials Subtotal:
                </Text>
                <Text style={[styles.materialsTotalValue, dynamicStyles.text]}>
                  ${materialsTotal.toFixed(2)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Tax & Discount */}
        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.adjustmentRow}>
            <View style={styles.adjustmentInput}>
              <Text style={[styles.inputLabel, dynamicStyles.textMuted]}>Tax Rate (%)</Text>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                value={taxRate}
                onChangeText={setTaxRate}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
              />
            </View>
            <View style={styles.adjustmentInput}>
              <Text style={[styles.inputLabel, dynamicStyles.textMuted]}>Discount ($)</Text>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                value={discount}
                onChangeText={setDiscount}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Totals */}
        <View style={[styles.card, styles.totalsCard, dynamicStyles.card]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, dynamicStyles.textMuted]}>Subtotal</Text>
            <Text style={[styles.totalValue, dynamicStyles.text]}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, dynamicStyles.textMuted]}>
              Tax ({taxRate || 0}%)
            </Text>
            <Text style={[styles.totalValue, dynamicStyles.text]}>${taxAmount.toFixed(2)}</Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, dynamicStyles.textMuted]}>Discount</Text>
              <Text style={[styles.totalValue, { color: colors.success }]}>
                -${discountAmount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={[styles.grandTotalLabel, dynamicStyles.text]}>Total</Text>
            <Text style={[styles.grandTotalValue, dynamicStyles.text]}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, dynamicStyles.card]}>
        {!invoice ? (
          <TouchableOpacity
            style={[styles.actionButton, isGenerating && styles.actionButtonDisabled]}
            onPress={handleGenerateInvoice}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="document-text" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Generate Invoice</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionButton} onPress={handleProceedToPayment}>
            <Ionicons name="card" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Record Payment</Text>
          </TouchableOpacity>
        )}
      </View>
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
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  invoiceNumber: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  customerSection: {},
  sectionLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  customerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  customerAddress: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemCount: {
    fontSize: fontSize.sm,
  },
  laborRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  laborInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  laborMultiplier: {
    fontSize: fontSize.lg,
    paddingBottom: spacing.sm,
  },
  laborTotal: {
    flex: 1,
    alignItems: 'center',
  },
  laborTotalValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    paddingVertical: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.sm,
  },
  itemMeta: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  materialsTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  materialsTotalLabel: {
    fontSize: fontSize.sm,
  },
  materialsTotalValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  adjustmentRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  adjustmentInput: {
    flex: 1,
  },
  totalsCard: {
    backgroundColor: colors.primary + '05',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  totalLabel: {
    fontSize: fontSize.sm,
  },
  totalValue: {
    fontSize: fontSize.sm,
  },
  grandTotalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 0,
  },
  grandTotalLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  grandTotalValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
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
    backgroundColor: colors.primary,
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
