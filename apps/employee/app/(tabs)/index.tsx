import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Switch, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { getMyJobs, getStatusInfo, getPriorityInfo } from '../../src/services/jobService';
import type { WorkOrder } from '../../src/types';

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<WorkOrder[]>([]);
  const [stats, setStats] = useState({
    todayJobs: 0,
    completedToday: 0,
    activeJobs: 0,
    pendingJobs: 0,
  });

  // Get user display info
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Technician' : 'Technician';
  const userInitial = userName.charAt(0).toUpperCase();

  // Helper to format Bahrain-style address
  const formatBahrainAddress = (job: WorkOrder): string => {
    const sr = job.serviceRequest;

    // Try Unit -> Building -> Block/Road/Area (new architecture)
    if (sr?.unit?.building) {
      const building = sr.unit.building;
      const parts: string[] = [];

      if (sr.unit.flatNumber) parts.push(`Flat ${sr.unit.flatNumber}`);
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

      if (prop.unit) parts.push(`Flat ${prop.unit}`);
      if (prop.building) parts.push(`Bldg ${prop.building}`);
      const areaName = prop.areaRef?.name || prop.areaName;
      if (areaName) parts.push(areaName);

      if (parts.length > 0) return parts.join(', ');
      if (prop.address) return prop.address;
    }

    // Try work order property
    if (job.property?.address) return job.property.address;

    // Fallback to zone name
    return sr?.zone?.name || 'Location TBD';
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
      const response = await getMyJobs({ limit: 50 });
      const allJobs = response.data || [];
      setJobs(allJobs);

      // Calculate stats
      const today = new Date().toDateString();
      const todayJobs = allJobs.filter(j => {
        const jobDate = j.scheduledDate ? new Date(j.scheduledDate).toDateString() : null;
        return jobDate === today;
      });
      const completedToday = allJobs.filter(j => {
        const completedDate = j.completedAt ? new Date(j.completedAt).toDateString() : null;
        return completedDate === today && j.status === 'COMPLETED';
      });
      const activeJobs = allJobs.filter(j => ['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(j.status));
      const pendingJobs = allJobs.filter(j => ['PENDING', 'SCHEDULED', 'CONFIRMED'].includes(j.status));

      setStats({
        todayJobs: todayJobs.length || allJobs.length,
        completedToday: completedToday.length,
        activeJobs: activeJobs.length,
        pendingJobs: pendingJobs.length,
      });
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs();
  }, []);

  // Get next job (first pending/scheduled job or first active job)
  const nextJob = jobs.find(j => ['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(j.status))
    || jobs.find(j => ['PENDING', 'SCHEDULED', 'CONFIRMED'].includes(j.status));

  return (
    <ScrollView
      style={[styles.container, dynamicStyles.container]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          <View>
            <Text style={[styles.welcomeText, dynamicStyles.textMuted]}>{getGreeting()},</Text>
            <Text style={[styles.nameText, dynamicStyles.text]}>{userName}</Text>
          </View>
        </View>
        <View style={styles.statusToggle}>
          <Text style={[styles.statusLabel, { color: isOnline ? colors.primary : colors.textMuted }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: colors.border, true: colors.primary + '60' }}
            thumbColor={isOnline ? colors.primary : colors.textMuted}
          />
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, dynamicStyles.card]}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="briefcase" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, dynamicStyles.text]}>{stats.todayJobs}</Text>
          <Text style={[styles.statLabel, dynamicStyles.textMuted]}>Total Jobs</Text>
        </View>
        <View style={[styles.statCard, dynamicStyles.card]}>
          <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
          <Text style={[styles.statValue, dynamicStyles.text]}>{stats.completedToday}</Text>
          <Text style={[styles.statLabel, dynamicStyles.textMuted]}>Completed</Text>
        </View>
        <View style={[styles.statCard, dynamicStyles.card]}>
          <View style={[styles.statIcon, { backgroundColor: colors.info + '20' }]}>
            <Ionicons name="construct" size={20} color={colors.info} />
          </View>
          <Text style={[styles.statValue, dynamicStyles.text]}>{stats.activeJobs}</Text>
          <Text style={[styles.statLabel, dynamicStyles.textMuted]}>Active</Text>
        </View>
        <View style={[styles.statCard, dynamicStyles.card]}>
          <View style={[styles.statIcon, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="time" size={20} color={colors.warning} />
          </View>
          <Text style={[styles.statValue, dynamicStyles.text]}>{stats.pendingJobs}</Text>
          <Text style={[styles.statLabel, dynamicStyles.textMuted]}>Pending</Text>
        </View>
      </View>

      {/* Next Job Card */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Next Job</Text>
        {isLoading ? (
          <View style={[styles.loadingCard, dynamicStyles.card]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, dynamicStyles.textMuted]}>Loading jobs...</Text>
          </View>
        ) : nextJob ? (
          <TouchableOpacity
            style={[styles.nextJobCard, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/job/${nextJob.id}`)}
          >
            <View style={styles.nextJobHeader}>
              <View style={styles.nextJobInfo}>
                <Text style={styles.nextJobTitle}>{nextJob.title || nextJob.serviceRequest?.title || 'Work Order'}</Text>
                <Text style={styles.nextJobCustomer}>
                  {nextJob.customer?.firstName || nextJob.serviceRequest?.customer?.firstName}{' '}
                  {nextJob.customer?.lastName || nextJob.serviceRequest?.customer?.lastName}
                </Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityInfo(nextJob.priority).color + '40' }]}>
                <Text style={styles.priorityText}>{nextJob.priority}</Text>
              </View>
            </View>

            <View style={styles.nextJobDetails}>
              <View style={styles.nextJobDetail}>
                <Ionicons name="location" size={16} color={colors.white} />
                <Text style={styles.nextJobDetailText} numberOfLines={2}>
                  {formatBahrainAddress(nextJob)}
                </Text>
              </View>
              <View style={styles.nextJobDetail}>
                <Ionicons name="calendar" size={16} color={colors.white} />
                <Text style={styles.nextJobDetailText}>
                  {nextJob.scheduledDate
                    ? new Date(nextJob.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    : 'Not scheduled'}
                  {nextJob.scheduledDate && ` at ${new Date(nextJob.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                </Text>
              </View>
              <View style={styles.nextJobDetail}>
                <Ionicons name="document-text" size={16} color={colors.white} />
                <Text style={styles.nextJobDetailText}>
                  {nextJob.serviceRequest?.requestNo || nextJob.workOrderNo}
                </Text>
              </View>
            </View>

            <View style={styles.nextJobFooter}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusInfo(nextJob.status).color + '40' }]}>
                <Text style={styles.statusBadgeText}>{getStatusInfo(nextJob.status).label}</Text>
              </View>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => router.push(`/job/${nextJob.id}`)}
              >
                <Ionicons name="arrow-forward" size={18} color={colors.primary} />
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.emptyCard, dynamicStyles.card]}>
            <Ionicons name="checkmark-done-circle" size={48} color={colors.success} />
            <Text style={[styles.emptyTitle, dynamicStyles.text]}>All caught up!</Text>
            <Text style={[styles.emptySubtitle, dynamicStyles.textMuted]}>No pending jobs at the moment</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionCard, dynamicStyles.card]} onPress={() => router.push('/(tabs)/jobs')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="list" size={24} color={colors.info} />
            </View>
            <Text style={[styles.actionLabel, dynamicStyles.text]}>All Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, dynamicStyles.card]} onPress={() => router.push('/(tabs)/schedule')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="calendar" size={24} color={colors.secondary} />
            </View>
            <Text style={[styles.actionLabel, dynamicStyles.text]}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, dynamicStyles.card]} onPress={() => router.push('/(tabs)/profile')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="person" size={24} color={colors.warning} />
            </View>
            <Text style={[styles.actionLabel, dynamicStyles.text]}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, dynamicStyles.card]}>
            <View style={[styles.actionIcon, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="help-circle" size={24} color={colors.error} />
            </View>
            <Text style={[styles.actionLabel, dynamicStyles.text]}>Support</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  welcomeText: {
    fontSize: fontSize.sm,
  },
  nameText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  section: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  loadingCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: fontSize.sm,
  },
  emptyCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
  },
  nextJobCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  nextJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  nextJobInfo: {
    flex: 1,
  },
  nextJobTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  nextJobCustomer: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  priorityText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  nextJobDetails: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  nextJobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nextJobDetailText: {
    color: colors.white,
    fontSize: fontSize.sm,
    opacity: 0.9,
    flex: 1,
  },
  nextJobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.white + '30',
    paddingTop: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  viewButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    width: '47%',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
