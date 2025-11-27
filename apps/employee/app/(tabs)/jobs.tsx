import { View, Text, FlatList, TouchableOpacity, StyleSheet, useColorScheme, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';

interface Job {
  id: string;
  title: string;
  customerName: string;
  address: string;
  scheduledTime: string;
  category: string;
  status: 'pending' | 'accepted' | 'en_route' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: string;
}

const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'AC Repair',
    customerName: 'Ahmed Al-Rashid',
    address: 'Villa 23, Palm Jumeirah',
    scheduledTime: '10:00 AM',
    category: 'hvac',
    status: 'accepted',
    priority: 'high',
    estimatedDuration: '2 hours',
  },
  {
    id: '2',
    title: 'Plumbing Fix',
    customerName: 'Fatima Hassan',
    address: 'Apt 1204, Marina Tower',
    scheduledTime: '1:00 PM',
    category: 'plumbing',
    status: 'pending',
    priority: 'medium',
    estimatedDuration: '1 hour',
  },
  {
    id: '3',
    title: 'Electrical Outlet',
    customerName: 'Mohammed Khalid',
    address: 'Villa 45, Emirates Hills',
    scheduledTime: '4:00 PM',
    category: 'electrical',
    status: 'pending',
    priority: 'low',
    estimatedDuration: '45 min',
  },
  {
    id: '4',
    title: 'Water Heater Service',
    customerName: 'Sarah Al-Mahmoud',
    address: 'Apt 508, JBR Walk',
    scheduledTime: '6:00 PM',
    category: 'plumbing',
    status: 'pending',
    priority: 'medium',
    estimatedDuration: '1.5 hours',
  },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', icon: 'time' },
  accepted: { label: 'Accepted', color: '#3b82f6', icon: 'checkmark-circle' },
  en_route: { label: 'En Route', color: '#06b6d4', icon: 'navigate' },
  in_progress: { label: 'In Progress', color: '#10b981', icon: 'construct' },
  completed: { label: 'Completed', color: '#22c55e', icon: 'checkmark-done' },
};

const CATEGORY_ICONS: Record<string, string> = {
  plumbing: 'water',
  electrical: 'flash',
  hvac: 'snow',
  appliance: 'tv',
  cleaning: 'sparkles',
  general: 'construct',
};

const PRIORITY_COLORS = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#dc2626',
};

export default function JobsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  const filteredJobs = MOCK_JOBS.filter((job) => {
    if (filter === 'pending') return job.status === 'pending';
    if (filter === 'active') return ['accepted', 'en_route', 'in_progress'].includes(job.status);
    return true;
  });

  const renderJob = ({ item }: { item: Job }) => {
    const statusConfig = STATUS_CONFIG[item.status];
    const categoryIcon = CATEGORY_ICONS[item.category] || 'construct';

    return (
      <TouchableOpacity
        style={[styles.jobCard, dynamicStyles.card]}
        onPress={() => router.push(`/job/${item.id}`)}
      >
        <View style={styles.jobHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name={categoryIcon as any} size={20} color={colors.primary} />
          </View>
          <View style={styles.jobInfo}>
            <View style={styles.jobTitleRow}>
              <Text style={[styles.jobTitle, dynamicStyles.text]}>{item.title}</Text>
              <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[item.priority] }]} />
            </View>
            <Text style={[styles.customerName, dynamicStyles.textMuted]}>{item.customerName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>

        <View style={styles.jobDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={isDark ? colors.textMutedDark : colors.textMuted} />
            <Text style={[styles.detailText, dynamicStyles.textMuted]} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={isDark ? colors.textMutedDark : colors.textMuted} />
            <Text style={[styles.detailText, dynamicStyles.textMuted]}>
              {item.scheduledTime} • Est. {item.estimatedDuration}
            </Text>
          </View>
        </View>

        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.rejectButton, dynamicStyles.card]}>
              <Text style={styles.rejectText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton}>
              <Text style={styles.acceptText}>Accept Job</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'accepted' && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push(`/navigate/${item.id}`)}
          >
            <Ionicons name="navigate" size={18} color={colors.white} />
            <Text style={styles.startButtonText}>Start Navigation</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'pending', 'active'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Active'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredJobs}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color={isDark ? colors.textMutedDark : colors.textMuted} />
            <Text style={[styles.emptyTitle, dynamicStyles.text]}>No jobs found</Text>
            <Text style={[styles.emptySubtitle, dynamicStyles.textMuted]}>
              New jobs will appear here when assigned
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '10',
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  filterTextActive: {
    color: colors.white,
  },
  listContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  jobCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  jobTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  customerName: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  jobDetails: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  rejectText: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  acceptButton: {
    flex: 2,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  acceptText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  startButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});
