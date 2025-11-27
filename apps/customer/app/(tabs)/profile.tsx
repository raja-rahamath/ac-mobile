import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Switch, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';

const MOCK_USER = {
  firstName: 'Ahmed',
  lastName: 'Al-Rashid',
  email: 'ahmed.rashid@email.com',
  phone: '+971 50 123 4567',
  avatar: 'A',
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(isDark);

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
          <Text style={styles.avatarText}>{MOCK_USER.avatar}</Text>
        </View>
        <Text style={[styles.userName, dynamicStyles.text]}>
          {MOCK_USER.firstName} {MOCK_USER.lastName}
        </Text>
        <Text style={[styles.userEmail, dynamicStyles.textMuted]}>{MOCK_USER.email}</Text>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={16} color={colors.primary} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.textMuted]}>ACCOUNT</Text>
        <View style={[styles.menuCard, dynamicStyles.card]}>
          <MenuItem icon="person-outline" label="Personal Information" isDark={isDark} />
          <MenuItem icon="location-outline" label="My Properties" value="3 properties" isDark={isDark} />
          <MenuItem icon="card-outline" label="Payment Methods" isDark={isDark} />
          <MenuItem icon="receipt-outline" label="Billing History" isDark={isDark} />
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.textMuted]}>PREFERENCES</Text>
        <View style={[styles.menuCard, dynamicStyles.card]}>
          <MenuItem
            icon="notifications-outline"
            label="Push Notifications"
            showSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={setNotificationsEnabled}
            isDark={isDark}
          />
          <MenuItem
            icon="moon-outline"
            label="Dark Mode"
            showSwitch
            switchValue={darkModeEnabled}
            onSwitchChange={setDarkModeEnabled}
            isDark={isDark}
          />
          <MenuItem icon="language-outline" label="Language" value="English" isDark={isDark} />
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.textMuted]}>SUPPORT</Text>
        <View style={[styles.menuCard, dynamicStyles.card]}>
          <MenuItem icon="help-circle-outline" label="Help Center" isDark={isDark} />
          <MenuItem icon="chatbubble-outline" label="Contact Support" isDark={isDark} />
          <MenuItem icon="document-text-outline" label="Terms of Service" isDark={isDark} />
          <MenuItem icon="shield-outline" label="Privacy Policy" isDark={isDark} />
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <View style={[styles.menuCard, dynamicStyles.card]}>
          <MenuItem icon="log-out-outline" label="Sign Out" danger onPress={handleLogout} isDark={isDark} />
        </View>
      </View>

      {/* App Version */}
      <Text style={[styles.versionText, dynamicStyles.textMuted]}>AgentCare v1.0.0</Text>

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
  userEmail: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    gap: spacing.xs,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
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
