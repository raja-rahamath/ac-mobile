import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Switch, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';

const MOCK_TECHNICIAN = {
  name: 'Ahmed Hassan',
  email: 'ahmed.hassan@agentcare.com',
  phone: '+971 50 123 4567',
  employeeId: 'TECH-1234',
  rating: 4.8,
  totalJobs: 347,
  specialties: ['HVAC', 'Refrigeration', 'Plumbing'],
  joinedDate: 'March 2022',
};

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
  isDark: boolean;
}

function MenuItem({
  icon,
  label,
  value,
  showArrow = true,
  showSwitch,
  switchValue,
  onSwitchChange,
  onPress,
  danger,
  isDark,
}: MenuItemProps) {
  const dynamicStyles = {
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
  };

  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={showSwitch}>
      <View style={[styles.menuIcon, { backgroundColor: danger ? colors.error + '20' : colors.primary + '20' }]}>
        <Ionicons name={icon as any} size={20} color={danger ? colors.error : colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, dynamicStyles.text, danger && { color: colors.error }]}>{label}</Text>
        {value && <Text style={[styles.menuValue, dynamicStyles.textMuted]}>{value}</Text>}
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary + '60' }}
          thumbColor={switchValue ? colors.primary : colors.textMuted}
        />
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={20} color={isDark ? colors.textMutedDark : colors.textMuted} />
      ) : null}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [locationSharing, setLocationSharing] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => console.log('Logged out') },
    ]);
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{MOCK_TECHNICIAN.name.charAt(0)}</Text>
        </View>
        <Text style={[styles.userName, dynamicStyles.text]}>{MOCK_TECHNICIAN.name}</Text>
        <Text style={[styles.employeeId, dynamicStyles.textMuted]}>ID: {MOCK_TECHNICIAN.employeeId}</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="star" size={16} color="#f59e0b" />
            </View>
            <Text style={[styles.statValue, dynamicStyles.text]}>{MOCK_TECHNICIAN.rating}</Text>
            <Text style={[styles.statLabel, dynamicStyles.textMuted]}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="briefcase" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, dynamicStyles.text]}>{MOCK_TECHNICIAN.totalJobs}</Text>
            <Text style={[styles.statLabel, dynamicStyles.textMuted]}>Jobs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar" size={16} color={colors.secondary} />
            </View>
            <Text style={[styles.statValue, dynamicStyles.text]}>2y</Text>
            <Text style={[styles.statLabel, dynamicStyles.textMuted]}>Experience</Text>
          </View>
        </View>

        {/* Specialties */}
        <View style={styles.specialtiesContainer}>
          {MOCK_TECHNICIAN.specialties.map((specialty) => (
            <View key={specialty} style={[styles.specialtyBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.specialtyText, { color: colors.primary }]}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.textMuted]}>ACCOUNT</Text>
        <View style={[styles.menuCard, dynamicStyles.card]}>
          <MenuItem icon="person-outline" label="Personal Information" isDark={isDark} />
          <MenuItem icon="document-text-outline" label="Documents" isDark={isDark} />
          <MenuItem icon="card-outline" label="Payment & Earnings" isDark={isDark} />
          <MenuItem icon="trophy-outline" label="Performance" isDark={isDark} />
        </View>
      </View>

      {/* Work Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.textMuted]}>WORK SETTINGS</Text>
        <View style={[styles.menuCard, dynamicStyles.card]}>
          <MenuItem
            icon="location-outline"
            label="Location Sharing"
            showSwitch
            switchValue={locationSharing}
            onSwitchChange={setLocationSharing}
            isDark={isDark}
          />
          <MenuItem
            icon="notifications-outline"
            label="Job Notifications"
            showSwitch
            switchValue={notifications}
            onSwitchChange={setNotifications}
            isDark={isDark}
          />
          <MenuItem icon="time-outline" label="Working Hours" value="9 AM - 6 PM" isDark={isDark} />
          <MenuItem icon="map-outline" label="Service Areas" value="Dubai, Sharjah" isDark={isDark} />
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.textMuted]}>SUPPORT</Text>
        <View style={[styles.menuCard, dynamicStyles.card]}>
          <MenuItem icon="help-circle-outline" label="Help Center" isDark={isDark} />
          <MenuItem icon="chatbubble-outline" label="Contact Support" isDark={isDark} />
          <MenuItem icon="book-outline" label="Training Materials" isDark={isDark} />
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <View style={[styles.menuCard, dynamicStyles.card]}>
          <MenuItem icon="log-out-outline" label="Sign Out" danger onPress={handleLogout} isDark={isDark} />
        </View>
      </View>

      {/* App Version */}
      <Text style={[styles.versionText, dynamicStyles.textMuted]}>AgentCare Technician v1.0.0</Text>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  employeeId: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statIconContainer: {
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  specialtyBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  specialtyText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    letterSpacing: 0.5,
  },
  menuCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  menuValue: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  versionText: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
});
