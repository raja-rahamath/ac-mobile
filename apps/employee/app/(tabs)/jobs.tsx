import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';
import { getMyJobs, getStatusInfo, getPriorityInfo, startRoute } from '../../src/services/jobService';
import { useAuth } from '../../src/contexts/AuthContext';
import type { WorkOrder, WorkOrderStatus, JobFilter } from '../../src/types';

const CATEGORY_ICONS: Record<string, string> = {
  Plumbing: 'water',
  plumbing: 'water',
  Electrical: 'flash',
  electrical: 'flash',
  HVAC: 'snow',
  hvac: 'snow',
  'AC Maintenance': 'snow',
  Appliance: 'tv',
  appliance: 'tv',
  Cleaning: 'sparkles',
  cleaning: 'cleaning',
  General: 'construct',
  general: 'construct',
  'General Maintenance': 'construct',
};

export default function JobsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const employeeId = user?.employee?.id;
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<JobFilter>('all');
  const [jobs, setJobs] = useState<WorkOrder[]>([]);
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

  const fetchJobs = async () => {
    try {
      setError(null);

      // Determine status filter based on selected tab
      let statusFilter: WorkOrderStatus[] | undefined;
      if (filter === 'pending') {
        statusFilter = ['PENDING', 'SCHEDULED', 'CONFIRMED'];
      } else if (filter === 'active') {
        statusFilter = ['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'ON_HOLD'];
      } else if (filter === 'completed') {
        statusFilter = ['COMPLETED'];
      }

      const response = await getMyJobs({
        status: statusFilter,
        limit: 50,
      });

      setJobs(response.data || []);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to load jobs');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch jobs on mount and when filter changes
  useEffect(() => {
    setIsLoading(true);
    fetchJobs();
  }, [filter]);

  // Refresh jobs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [filter])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs();
  }, [filter]);

  const handleStartRoute = async (job: WorkOrder) => {
    if (!employeeId) {
      console.error('Employee ID not found');
      return;
    }
    try {
      await startRoute(job.id, { employeeId });
      // Refresh the list
      fetchJobs();
      // Navigate to job detail
      router.push(`/job/${job.id}`);
    } catch (err: any) {
      console.error('Error starting route:', err);
    }
  };

  const filteredJobs = jobs;

  const renderJob = ({ item }: { item: WorkOrder }) => {
    const statusInfo = getStatusInfo(item.status);
    const priorityInfo = getPriorityInfo(item.priority);
    const categoryIcon =
      CATEGORY_ICONS[item.serviceRequest?.complaintType?.name || ''] || 'construct';

    // Get customer info from work order or service request
    const customer = item.customer || item.serviceRequest?.customer;
    const customerName = customer
      ? customer.customerType === 'ORGANIZATION'
        ? customer.orgName
        : `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
      : 'Unknown Customer';

    // Get Bahrain-format address (Building, Road, Block, Area)
    const formatBahrainAddress = () => {
      const sr = item.serviceRequest;

      // Try Unit -> Building -> Block/Road/Area (new architecture)
      if (sr?.unit?.building) {
        const building = sr.unit.building;
        const parts: string[] = [];

        if (building.buildingNo) parts.push(`Bldg ${building.buildingNo}`);
        if (building.road?.roadNo) parts.push(`Rd ${building.road.roadNo}`);
        if (building.block?.blockNo) parts.push(`Blk ${building.block.blockNo}`);

        const areaName = building.area?.name || building.block?.area?.name;
        if (areaName) parts.push(areaName);

        if (parts.length > 0) return parts.join(', ');
      }

      // Try legacy Property model
      if (sr?.property) {
        const prop = sr.property;
        const parts: string[] = [];

        if (prop.building) parts.push(`Bldg ${prop.building}`);
        const areaName = prop.areaRef?.name || prop.areaName;
        if (areaName) parts.push(areaName);

        if (parts.length > 0) return parts.join(', ');
        if (prop.address) return prop.address;
      }

      // Try work order property
      if (item.property?.address) return item.property.address;

      // Fallback to zone name
      return sr?.zone?.name || 'Location TBD';
    };

    const address = formatBahrainAddress();

    // Show full date and time
    const scheduledDateTime = item.scheduledDate
      ? `${new Date(item.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${new Date(item.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
      : 'Not scheduled';

    const estimatedDuration = item.estimatedDuration
      ? item.estimatedDuration >= 60
        ? `${Math.floor(item.estimatedDuration / 60)}h ${item.estimatedDuration % 60}m`
        : `${item.estimatedDuration}m`
      : 'TBD';

    // Show service request number instead of work order number
    const requestNo = item.serviceRequest?.requestNo || item.workOrderNo;

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
              <Text style={[styles.jobTitle, dynamicStyles.text]} numberOfLines={1}>
                {item.title || item.serviceRequest?.title || 'Work Order'}
              </Text>
              <View style={[styles.priorityDot, { backgroundColor: priorityInfo.color }]} />
            </View>
            <Text style={[styles.customerName, dynamicStyles.textMuted]}>{customerName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.jobDetails}>
          <View style={styles.detailRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={isDark ? colors.textMutedDark : colors.textMuted}
            />
            <Text style={[styles.detailText, dynamicStyles.textMuted]} numberOfLines={1}>
              {address}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={isDark ? colors.textMutedDark : colors.textMuted}
            />
            <Text style={[styles.detailText, dynamicStyles.textMuted]}>
              {scheduledDateTime} • Est. {estimatedDuration}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="document-text-outline"
              size={16}
              color={isDark ? colors.textMutedDark : colors.textMuted}
            />
            <Text style={[styles.detailText, dynamicStyles.textMuted]}>{requestNo}</Text>
          </View>
        </View>

        {/* Action buttons based on status */}
        {(item.status === 'PENDING' || item.status === 'SCHEDULED' || item.status === 'CONFIRMED') && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => handleStartRoute(item)}
          >
            <Ionicons name="navigate" size={18} color={colors.white} />
            <Text style={styles.startButtonText}>Start Navigation</Text>
          </TouchableOpacity>
        )}

        {item.status === 'EN_ROUTE' && (
          <View style={styles.enRouteInfo}>
            <Ionicons name="car" size={18} color={colors.primary} />
            <Text style={[styles.enRouteText, { color: colors.primary }]}>
              Traveling to location...
            </Text>
          </View>
        )}

        {item.status === 'IN_PROGRESS' && (
          <View style={styles.inProgressInfo}>
            <Ionicons name="construct" size={18} color={colors.success} />
            <Text style={[styles.inProgressText, { color: colors.success }]}>Work in progress</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading && jobs.length === 0) {
    return (
      <View style={[styles.loadingContainer, dynamicStyles.container]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.textMuted]}>Loading jobs...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'pending', 'active', 'completed'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all'
                ? 'All'
                : f === 'pending'
                ? 'Pending'
                : f === 'active'
                ? 'Active'
                : 'Done'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredJobs}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="briefcase-outline"
              size={64}
              color={isDark ? colors.textMutedDark : colors.textMuted}
            />
            <Text style={[styles.emptyTitle, dynamicStyles.text]}>No jobs found</Text>
            <Text style={[styles.emptySubtitle, dynamicStyles.textMuted]}>
              {filter === 'all'
                ? 'New jobs will appear here when assigned'
                : filter === 'pending'
                ? 'No pending jobs'
                : filter === 'active'
                ? 'No jobs in progress'
                : 'No completed jobs'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '15',
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: fontSize.sm,
  },
  retryText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
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
    flex: 1,
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
  enRouteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.md,
  },
  enRouteText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  inProgressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.success + '10',
    borderRadius: borderRadius.md,
  },
  inProgressText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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
    textAlign: 'center',
  },
});
