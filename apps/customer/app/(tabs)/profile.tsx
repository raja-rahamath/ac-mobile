import { View, Text, ScrollView, TouchableOpacity, Pressable, StyleSheet, useColorScheme, Switch, Alert, Platform, Modal } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { getMyProperties } from '../../src/services/propertyService';

// Coming Soon Modal Component
interface ComingSoonModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  isDark: boolean;
}

function ComingSoonModal({ visible, title, onClose, isDark }: ComingSoonModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.container, { backgroundColor: isDark ? colors.cardDark : colors.card }]}>
          <View style={modalStyles.iconContainer}>
            <Ionicons name="construct" size={48} color={colors.primary} />
          </View>
          <Text style={[modalStyles.title, { color: isDark ? colors.textDark : colors.text }]}>
            {title}
          </Text>
          <Text style={[modalStyles.message, { color: isDark ? colors.textMutedDark : colors.textMuted }]}>
            This feature is coming soon!{'\n'}We're working hard to bring it to you.
          </Text>
          <Pressable
            style={({ pressed }) => [modalStyles.button, pressed && modalStyles.buttonPressed]}
            onPress={onClose}
          >
            <Text style={modalStyles.buttonText}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// Language Selection Modal Component
interface LanguageModalProps {
  visible: boolean;
  selectedLanguage: string;
  onSelect: (language: string) => void;
  onClose: () => void;
  isDark: boolean;
}

