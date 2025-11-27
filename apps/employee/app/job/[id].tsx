import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Linking, Alert } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';

const MOCK_JOB = {
  id: '1',
  title: 'AC Repair - Not Cooling',
  description:
    'The air conditioner in the living room is not cooling properly. Customer reports strange noise when starting and temperature never goes below 25°C.',
  category: 'hvac',
  customer: {
    name: 'Ahmed Al-Rashid',
    phone: '+971501234567',
    address: 'Villa 23, Palm Jumeirah, Dubai',
  },
  scheduledDate: '2024-01-15T10:00:00Z',
  estimatedDuration: '2 hours',
  priority: 'high',
  status: 'accepted',
  notes: 'Customer prefers service between 10 AM - 2 PM. Gate code: 1234',
  equipment: ['AC Unit', 'Refrigerant', 'Electrical Tools'],
  history: [
    { date: '2023-09-15', service: 'AC Maintenance', tech: 'Mohammed K.' },
    { date: '2023-03-22', service: 'Filter Replacement', tech: 'Omar H.' },
  ],
};

const STATUS_FLOW = ['accepted', 'en_route', 'arrived', 'in_progress', 'completed'];

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentStatus, setCurrentStatus] = useState(MOCK_JOB.status);

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
    Linking.openURL(`tel:${MOCK_JOB.customer.phone}`);
  };

  const handleUpdateStatus = () => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex < STATUS_FLOW.length - 1) {
      const nextStatus = STATUS_FLOW[currentIndex + 1];
      setCurrentStatus(nextStatus);
      Alert.alert('Status Updated', `Job status changed to: ${nextStatus.replace('_', ' ')}`);
    }
  };

  const getStatusButton = () => {
    switch (currentStatus) {
      case 'accepted':
        return { label: 'Start Route', icon: 'navigate' };
      case 'en_route':
        return { label: 'Arrived', icon: 'location' };
      case 'arrived':
        return { label: 'Start Work', icon: 'construct' };
      case 'in_progress':
        return { label: 'Complete Job', icon: 'checkmark-done' };
      default:
        return null;
    }
  };

  const statusButton = getStatusButton();

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView style={styles.scrollView}>
        {/* Status Progress */}
        <View style={[styles.statusProgress, dynamicStyles.card]}>
          {STATUS_FLOW.slice(0, -1).map((status, index) => {
            const currentIndex = STATUS_FLOW.indexOf(currentStatus);
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <View key={status} style={styles.statusStep}>
                <View
                  style={[
                    styles.statusDot,
                    isCompleted && styles.statusDotCompleted,
                    isCurrent && styles.statusDotCurrent,
                  ]}
                >
                  {isCompleted && <Ionicons name="checkmark" size={12} color={colors.white} />}
                </View>
                <Text
                  style={[
                    styles.statusLabel,
                    dynamicStyles.textMuted,
                    (isCompleted || isCurrent) && { color: colors.primary },
                  ]}
                >
                  {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                </Text>
                {index < STATUS_FLOW.length - 2 && (
                  <View style={[styles.statusLine, isCompleted && styles.statusLineCompleted]} />
                )}
              </View>
            );
          })}
        </View>

        {/* Job Info */}
        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, dynamicStyles.text]}>{MOCK_JOB.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.priorityText, { color: colors.error }]}>High Priority</Text>
            </View>
          </View>
          <Text style={[styles.description, dynamicStyles.textMuted]}>{MOCK_JOB.description}</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={18} color={colors.primary} />
              <Text style={[styles.detailText, dynamicStyles.text]}>
                {new Date(MOCK_JOB.scheduledDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <Text style={[styles.detailText, dynamicStyles.text]}>
                {new Date(MOCK_JOB.scheduledDate).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="hourglass" size={18} color={colors.primary} />
              <Text style={[styles.detailText, dynamicStyles.text]}>{MOCK_JOB.estimatedDuration}</Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Customer Information</Text>
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerAvatarText}>{MOCK_JOB.customer.name.charAt(0)}</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={[styles.customerName, dynamicStyles.text]}>{MOCK_JOB.customer.name}</Text>
              <Text style={[styles.customerPhone, dynamicStyles.textMuted]}>{MOCK_JOB.customer.phone}</Text>
            </View>
            <View style={styles.customerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
                <Ionicons name="call" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="chatbubble" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={[styles.addressText, dynamicStyles.text]}>{MOCK_JOB.customer.address}</Text>
          </View>

          <TouchableOpacity
            style={styles.navigateButton}
            onPress={() => router.push(`/navigate/${id}`)}
          >
            <Ionicons name="navigate" size={18} color={colors.white} />
            <Text style={styles.navigateButtonText}>Open Navigation</Text>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        {MOCK_JOB.notes && (
          <View style={[styles.card, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Notes</Text>
            <View style={[styles.notesBox, { backgroundColor: colors.warning + '10' }]}>
              <Ionicons name="warning" size={18} color={colors.warning} />
              <Text style={[styles.notesText, dynamicStyles.text]}>{MOCK_JOB.notes}</Text>
            </View>
          </View>
        )}

        {/* Equipment Needed */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Equipment Checklist</Text>
          {MOCK_JOB.equipment.map((item, index) => (
            <View key={index} style={styles.checklistItem}>
              <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
              <Text style={[styles.checklistText, dynamicStyles.text]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Service History */}
        <View style={[styles.card, dynamicStyles.card]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Service History</Text>
          {MOCK_JOB.history.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyDot} />
              <View style={styles.historyContent}>
                <Text style={[styles.historyService, dynamicStyles.text]}>{item.service}</Text>
                <Text style={[styles.historyMeta, dynamicStyles.textMuted]}>
                  {item.date} • {item.tech}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      {statusButton && currentStatus !== 'completed' && (
        <View style={[styles.bottomAction, dynamicStyles.card]}>
          <TouchableOpacity style={styles.mainActionButton} onPress={handleUpdateStatus}>
            <Ionicons name={statusButton.icon as any} size={20} color={colors.white} />
            <Text style={styles.mainActionText}>{statusButton.label}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  statusProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  statusStep: {
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDotCompleted: {
    backgroundColor: colors.primary,
  },
  statusDotCurrent: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.primary + '40',
  },
  statusLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statusLine: {
    position: 'absolute',
    top: 12,
    left: '60%',
    right: '-40%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: -1,
  },
  statusLineCompleted: {
    backgroundColor: colors.primary,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    flex: 1,
    paddingRight: spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  priorityText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  description: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerAvatarText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  customerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  customerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  customerPhone: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  customerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  addressText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  navigateButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  notesText: {
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  checklistText: {
    fontSize: fontSize.sm,
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: spacing.md,
  },
  historyContent: {
    flex: 1,
  },
  historyService: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  historyMeta: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  mainActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  mainActionText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
