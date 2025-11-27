import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Switch } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';

const MOCK_STATS = {
  todayJobs: 4,
  completedToday: 2,
  rating: 4.8,
  earnings: 850,
};

const MOCK_NEXT_JOB = {
  id: '1',
  title: 'AC Repair',
  customerName: 'Ahmed Al-Rashid',
  address: 'Villa 23, Palm Jumeirah',
  scheduledTime: '10:00 AM',
  priority: 'high',
  distance: '2.5 km',
  eta: '12 min',
};

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isOnline, setIsOnline] = useState(true);

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View>
            <Text style={[styles.welcomeText, dynamicStyles.textMuted]}>Good morning,</Text>
            <Text style={[styles.nameText, dynamicStyles.text]}>Ahmed Hassan</Text>
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
          <Text style={[styles.statValue, dynamicStyles.text]}>{MOCK_STATS.todayJobs}</Text>
          <Text style={[styles.statLabel, dynamicStyles.textMuted]}>Today's Jobs</Text>
        </View>
        <View style={[styles.statCard, dynamicStyles.card]}>
          <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
          <Text style={[styles.statValue, dynamicStyles.text]}>{MOCK_STATS.completedToday}</Text>
          <Text style={[styles.statLabel, dynamicStyles.textMuted]}>Completed</Text>
        </View>
        <View style={[styles.statCard, dynamicStyles.card]}>
          <View style={[styles.statIcon, { backgroundColor: '#f59e0b20' }]}>
            <Ionicons name="star" size={20} color="#f59e0b" />
          </View>
          <Text style={[styles.statValue, dynamicStyles.text]}>{MOCK_STATS.rating}</Text>
          <Text style={[styles.statLabel, dynamicStyles.textMuted]}>Rating</Text>
        </View>
        <View style={[styles.statCard, dynamicStyles.card]}>
          <View style={[styles.statIcon, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="cash" size={20} color={colors.secondary} />
          </View>
          <Text style={[styles.statValue, dynamicStyles.text]}>{MOCK_STATS.earnings}</Text>
          <Text style={[styles.statLabel, dynamicStyles.textMuted]}>AED Today</Text>
        </View>
      </View>

      {/* Next Job Card */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Next Job</Text>
        <TouchableOpacity
          style={[styles.nextJobCard, { backgroundColor: colors.primary }]}
          onPress={() => router.push(`/job/${MOCK_NEXT_JOB.id}`)}
        >
          <View style={styles.nextJobHeader}>
            <View style={styles.nextJobInfo}>
              <Text style={styles.nextJobTitle}>{MOCK_NEXT_JOB.title}</Text>
              <Text style={styles.nextJobCustomer}>{MOCK_NEXT_JOB.customerName}</Text>
            </View>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>High</Text>
            </View>
          </View>

          <View style={styles.nextJobDetails}>
            <View style={styles.nextJobDetail}>
              <Ionicons name="location" size={16} color={colors.white} />
              <Text style={styles.nextJobDetailText}>{MOCK_NEXT_JOB.address}</Text>
            </View>
            <View style={styles.nextJobDetail}>
              <Ionicons name="time" size={16} color={colors.white} />
              <Text style={styles.nextJobDetailText}>{MOCK_NEXT_JOB.scheduledTime}</Text>
            </View>
          </View>

          <View style={styles.nextJobFooter}>
            <View style={styles.etaContainer}>
              <Text style={styles.etaLabel}>{MOCK_NEXT_JOB.distance} • {MOCK_NEXT_JOB.eta} away</Text>
            </View>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => router.push(`/navigate/${MOCK_NEXT_JOB.id}`)}
            >
              <Ionicons name="navigate" size={18} color={colors.primary} />
              <Text style={styles.navigateButtonText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionCard, dynamicStyles.card]} onPress={() => router.push('/jobs')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="list" size={24} color={colors.info} />
            </View>
            <Text style={[styles.actionLabel, dynamicStyles.text]}>All Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, dynamicStyles.card]} onPress={() => router.push('/schedule')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="calendar" size={24} color={colors.secondary} />
            </View>
            <Text style={[styles.actionLabel, dynamicStyles.text]}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, dynamicStyles.card]}>
            <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="document-text" size={24} color={colors.warning} />
            </View>
            <Text style={[styles.actionLabel, dynamicStyles.text]}>Reports</Text>
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
  nextJobInfo: {},
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
    backgroundColor: colors.white + '30',
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
  },
  nextJobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.white + '30',
    paddingTop: spacing.md,
  },
  etaContainer: {},
  etaLabel: {
    color: colors.white,
    fontSize: fontSize.sm,
    opacity: 0.8,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  navigateButtonText: {
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
