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
import { getJobById, completeJob, getStatusInfo } from '../../../src/services/jobService';
import type { WorkOrder } from '../../../src/types';
import { SignatureCapture } from '../../../src/components/SignatureCapture';

export default function CompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [job, setJob] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Completion form
  const [workPerformed, setWorkPerformed] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [customerFeedback, setCustomerFeedback] = useState('');
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);
  const [technicianSignature, setTechnicianSignature] = useState<string | null>(null);

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
    input: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
      color: isDark ? colors.textDark : colors.text,
    },
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    if (!id) return;

    try {
      setError(null);
      const data = await getJobById(id);
      setJob(data);

      // Pre-fill with existing data
      if (data.workPerformed) setWorkPerformed(data.workPerformed);
      if (data.technicianNotes) setTechnicianNotes(data.technicianNotes);
    } catch (err: any) {
      console.error('Error fetching job:', err);
      setError(err.message || 'Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!job) return;

    // Validate customer signature (required)
    if (!customerSignature) {
      Alert.alert('Signature Required', 'Customer signature is required to complete the work.');
      return;
    }

    Alert.alert(
      'Complete Work Order',
      'Are you sure you want to complete this work order? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await completeJob(job.id, {
                workPerformed,
                technicianNotes,
                customerFeedback,
                customerSignature,
                technicianSignature: technicianSignature || undefined,
              });

              Alert.alert('Success', 'Work order completed successfully!', [
                {
                  text: 'Generate Invoice',
                  onPress: () => router.replace(`/job/${job.id}/invoice`),
                },
                {
                  text: 'Back to Jobs',
                  onPress: () => router.replace('/(tabs)/jobs'),
                },
              ]);
            } catch (err: any) {
              console.error('Error completing job:', err);
              Alert.alert('Error', err.message || 'Failed to complete work order');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchJob}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = getStatusInfo(job.status);

  // Calculate totals for summary
  const materialsTotal = job.items?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) || 0;

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView style={styles.scrollView}>
        {/* Job Summary */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Work Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, dynamicStyles.textMuted]}>Job:</Text>
            <Text style={[styles.summaryValue, dynamicStyles.text]}>
              {job.title || job.serviceRequest?.title || 'Work Order'}
            </Text>
          </View>

          {job.workOrderNo && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, dynamicStyles.textMuted]}>Order #:</Text>
              <Text style={[styles.summaryValue, dynamicStyles.text]}>{job.workOrderNo}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, dynamicStyles.textMuted]}>Status:</Text>
            <Text style={[styles.summaryValue, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>

          {job.items && job.items.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, dynamicStyles.textMuted]}>Materials:</Text>
              <Text style={[styles.summaryValue, dynamicStyles.text]}>
                {job.items.length} item(s) - ${materialsTotal.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Work Performed */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Work Performed</Text>
          <TextInput
            style={[styles.textArea, dynamicStyles.input]}
            value={workPerformed}
            onChangeText={setWorkPerformed}
            placeholder="Describe the work performed..."
            placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Technician Notes */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Technician Notes</Text>
          <TextInput
            style={[styles.textArea, dynamicStyles.input]}
            value={technicianNotes}
            onChangeText={setTechnicianNotes}
            placeholder="Add any additional notes..."
            placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Customer Feedback */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Customer Feedback</Text>
          <TextInput
            style={[styles.textArea, dynamicStyles.input]}
            value={customerFeedback}
            onChangeText={setCustomerFeedback}
            placeholder="Record any customer feedback..."
            placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Signatures */}
        <View style={styles.signaturesSection}>
          <SignatureCapture
            label="Customer Signature"
            signature={customerSignature}
            onSignatureChange={setCustomerSignature}
            required
            isDark={isDark}
          />

          <SignatureCapture
            label="Technician Signature"
            signature={technicianSignature}
            onSignatureChange={setTechnicianSignature}
            isDark={isDark}
          />
        </View>

        {/* Warning if no customer signature */}
        {!customerSignature && (
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={20} color={colors.warning} />
            <Text style={styles.warningText}>
              Customer signature is required to complete the work order
            </Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, dynamicStyles.card]}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            (!customerSignature || isSubmitting) && styles.completeButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!customerSignature || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={20} color={colors.white} />
              <Text style={styles.completeButtonText}>Complete Work Order</Text>
            </>
          )}
        </TouchableOpacity>
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
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    width: 80,
    fontSize: fontSize.sm,
  },
  summaryValue: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 80,
  },
  signaturesSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    color: colors.warning,
    fontSize: fontSize.sm,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  completeButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
