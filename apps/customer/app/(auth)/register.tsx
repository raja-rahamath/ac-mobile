import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = createStyles(isDark);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="person-add-outline" size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Choose your account type to get started</Text>
      </View>

      {/* Account Type Options */}
      <View style={styles.options}>
        {/* Individual Option */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => router.push('/(auth)/register-individual')}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="person-outline" size={32} color={colors.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Individual</Text>
            <Text style={styles.optionDescription}>
              For personal accounts to request home services
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isDark ? colors.textMutedDark : colors.textMuted}
          />
        </TouchableOpacity>

        {/* Company Option */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => router.push('/(auth)/register-company')}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="business-outline" size={32} color={colors.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Company</Text>
            <Text style={styles.optionDescription}>
              For businesses and organizations
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isDark ? colors.textMutedDark : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Features */}
      <View style={styles.features}>
        <Text style={styles.featuresTitle}>What you'll get:</Text>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.featureText}>Request services anytime</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.featureText}>Track your requests in real-time</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.featureText}>Chat with AI assistant</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.featureText}>View invoices and payment history</Text>
        </View>
      </View>

      {/* Login Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
      marginTop: spacing.xl,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.xl,
      backgroundColor: isDark ? colors.cardDark : colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: fontSize.xxxl,
      fontWeight: '700',
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSize.md,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      textAlign: 'center',
    },
    options: {
      marginBottom: spacing.xl,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
    optionIconContainer: {
      width: 56,
      height: 56,
      borderRadius: borderRadius.md,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.xs,
    },
    optionDescription: {
      fontSize: fontSize.sm,
      color: isDark ? colors.textMutedDark : colors.textMuted,
    },
    features: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    featuresTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.md,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    featureText: {
      fontSize: fontSize.sm,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      marginLeft: spacing.sm,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 'auto',
      paddingVertical: spacing.lg,
    },
    footerText: {
      fontSize: fontSize.md,
      color: isDark ? colors.textMutedDark : colors.textMuted,
    },
    linkText: {
      fontSize: fontSize.md,
      color: colors.primary,
      fontWeight: '600',
    },
  });
