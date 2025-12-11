import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Linking, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';
import { getServiceRequestById } from '../../src/services/requestService';
import type { ServiceRequest } from '../../src/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  // Lowercase statuses
  pending: { label: 'Pending', color: '#f59e0b', icon: 'time' },
  confirmed: { label: 'Confirmed', color: '#3b82f6', icon: 'checkmark-circle' },
  assigned: { label: 'Assigned', color: '#8b5cf6', icon: 'person' },
  en_route: { label: 'En Route', color: '#06b6d4', icon: 'navigate' },
  in_progress: { label: 'In Progress', color: '#10b981', icon: 'construct' },
  completed: { label: 'Completed', color: '#22c55e', icon: 'checkmark-done' },
  cancelled: { label: 'Cancelled', color: '#ef4444', icon: 'close-circle' },
  // Uppercase statuses (from API)
  NEW: { label: 'New', color: '#f59e0b', icon: 'time' },
  ASSIGNED: { label: 'Assigned', color: '#8b5cf6', icon: 'person' },
  IN_PROGRESS: { label: 'In Progress', color: '#10b981', icon: 'construct' },
  ON_HOLD: { label: 'On Hold', color: '#6b7280', icon: 'pause' },
  COMPLETED: { label: 'Completed', color: '#22c55e', icon: 'checkmark-done' },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', icon: 'close-circle' },
  CLOSED: { label: 'Closed', color: '#6b7280', icon: 'checkmark-done' },
};

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  hvac: 'AC / HVAC',
  appliance: 'Appliances',
  cleaning: 'Cleaning',
  general: 'General',
  pest_control: 'Pest Control',
  landscaping: 'Landscaping',
};

// Map complaint type names to mobile categories
const COMPLAINT_TYPE_TO_CATEGORY: Record<string, string> = {
  'Plumbing': 'plumbing',
  'Electrical': 'electrical',
  'AC Maintenance': 'hvac',
  'HVAC': 'hvac',
  'General Maintenance': 'general',
  'Cleaning': 'cleaning',
  'Pest Control': 'pest_control',
  'Landscaping': 'landscaping',
};

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getServiceRequestById(id as string);
      setRequest(data);
    } catch (err) {
      console.error('Error fetching request details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load request details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = () => {
    const phone = request?.assignedTo?.phone || request?.assignedTechnician?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, dynamicStyles.container]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.textMuted]}>Loading request details...</Text>
      </View>
    );
  }

  if (error || !request) {
    return (
      <View style={[styles.loadingContainer, dynamicStyles.container]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={[styles.errorTitle, dynamicStyles.text]}>Unable to load request</Text>
        <Text style={[styles.errorText, dynamicStyles.textMuted]}>{error || 'Request not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRequestDetails}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get status config - handle both uppercase and lowercase status values
  const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.NEW;

  // Build property address
  let propertyAddress = 'No address specified';
  if (request.unit) {
    const unitNo = request.unit.unitNo || request.unit.flatNumber || '';
    const buildingName = request.unit.building?.name || '';
    propertyAddress = buildingName ? `${unitNo}, ${buildingName}` : unitNo;
  } else if (request.property?.name) {
    propertyAddress = request.property.name;
  } else if (request.propertyAddress) {
    propertyAddress = request.propertyAddress;
  }

  // Get category label
  const categoryName = request.complaintType?.name || '';
  const category = COMPLAINT_TYPE_TO_CATEGORY[categoryName] || request.category || 'general';
  const categoryLabel = CATEGORY_LABELS[category] || categoryName || 'General';

  // Get technician info
  const technician = request.assignedTo || request.assignedTechnician;
  const technicianName = technician
    ? `${technician.firstName || ''} ${technician.lastName || ''}`.trim() || technician.name || 'Unknown'
    : null;

  // Get priority
  const priority = (request.priority || 'MEDIUM').toLowerCase();

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: statusConfig.color }]}>
        <Ionicons name={statusConfig.icon as any} size={24} color={colors.white} />
        <Text style={styles.statusText}>{statusConfig.label}</Text>
      </View>

      {/* Request Info */}
      <View style={[styles.card, dynamicStyles.card]}>
        {/* Request Number */}
        {request.requestNo && (
          <View style={styles.requestNumberBadge}>
            <Text style={styles.requestNumberText}>{request.requestNo}</Text>
          </View>
        )}

        <Text style={[styles.requestTitle, dynamicStyles.text]}>{request.title}</Text>
        <Text style={[styles.requestDescription, dynamicStyles.textMuted]}>
          {request.description || 'No description provided'}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="pricetag" size={18} color={colors.primary} />
          <Text style={[styles.infoText, dynamicStyles.text]}>{categoryLabel}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text style={[styles.infoText, dynamicStyles.text]}>{propertyAddress}</Text>
        </View>

        {request.scheduledDate || request.startedAt || request.preferredDate ? (
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={18} color={colors.primary} />
            <Text style={[styles.infoText, dynamicStyles.text]}>
              Scheduled:{' '}
              {new Date(request.scheduledDate || request.startedAt || request.preferredDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ) : null}

        <View style={styles.infoRow}>
          <Ionicons
            name="flag"
            size={18}
            color={priority === 'high' || priority === 'emergency' ? colors.error : colors.warning}
          />
          <Text
            style={[
              styles.infoText,
              { color: priority === 'high' || priority === 'emergency' ? colors.error : colors.warning },
            ]}
          >
            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
          </Text>
        </View>

        {/* Created Date */}
        <View style={styles.infoRow}>
          <Ionicons name="time" size={18} color={isDark ? colors.textMutedDark : colors.textMuted} />
          <Text style={[styles.infoText, dynamicStyles.textMuted]}>
            Created:{' '}
            {new Date(request.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* Technician Info */}
      {technician && (
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Assigned Technician</Text>
          <View style={styles.technicianInfo}>
            <View style={styles.technicianAvatar}>
              <Text style={styles.avatarText}>{technicianName?.charAt(0) || '?'}</Text>
            </View>
            <View style={styles.technicianDetails}>
              <Text style={[styles.technicianName, dynamicStyles.text]}>{technicianName}</Text>
              {technician.phone && (
                <Text style={[styles.technicianPhone, dynamicStyles.textMuted]}>{technician.phone}</Text>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            {technician.phone && (
              <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                <Ionicons name="call" size={20} color={colors.primary} />
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Call</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Message</Text>
            </TouchableOpacity>
            {['en_route', 'in_progress', 'IN_PROGRESS'].includes(request.status) && (
              <TouchableOpacity
                style={[styles.actionButton, styles.trackButton]}
                onPress={() => router.push(`/track/${request.id}`)}
              >
                <Ionicons name="location" size={20} color={colors.white} />
                <Text style={[styles.actionButtonText, { color: colors.white }]}>Track</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Resolution/Notes */}
      {request.resolution && (
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Resolution</Text>
          <Text style={[styles.resolutionText, dynamicStyles.textMuted]}>{request.resolution}</Text>
        </View>
      )}

      {/* Cancel Button */}
      {['pending', 'confirmed', 'assigned', 'NEW', 'ASSIGNED'].includes(request.status) && (
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.md,
  },
  errorTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  statusText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  card: {
    margin: spacing.lg,
    marginBottom: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  requestNumberBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  requestNumberText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  requestTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  requestDescription: {
    fontSize: fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  technicianAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  technicianDetails: {
    flex: 1,
  },
  technicianName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  technicianPhone: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
    gap: spacing.xs,
  },
  trackButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  resolutionText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  cancelButton: {
    margin: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
