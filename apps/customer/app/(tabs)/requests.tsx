import { View, Text, FlatList, TouchableOpacity, StyleSheet, useColorScheme, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';
import type { ServiceRequest, ServiceStatus } from '../../src/types';

const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: '1',
    title: 'AC not cooling',
    description: 'The air conditioner in the living room is not cooling properly',
    category: 'hvac',
    status: 'in_progress',
    priority: 'high',
    propertyAddress: 'Villa 23, Palm Jumeirah',
    scheduledDate: '2024-01-15T10:00:00Z',
    assignedTechnician: {
      id: 't1',
      name: 'Ahmed Hassan',
      rating: 4.8,
    },
    createdAt: '2024-01-14T08:00:00Z',
    updatedAt: '2024-01-14T12:00:00Z',
  },
  {
    id: '2',
    title: 'Leaking faucet',
    description: 'Kitchen sink faucet is dripping',
    category: 'plumbing',
    status: 'assigned',
    priority: 'medium',
    propertyAddress: 'Apt 1204, Marina Tower',
    scheduledDate: '2024-01-16T14:00:00Z',
    createdAt: '2024-01-13T15:00:00Z',
    updatedAt: '2024-01-13T16:00:00Z',
  },
];

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pending', color: '#f59e0b', icon: 'time-outline' },
  confirmed: { label: 'Confirmed', color: '#3b82f6', icon: 'checkmark-circle-outline' },
  assigned: { label: 'Assigned', color: '#8b5cf6', icon: 'person-outline' },
  en_route: { label: 'En Route', color: '#06b6d4', icon: 'navigate-outline' },
  in_progress: { label: 'In Progress', color: '#10b981', icon: 'construct-outline' },
  completed: { label: 'Completed', color: '#22c55e', icon: 'checkmark-done-outline' },
  cancelled: { label: 'Cancelled', color: '#ef4444', icon: 'close-circle-outline' },
};

const CATEGORY_ICONS: Record<string, string> = {
  plumbing: 'water',
  electrical: 'flash',
  hvac: 'snow',
  appliance: 'tv',
  cleaning: 'sparkles',
  general: 'construct',
  pest_control: 'bug',
  landscaping: 'leaf',
};

export default function RequestsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

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

  const filteredRequests = MOCK_REQUESTS.filter((req) => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(req.status);
    if (filter === 'completed') return req.status === 'completed';
    return true;
  });

  const renderRequest = ({ item }: { item: ServiceRequest }) => {
    const statusConfig = STATUS_CONFIG[item.status];
    const categoryIcon = CATEGORY_ICONS[item.category] || 'construct';

    return (
      <TouchableOpacity
        style={[styles.requestCard, dynamicStyles.card]}
        onPress={() => router.push(`/request/${item.id}`)}
      >
        <View style={styles.requestHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name={categoryIcon as any} size={20} color={colors.primary} />
          </View>
          <View style={styles.requestInfo}>
            <Text style={[styles.requestTitle, dynamicStyles.text]}>{item.title}</Text>
            <Text style={[styles.requestAddress, dynamicStyles.textMuted]} numberOfLines={1}>
              {item.propertyAddress}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>

        {item.assignedTechnician && (
          <View style={styles.technicianRow}>
            <Ionicons name="person" size={16} color={isDark ? colors.textMutedDark : colors.textMuted} />
            <Text style={[styles.technicianName, dynamicStyles.textMuted]}>
              {item.assignedTechnician.name}
            </Text>
            {item.assignedTechnician.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.ratingText}>{item.assignedTechnician.rating}</Text>
              </View>
            )}
          </View>
        )}

        {item.scheduledDate && (
          <View style={styles.scheduleRow}>
            <Ionicons name="calendar" size={16} color={isDark ? colors.textMutedDark : colors.textMuted} />
            <Text style={[styles.scheduleText, dynamicStyles.textMuted]}>
              {new Date(item.scheduledDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}

        {['en_route', 'in_progress'].includes(item.status) && (
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => router.push(`/track/${item.id}`)}
          >
            <Ionicons name="location" size={16} color={colors.white} />
            <Text style={styles.trackButtonText}>Track Technician</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'active', 'completed'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color={isDark ? colors.textMutedDark : colors.textMuted} />
            <Text style={[styles.emptyTitle, dynamicStyles.text]}>No requests found</Text>
            <Text style={[styles.emptySubtitle, dynamicStyles.textMuted]}>
              Your service requests will appear here
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/request/new')}>
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
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
    paddingBottom: 100,
  },
  requestCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  requestHeader: {
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
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  requestAddress: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  technicianRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  technicianName: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: '#f59e0b',
    fontWeight: fontWeight.medium,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  scheduleText: {
    fontSize: fontSize.sm,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  trackButtonText: {
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
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
