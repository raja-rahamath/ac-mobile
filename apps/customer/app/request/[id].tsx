import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';

const MOCK_REQUEST = {
  id: '1',
  title: 'AC not cooling properly',
  description:
    'The air conditioner in the living room is not cooling properly. It makes a strange noise when starting up and the temperature never goes below 25°C even when set to 18°C.',
  category: 'hvac',
  status: 'in_progress',
  priority: 'high',
  propertyAddress: 'Villa 23, Palm Jumeirah, Dubai',
  scheduledDate: '2024-01-15T10:00:00Z',
  assignedTechnician: {
    id: 't1',
    name: 'Ahmed Hassan',
    phone: '+971501234567',
    rating: 4.8,
    specialties: ['HVAC', 'Refrigeration'],
  },
  createdAt: '2024-01-14T08:00:00Z',
  updatedAt: '2024-01-15T09:30:00Z',
  timeline: [
    { status: 'pending', timestamp: '2024-01-14T08:00:00Z', note: 'Request submitted' },
    { status: 'confirmed', timestamp: '2024-01-14T09:15:00Z', note: 'Request confirmed' },
    { status: 'assigned', timestamp: '2024-01-14T10:00:00Z', note: 'Assigned to Ahmed Hassan' },
    { status: 'en_route', timestamp: '2024-01-15T09:00:00Z', note: 'Technician is on the way' },
    { status: 'in_progress', timestamp: '2024-01-15T09:30:00Z', note: 'Work in progress' },
  ],
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', icon: 'time' },
  confirmed: { label: 'Confirmed', color: '#3b82f6', icon: 'checkmark-circle' },
  assigned: { label: 'Assigned', color: '#8b5cf6', icon: 'person' },
  en_route: { label: 'En Route', color: '#06b6d4', icon: 'navigate' },
  in_progress: { label: 'In Progress', color: '#10b981', icon: 'construct' },
  completed: { label: 'Completed', color: '#22c55e', icon: 'checkmark-done' },
  cancelled: { label: 'Cancelled', color: '#ef4444', icon: 'close-circle' },
};

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const request = MOCK_REQUEST;
  const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG];

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  const handleCall = () => {
    if (request.assignedTechnician?.phone) {
      Linking.openURL(`tel:${request.assignedTechnician.phone}`);
    }
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: statusConfig.color }]}>
        <Ionicons name={statusConfig.icon as any} size={24} color={colors.white} />
        <Text style={styles.statusText}>{statusConfig.label}</Text>
      </View>

      {/* Request Info */}
      <View style={[styles.card, dynamicStyles.card]}>
        <Text style={[styles.requestTitle, dynamicStyles.text]}>{request.title}</Text>
        <Text style={[styles.requestDescription, dynamicStyles.textMuted]}>{request.description}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text style={[styles.infoText, dynamicStyles.text]}>{request.propertyAddress}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={18} color={colors.primary} />
          <Text style={[styles.infoText, dynamicStyles.text]}>
            Scheduled:{' '}
            {new Date(request.scheduledDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="flag" size={18} color={request.priority === 'high' ? colors.error : colors.warning} />
          <Text
            style={[
              styles.infoText,
              { color: request.priority === 'high' ? colors.error : colors.warning },
            ]}
          >
            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
          </Text>
        </View>
      </View>

      {/* Technician Info */}
      {request.assignedTechnician && (
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Assigned Technician</Text>
          <View style={styles.technicianInfo}>
            <View style={styles.technicianAvatar}>
              <Text style={styles.avatarText}>{request.assignedTechnician.name.charAt(0)}</Text>
            </View>
            <View style={styles.technicianDetails}>
              <Text style={[styles.technicianName, dynamicStyles.text]}>
                {request.assignedTechnician.name}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.ratingText}>{request.assignedTechnician.rating}</Text>
                <Text style={[styles.specialties, dynamicStyles.textMuted]}>
                  • {request.assignedTechnician.specialties?.join(', ')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.trackButton]}
              onPress={() => router.push(`/track/${request.id}`)}
            >
              <Ionicons name="location" size={20} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Timeline */}
      <View style={[styles.card, dynamicStyles.card]}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Request Timeline</Text>
        <View style={styles.timeline}>
          {request.timeline.map((event, index) => {
            const eventStatus = STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG];
            const isLast = index === request.timeline.length - 1;

            return (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: eventStatus.color }]}>
                    <Ionicons name={eventStatus.icon as any} size={12} color={colors.white} />
                  </View>
                  {!isLast && <View style={[styles.timelineLine, dynamicStyles.card]} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineNote, dynamicStyles.text]}>{event.note}</Text>
                  <Text style={[styles.timelineTime, dynamicStyles.textMuted]}>
                    {new Date(event.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Cancel Button */}
      {['pending', 'confirmed', 'assigned'].includes(request.status) && (
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: '#f59e0b',
    fontWeight: fontWeight.medium,
  },
  specialties: {
    fontSize: fontSize.sm,
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
  timeline: {
    paddingLeft: spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 30,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: spacing.md,
  },
  timelineNote: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  timelineTime: {
    fontSize: fontSize.xs,
    marginTop: 2,
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
