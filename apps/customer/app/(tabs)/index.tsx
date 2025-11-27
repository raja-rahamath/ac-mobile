import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';

const SERVICE_CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: 'water' as const, color: '#3b82f6' },
  { id: 'electrical', label: 'Electrical', icon: 'flash' as const, color: '#f59e0b' },
  { id: 'hvac', label: 'AC / HVAC', icon: 'snow' as const, color: '#06b6d4' },
  { id: 'appliance', label: 'Appliances', icon: 'tv' as const, color: '#8b5cf6' },
  { id: 'cleaning', label: 'Cleaning', icon: 'sparkles' as const, color: '#10b981' },
  { id: 'general', label: 'General', icon: 'construct' as const, color: '#64748b' },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    text: {
      color: isDark ? colors.textDark : colors.text,
    },
    textMuted: {
      color: isDark ? colors.textMutedDark : colors.textMuted,
    },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <View>
            <Text style={[styles.welcomeText, dynamicStyles.textMuted]}>Welcome to</Text>
            <Text style={[styles.brandText, dynamicStyles.text]}>AgentCare</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color={isDark ? colors.textDark : colors.text} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>How can we help?</Text>
        <TouchableOpacity
          style={[styles.newRequestCard, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/request/new')}
        >
          <View style={styles.newRequestContent}>
            <Ionicons name="add-circle" size={32} color={colors.white} />
            <View style={styles.newRequestText}>
              <Text style={styles.newRequestTitle}>New Service Request</Text>
              <Text style={styles.newRequestSubtitle}>Get help from our AI assistant</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Service Categories */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Services</Text>
        <View style={styles.categoryGrid}>
          {SERVICE_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, dynamicStyles.card]}
              onPress={() => router.push({ pathname: '/request/new', params: { category: category.id } })}
            >
              <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                <Ionicons name={category.icon} size={24} color={category.color} />
              </View>
              <Text style={[styles.categoryLabel, dynamicStyles.text]}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Active Requests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>Active Requests</Text>
          <TouchableOpacity onPress={() => router.push('/requests')}>
            <Text style={{ color: colors.primary, fontSize: fontSize.sm }}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.emptyCard, dynamicStyles.card]}>
          <Ionicons name="clipboard-outline" size={48} color={isDark ? colors.textMutedDark : colors.textMuted} />
          <Text style={[styles.emptyTitle, dynamicStyles.text]}>No active requests</Text>
          <Text style={[styles.emptySubtitle, dynamicStyles.textMuted]}>
            Submit a new request to get started
          </Text>
        </View>
      </View>

      {/* AI Chat Promo */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.promoCard, { backgroundColor: colors.secondary + '15' }]}
          onPress={() => router.push('/chat')}
        >
          <View style={styles.promoIcon}>
            <Ionicons name="chatbubbles" size={28} color={colors.secondary} />
          </View>
          <View style={styles.promoContent}>
            <Text style={[styles.promoTitle, dynamicStyles.text]}>24/7 AI Support</Text>
            <Text style={[styles.promoSubtitle, dynamicStyles.textMuted]}>
              Chat with our AI assistant for instant help
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  welcomeText: {
    fontSize: fontSize.sm,
  },
  brandText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  notificationBtn: {
    padding: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  newRequestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  newRequestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  newRequestText: {
    gap: spacing.xs,
  },
  newRequestTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  newRequestSubtitle: {
    color: colors.white,
    opacity: 0.8,
    fontSize: fontSize.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryCard: {
    width: '30%',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  promoIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  promoSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
});
