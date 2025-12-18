import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';
import { getMyJobs, getStatusInfo } from '../../src/services/jobService';
import type { WorkOrder } from '../../src/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [jobs, setJobs] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  // Get current week dates
  const weekDates = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await getMyJobs({ limit: 100 });
      setJobs(response.data || []);
    } catch (err) {
      console.error('Error fetching schedule:', err);
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

  // Filter jobs for selected date
  const selectedDateStr = selectedDate.toDateString();
  const scheduleItems = jobs.filter(job => {
    if (!job.scheduledDate) return false;
    return new Date(job.scheduledDate).toDateString() === selectedDateStr;
  }).sort((a, b) => {
    if (!a.scheduledDate || !b.scheduledDate) return 0;
    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
  });

  // Check if any date has jobs
  const dateHasJobs = (date: Date) => {
    const dateStr = date.toDateString();
    return jobs.some(job => job.scheduledDate && new Date(job.scheduledDate).toDateString() === dateStr);
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatScheduleTitle = () => {
    if (isToday(selectedDate)) return "Today's Schedule";
    return `Schedule for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <Text style={[styles.monthText, dynamicStyles.text]}>{formatMonth(selectedDate)}</Text>
      </View>

      {/* Week Selector */}
      <View style={styles.weekSelector}>
        {weekDates.map((date) => {
          const dayIndex = date.getDay();
          const hasJobs = dateHasJobs(date);
          const selected = isSelected(date);
          const today = isToday(date);

          return (
            <TouchableOpacity
              key={date.toISOString()}
              style={[
                styles.dayCard,
                selected && styles.dayCardSelected,
                today && !selected && styles.dayCardToday,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayText, dynamicStyles.textMuted, selected && styles.dayTextSelected]}>
                {DAYS[dayIndex]}
              </Text>
              <Text style={[styles.dateText, dynamicStyles.text, selected && styles.dateTextSelected]}>
                {date.getDate()}
              </Text>
              {hasJobs && <View style={[styles.dot, selected && styles.dotSelected]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Schedule List */}
      <ScrollView
        style={styles.scheduleList}
        contentContainerStyle={styles.scheduleContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={[styles.scheduleTitle, dynamicStyles.text]}>{formatScheduleTitle()}</Text>
        <Text style={[styles.jobCount, dynamicStyles.textMuted]}>
          {scheduleItems.length} job{scheduleItems.length !== 1 ? 's' : ''}
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, dynamicStyles.textMuted]}>Loading schedule...</Text>
          </View>
        ) : scheduleItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={isDark ? colors.textMutedDark : colors.textMuted} />
            <Text style={[styles.emptyTitle, dynamicStyles.text]}>No jobs scheduled</Text>
            <Text style={[styles.emptySubtitle, dynamicStyles.textMuted]}>
              You have no jobs for this day
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {scheduleItems.map((item, index) => {
              const statusInfo = getStatusInfo(item.status);
              const customer = item.customer || item.serviceRequest?.customer;
              const customerName = customer
                ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                : 'Unknown';
              const time = item.scheduledDate
                ? new Date(item.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : 'TBD';
              const duration = item.estimatedDuration
                ? item.estimatedDuration >= 60
                  ? `${Math.floor(item.estimatedDuration / 60)}h ${item.estimatedDuration % 60}m`
                  : `${item.estimatedDuration}m`
                : 'TBD';
              const isCompleted = item.status === 'COMPLETED';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.timelineItem}
                  onPress={() => router.push(`/job/${item.id}`)}
                >
                  <View style={styles.timeColumn}>
                    <Text style={[styles.timeText, dynamicStyles.text]}>{time}</Text>
                    <Text style={[styles.durationText, dynamicStyles.textMuted]}>{duration}</Text>
                  </View>
                  <View style={styles.lineColumn}>
                    <View style={[styles.timelineDot, { backgroundColor: statusInfo.color, borderColor: statusInfo.color }]} />
                    {index < scheduleItems.length - 1 && (
                      <View style={[styles.timelineLine, dynamicStyles.card]} />
                    )}
                  </View>
                  <View style={[styles.scheduleCard, dynamicStyles.card]}>
                    <View style={styles.scheduleCardHeader}>
                      <Text style={[styles.scheduleCardTitle, dynamicStyles.text]} numberOfLines={1}>
                        {item.title || item.serviceRequest?.title || 'Work Order'}
                      </Text>
                      {isCompleted ? (
                        <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                      ) : (
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.scheduleCardCustomer, dynamicStyles.textMuted]}>
                      {customerName}
                    </Text>
                    <Text style={[styles.scheduleCardRef, dynamicStyles.textMuted]}>
                      {item.serviceRequest?.requestNo || item.workOrderNo}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  monthText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  weekSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  dayCardSelected: {
    backgroundColor: colors.primary,
  },
  dayCardToday: {
    backgroundColor: colors.primary + '20',
  },
  dayText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  dayTextSelected: {
    color: colors.white,
    opacity: 0.8,
  },
  dateText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xs,
  },
  dateTextSelected: {
    color: colors.white,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
  dotSelected: {
    backgroundColor: colors.white,
  },
  scheduleList: {
    flex: 1,
  },
  scheduleContent: {
    padding: spacing.lg,
  },
  scheduleTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  jobCount: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: fontSize.sm,
    marginTop: spacing.md,
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
  timeline: {},
  timelineItem: {
    flexDirection: 'row',
    minHeight: 90,
  },
  timeColumn: {
    width: 70,
    alignItems: 'flex-end',
    paddingRight: spacing.md,
  },
  timeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  durationText: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  lineColumn: {
    alignItems: 'center',
    width: 30,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  scheduleCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  scheduleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleCardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  scheduleCardCustomer: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  scheduleCardRef: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});
