import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATES = [22, 23, 24, 25, 26, 27, 28];

interface ScheduleItem {
  id: string;
  title: string;
  customer: string;
  time: string;
  duration: string;
  status: 'scheduled' | 'completed';
}

const MOCK_SCHEDULE: Record<number, ScheduleItem[]> = {
  24: [
    { id: '1', title: 'AC Repair', customer: 'Ahmed Al-Rashid', time: '10:00 AM', duration: '2h', status: 'scheduled' },
    { id: '2', title: 'Plumbing Fix', customer: 'Fatima Hassan', time: '1:00 PM', duration: '1h', status: 'scheduled' },
    { id: '3', title: 'Electrical Outlet', customer: 'Mohammed K.', time: '4:00 PM', duration: '45m', status: 'scheduled' },
    { id: '4', title: 'Water Heater', customer: 'Sarah M.', time: '6:00 PM', duration: '1.5h', status: 'scheduled' },
  ],
  25: [
    { id: '5', title: 'AC Maintenance', customer: 'Khalid Ibrahim', time: '9:00 AM', duration: '2h', status: 'scheduled' },
    { id: '6', title: 'Light Fixture', customer: 'Noura Q.', time: '12:00 PM', duration: '1h', status: 'scheduled' },
  ],
  23: [
    { id: '7', title: 'Drain Cleaning', customer: 'Omar Hassan', time: '11:00 AM', duration: '1h', status: 'completed' },
    { id: '8', title: 'AC Check', customer: 'Layla S.', time: '3:00 PM', duration: '1h', status: 'completed' },
  ],
};

export default function ScheduleScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedDate, setSelectedDate] = useState(24);

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  const scheduleItems = MOCK_SCHEDULE[selectedDate] || [];

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color={isDark ? colors.textDark : colors.text} />
        </TouchableOpacity>
        <Text style={[styles.monthText, dynamicStyles.text]}>January 2024</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={24} color={isDark ? colors.textDark : colors.text} />
        </TouchableOpacity>
      </View>

      {/* Week Selector */}
      <View style={styles.weekSelector}>
        {DAYS.map((day, index) => {
          const date = DATES[index];
          const isSelected = date === selectedDate;
          const hasJobs = MOCK_SCHEDULE[date]?.length > 0;

          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayCard, isSelected && styles.dayCardSelected]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayText, dynamicStyles.textMuted, isSelected && styles.dayTextSelected]}>
                {day}
              </Text>
              <Text style={[styles.dateText, dynamicStyles.text, isSelected && styles.dateTextSelected]}>
                {date}
              </Text>
              {hasJobs && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Schedule List */}
      <ScrollView style={styles.scheduleList} contentContainerStyle={styles.scheduleContent}>
        <Text style={[styles.scheduleTitle, dynamicStyles.text]}>
          {selectedDate === 24 ? "Today's Schedule" : `Schedule for Jan ${selectedDate}`}
        </Text>
        <Text style={[styles.jobCount, dynamicStyles.textMuted]}>
          {scheduleItems.length} job{scheduleItems.length !== 1 ? 's' : ''}
        </Text>

        {scheduleItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={isDark ? colors.textMutedDark : colors.textMuted} />
            <Text style={[styles.emptyTitle, dynamicStyles.text]}>No jobs scheduled</Text>
            <Text style={[styles.emptySubtitle, dynamicStyles.textMuted]}>
              You have no jobs for this day
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {scheduleItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.timelineItem}
                onPress={() => router.push(`/job/${item.id}`)}
              >
                <View style={styles.timeColumn}>
                  <Text style={[styles.timeText, dynamicStyles.text]}>{item.time}</Text>
                  <Text style={[styles.durationText, dynamicStyles.textMuted]}>{item.duration}</Text>
                </View>
                <View style={styles.lineColumn}>
                  <View style={[styles.timelineDot, item.status === 'completed' && styles.completedDot]} />
                  {index < scheduleItems.length - 1 && (
                    <View style={[styles.timelineLine, dynamicStyles.card]} />
                  )}
                </View>
                <View style={[styles.scheduleCard, dynamicStyles.card]}>
                  <View style={styles.scheduleCardHeader}>
                    <Text style={[styles.scheduleCardTitle, dynamicStyles.text]}>{item.title}</Text>
                    {item.status === 'completed' && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    )}
                  </View>
                  <Text style={[styles.scheduleCardCustomer, dynamicStyles.textMuted]}>
                    {item.customer}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
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
    justifyContent: 'space-between',
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
    minHeight: 80,
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
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  completedDot: {
    backgroundColor: colors.success,
    borderColor: colors.success,
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
  },
  scheduleCardCustomer: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
});
