import { View, Text, FlatList, TouchableOpacity, StyleSheet, useColorScheme, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';
import { getServiceRequests } from '../../src/services/requestService';
import type { ServiceRequest, ServiceStatus } from '../../src/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  // Lowercase statuses (legacy)
  pending: { label: 'Pending', color: '#f59e0b', icon: 'time-outline' },
  confirmed: { label: 'Confirmed', color: '#3b82f6', icon: 'checkmark-circle-outline' },
  assigned: { label: 'Assigned', color: '#8b5cf6', icon: 'person-outline' },
  en_route: { label: 'En Route', color: '#06b6d4', icon: 'navigate-outline' },
  in_progress: { label: 'In Progress', color: '#10b981', icon: 'construct-outline' },
  completed: { label: 'Completed', color: '#22c55e', icon: 'checkmark-done-outline' },
  cancelled: { label: 'Cancelled', color: '#ef4444', icon: 'close-circle-outline' },
  // Uppercase statuses (from API)
  NEW: { label: 'New', color: '#f59e0b', icon: 'time-outline' },
  ASSIGNED: { label: 'Assigned', color: '#8b5cf6', icon: 'person-outline' },
  IN_PROGRESS: { label: 'In Progress', color: '#10b981', icon: 'construct-outline' },
  ON_HOLD: { label: 'On Hold', color: '#6b7280', icon: 'pause-outline' },
  COMPLETED: { label: 'Completed', color: '#22c55e', icon: 'checkmark-done-outline' },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', icon: 'close-circle-outline' },
  CLOSED: { label: 'Closed', color: '#6b7280', icon: 'checkmark-done-outline' },
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
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setError(null);
      const response = await getServiceRequests(filter);
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load requests');
      setRequests([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setIsLoading(true);
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  const renderRequest = ({ item }: { item: ServiceRequest }) => {
    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
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
            {item.requestNo && (
              <Text style={[styles.requestNumber, { color: colors.primary }]}>{item.requestNo}</Text>
            )}
            <Text style={[styles.requestAddress, dynamicStyles.textMuted]} numberOfLines={1}>
              {item.propertyAddress || 'No address specified'}
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, dynamicStyles.textMuted]}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={64} color={isDark ? colors.textMutedDark : colors.textMuted} />
              <Text style={[styles.emptyTitle, dynamicStyles.text]}>
                {error ? 'Unable to load requests' : 'No requests found'}
              </Text>
              <Text style={[styles.emptySubtitle, dynamicStyles.textMuted]}>
                {error || 'Your service requests will appear here'}
              </Text>
              {error && (
                <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

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
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.md,
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
  requestNumber: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: 2,
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
    flex: 1,
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
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