function LanguageModal({ visible, selectedLanguage, onSelect, onClose, isDark }: LanguageModalProps) {
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية (Arabic)' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.container, { backgroundColor: isDark ? colors.cardDark : colors.card }]}>
          <Text style={[modalStyles.title, { color: isDark ? colors.textDark : colors.text }]}>
            Select Language
          </Text>
          <View style={modalStyles.languageList}>
            {languages.map((lang) => (
              <Pressable
                key={lang.code}
                style={({ pressed }) => [
                  modalStyles.languageItem,
                  pressed && modalStyles.languageItemPressed,
                  { borderColor: isDark ? colors.borderDark : colors.border },
                  selectedLanguage === lang.code && { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
                ]}
                onPress={() => onSelect(lang.code)}
              >
                <Text style={[
                  modalStyles.languageText,
                  { color: isDark ? colors.textDark : colors.text },
                  selectedLanguage === lang.code && { color: colors.primary, fontWeight: '600' },
                ]}>
                  {lang.label}
                </Text>
                {selectedLanguage === lang.code && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [modalStyles.button, pressed && modalStyles.buttonPressed]}
            onPress={onClose}
          >
            <Text style={modalStyles.buttonText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// Signout Confirmation Modal Component
interface SignoutModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDark: boolean;
}

function SignoutModal({ visible, onConfirm, onCancel, isDark }: SignoutModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.container, { backgroundColor: isDark ? colors.cardDark : colors.card }]}>
          <View style={[modalStyles.iconContainer, { backgroundColor: colors.error + '15' }]}>
            <Ionicons name="log-out" size={48} color={colors.error} />
          </View>
          <Text style={[modalStyles.title, { color: isDark ? colors.textDark : colors.text }]}>
            Sign Out
          </Text>
          <Text style={[modalStyles.message, { color: isDark ? colors.textMutedDark : colors.textMuted }]}>
            Are you sure you want to sign out of your account?
          </Text>
          <View style={modalStyles.buttonRow}>
            <Pressable
              style={({ pressed }) => [modalStyles.cancelButton, pressed && modalStyles.buttonPressed, { borderColor: isDark ? colors.borderDark : colors.border }]}
              onPress={onCancel}
            >
              <Text style={[modalStyles.cancelButtonText, { color: isDark ? colors.textDark : colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [modalStyles.signoutButton, pressed && modalStyles.buttonPressed]}
              onPress={onConfirm}
            >
              <Text style={modalStyles.signoutButtonText}>Sign Out</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    minWidth: 120,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  languageList: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  languageItemPressed: {
    opacity: 0.7,
  },
  languageText: {
    fontSize: fontSize.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  signoutButton: {
    flex: 1,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  signoutButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
});

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
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
        { cursor: 'pointer' } as any,
      ]}
      onPress={onPress}
      disabled={showSwitch && !onPress}
    >
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
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(isDark);
  const [propertyCount, setPropertyCount] = useState<number | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  // Modal states
  const [comingSoonModal, setComingSoonModal] = useState({ visible: false, title: '' });
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [signoutModalVisible, setSignoutModalVisible] = useState(false);

  // Fetch property count when screen focuses
  useFocusEffect(
    useCallback(() => {
      const fetchPropertyCount = async () => {
        try {
          const props = await getMyProperties();
          setPropertyCount(props.length);
        } catch (error) {
          console.log('Failed to fetch property count:', error);
          setPropertyCount(0);
        }
      };
      fetchPropertyCount();
    }, [])
  );

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
    setSignoutModalVisible(true);
  };

  const confirmLogout = () => {
    setSignoutModalVisible(false);
    logout();
  };

  const showComingSoon = (feature: string) => {
    setComingSoonModal({ visible: true, title: feature });
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const copyEmailToClipboard = async () => {
    if (displayEmail) {
      await Clipboard.setStringAsync(displayEmail);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const handlePersonalInfo = () => {
    router.push('/profile/edit');
  };

  const handleMyProperties = () => {
    router.push('/property');
  };

  const handlePaymentMethods = () => {
    showComingSoon('Payment Methods');
  };

  const handleBillingHistory = () => {
    showComingSoon('Billing History');
  };

  const handleLanguage = () => {
    setLanguageModalVisible(true);
  };

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
  };

  const handleHelpCenter = () => {
    showComingSoon('Help Center');
  };

  const handleContactSupport = () => {
    router.push('/chat');
  };

  const handleTerms = () => {
    showComingSoon('Terms of Service');
  };

  const handlePrivacy = () => {
    showComingSoon('Privacy Policy');
  };

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : 'User';
  const displayEmail = user?.email || '';
  const avatarLetter = user?.firstName?.charAt(0).toUpperCase() || 'U';

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
        <Text style={[styles.userName, dynamicStyles.text]}>
          {displayName}
        </Text>
        <View style={styles.emailContainer}>
          <Text style={[styles.userEmail, dynamicStyles.textMuted]}>{displayEmail}</Text>
          {displayEmail && (
            <Pressable
              style={({ pressed }) => [
                styles.copyButton,
                pressed && styles.copyButtonPressed,
              ]}
              onPress={copyEmailToClipboard}
            >
              <Ionicons
                name={emailCopied ? 'checkmark' : 'copy-outline'}
                size={16}
                color={emailCopied ? colors.success : (isDark ? colors.textMutedDark : colors.textMuted)}
              />
            </Pressable>
          )}
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.editButtonPressed,
            { cursor: 'pointer' } as any,
          ]}
          onPress={handleEditProfile}
        >
          <Ionicons name="pencil" size={16} color={colors.primary} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.textMuted]}>ACCOUNT</Text>
        <View style={[styles.menuCard, dynamicStyles.card]}>
          <MenuItem
            icon="person-outline"
            label="Personal Information"
            isDark={isDark}
            onPress={handlePersonalInfo}
          />
          <MenuItem
            icon="location-outline"
            label="My Properties"
            value={propertyCount !== null ? `${propertyCount} ${propertyCount === 1 ? 'property' : 'properties'}` : 'Loading...'}
            isDark={isDark}
            onPress={handleMyProperties}
          />
          <MenuItem
            icon="card-outline"
            label="Payment Methods"
            isDark={isDark}
            onPress={handlePaymentMethods}
          />
          <MenuItem
            icon="receipt-outline"
            label="Billing History"
            isDark={isDark}
            onPress={handleBillingHistory}
          />
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
          <MenuItem
            icon="language-outline"
            label="Language"
            value="English"
            isDark={isDark}
            onPress={handleLanguage}
          />
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.textMuted]}>SUPPORT</Text>
        <View style={[styles.menuCard, dynamicStyles.card]}>
          <MenuItem
            icon="help-circle-outline"
            label="Help Center"
            isDark={isDark}
            onPress={handleHelpCenter}
          />
          <MenuItem
            icon="chatbubble-outline"
            label="Contact Support"
            isDark={isDark}
            onPress={handleContactSupport}
          />
          <MenuItem
            icon="document-text-outline"
            label="Terms of Service"
            isDark={isDark}
            onPress={handleTerms}
          />
          <MenuItem
            icon="shield-outline"
            label="Privacy Policy"
            isDark={isDark}
            onPress={handlePrivacy}
          />
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

      {/* Modals */}
      <ComingSoonModal
        visible={comingSoonModal.visible}
        title={comingSoonModal.title}
        onClose={() => setComingSoonModal({ visible: false, title: '' })}
        isDark={isDark}
      />

      <LanguageModal
        visible={languageModalVisible}
        selectedLanguage={selectedLanguage}
        onSelect={handleLanguageSelect}
        onClose={() => setLanguageModalVisible(false)}
        isDark={isDark}
      />

      <SignoutModal
        visible={signoutModalVisible}
        onConfirm={confirmLogout}
        onCancel={() => setSignoutModalVisible(false)}
        isDark={isDark}
      />
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
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  copyButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  copyButtonPressed: {
    opacity: 0.6,
    backgroundColor: colors.border + '30',
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
  editButtonPressed: {
    opacity: 0.7,
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
  menuItemPressed: {
    opacity: 0.7,
    backgroundColor: colors.border + '30',
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
