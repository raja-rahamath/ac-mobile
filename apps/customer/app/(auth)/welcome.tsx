import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

const TRUST_STATS = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '4.8', label: 'App Rating', icon: 'star' },
  { value: '2K+', label: 'Verified Pros' },
];

const SERVICE_ICONS = [
  { icon: 'water-outline', label: 'Plumbing' },
  { icon: 'flash-outline', label: 'Electrical' },
  { icon: 'snow-outline', label: 'AC Repair' },
  { icon: 'color-wand-outline', label: 'Cleaning' },
  { icon: 'construct-outline', label: 'Repairs' },
  { icon: 'leaf-outline', label: 'Garden' },
];

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const styles = createStyles(isDark);

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  };

  const handleContinueAsGuest = () => {
    // TODO: Implement guest mode
    router.push('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating Service Icons - positioned in a scattered pattern */}
        <View style={styles.floatingIcons}>
          {SERVICE_ICONS.slice(0, 4).map((item, index) => {
            // Position icons in corners and edges
            const positions = [
              { left: '8%', top: '15%' },   // top-left
              { right: '8%', top: '12%' },  // top-right
              { left: '5%', top: '45%' },   // mid-left
              { right: '5%', top: '40%' },  // mid-right
            ];
            return (
              <Animated.View
                key={index}
                style={[
                  styles.floatingIcon,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                  positions[index],
                ]}
              >
                <Ionicons name={item.icon as any} size={22} color="rgba(255,255,255,0.7)" />
              </Animated.View>
            );
          })}
        </View>

        {/* Hero Content */}
        <Animated.View
          style={[
            styles.heroContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="home" size={40} color={colors.white} />
          </View>
          <Text style={styles.brandName}>AgentCare</Text>
          <Text style={styles.tagline}>Home Services at Your Fingertips</Text>
        </Animated.View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Trust Stats */}
        <View style={styles.trustStats}>
          {TRUST_STATS.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <View style={styles.statValueRow}>
                <Text style={styles.statValue}>{stat.value}</Text>
                {stat.icon && (
                  <Ionicons name={stat.icon as any} size={16} color="#F59E0B" />
                )}
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={[styles.socialButton, styles.appleButton]}
            onPress={() => handleSocialLogin('apple')}
          >
            <Ionicons name="logo-apple" size={22} color={colors.white} />
            <Text style={[styles.socialButtonText, styles.appleButtonText]}>
              Continue with Apple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={() => handleSocialLogin('google')}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={[styles.socialButtonText, styles.googleButtonText]}>
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email Login Button */}
        <TouchableOpacity
          style={styles.emailButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Ionicons name="mail-outline" size={20} color={colors.white} />
          <Text style={styles.emailButtonText}>Sign in with Email</Text>
        </TouchableOpacity>

        {/* Create Account Link */}
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.createAccountText}>
            New to AgentCare? <Text style={styles.createAccountLink}>Create Account</Text>
          </Text>
        </TouchableOpacity>

        {/* Guest Mode */}
        <TouchableOpacity style={styles.guestButton} onPress={handleContinueAsGuest}>
          <Ionicons
            name="eye-outline"
            size={18}
            color={isDark ? colors.textMutedDark : colors.textMuted}
          />
          <Text style={styles.guestText}>Browse as Guest</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.securityText}>256-bit SSL Encrypted</Text>
          </View>
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms</Text> &{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    headerGradient: {
      height: '38%',
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      overflow: 'hidden',
    },
    floatingIcons: {
      ...StyleSheet.absoluteFillObject,
    },
    floatingIcon: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 40,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    brandName: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.white,
      marginBottom: spacing.xs,
    },
    tagline: {
      fontSize: fontSize.md,
      color: 'rgba(255,255,255,0.85)',
      fontWeight: '500',
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
    },
    trustStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: spacing.lg,
      marginBottom: spacing.lg,
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
    statItem: {
      alignItems: 'center',
    },
    statValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statValue: {
      fontSize: fontSize.xl,
      fontWeight: '800',
      color: isDark ? colors.textDark : colors.text,
    },
    statLabel: {
      fontSize: fontSize.xs,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      marginTop: 2,
    },
    socialButtons: {
      gap: spacing.sm,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      gap: spacing.sm,
    },
    appleButton: {
      backgroundColor: '#000000',
    },
    googleButton: {
      backgroundColor: isDark ? colors.cardDark : colors.white,
      borderWidth: 1,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
    socialButtonText: {
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    appleButtonText: {
      color: colors.white,
    },
    googleButtonText: {
      color: isDark ? colors.textDark : colors.text,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: isDark ? colors.borderDark : colors.border,
    },
    dividerText: {
      paddingHorizontal: spacing.md,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      fontSize: fontSize.sm,
    },
    emailButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.primary,
      gap: spacing.sm,
    },
    emailButtonText: {
      color: colors.white,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    createAccountButton: {
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    createAccountText: {
      fontSize: fontSize.md,
      color: isDark ? colors.textMutedDark : colors.textMuted,
    },
    createAccountLink: {
      color: colors.primary,
      fontWeight: '600',
    },
    guestButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
    },
    guestText: {
      fontSize: fontSize.sm,
      color: isDark ? colors.textMutedDark : colors.textMuted,
    },
    footer: {
      marginTop: 'auto',
      alignItems: 'center',
      paddingBottom: spacing.xl,
    },
    securityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    securityText: {
      fontSize: fontSize.xs,
      color: '#10B981',
      fontWeight: '500',
    },
    termsText: {
      fontSize: fontSize.xs,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      textAlign: 'center',
    },
    termsLink: {
      color: colors.primary,
    },
  });
