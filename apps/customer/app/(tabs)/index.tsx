import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { getServiceRequests } from '../../src/services/requestService';
import type { ServiceRequest } from '../../src/types';

const SERVICE_CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: 'water' as const, color: '#3b82f6' },
  { id: 'electrical', label: 'Electrical', icon: 'flash' as const, color: '#f59e0b' },
  { id: 'hvac', label: 'AC / HVAC', icon: 'snow' as const, color: '#06b6d4' },
  { id: 'appliance', label: 'Appliances', icon: 'tv' as const, color: '#8b5cf6' },
  { id: 'cleaning', label: 'Cleaning', icon: 'sparkles' as const, color: '#10b981' },
  { id: 'general', label: 'General', icon: 'construct' as const, color: '#64748b' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pending', color: '#f59e0b', icon: 'time-outline' },
  confirmed: { label: 'Confirmed', color: '#3b82f6', icon: 'checkmark-circle-outline' },
  assigned: { label: 'Assigned', color: '#8b5cf6', icon: 'person-outline' },
  en_route: { label: 'En Route', color: '#06b6d4', icon: 'navigate-outline' },
  in_progress: { label: 'In Progress', color: '#10b981', icon: 'construct-outline' },
  completed: { label: 'Completed', color: '#22c55e', icon: 'checkmark-done-outline' },
  cancelled: { label: 'Cancelled', color: '#ef4444', icon: 'close-circle-outline' },
  NEW: { label: 'New', color: '#f59e0b', icon: 'time-outline' },
  ASSIGNED: { label: 'Assigned', color: '#8b5cf6', icon: 'person-outline' },
  IN_PROGRESS: { label: 'In Progress', color: '#10b981', icon: 'construct-outline' },
  ON_HOLD: { label: 'On Hold', color: '#6b7280', icon: 'pause-outline' },
  COMPLETED: { label: 'Completed', color: '#22c55e', icon: 'checkmark-done-outline' },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', icon: 'close-circle-outline' },
  CLOSED: { label: 'Closed', color: '#6b7280', icon: 'checkmark-done-outline' },
};

const CATEGORY_ICONS: Record<string, string> = {
  plumbing: 'water',
  electrical: 'flash',
  hvac: 'snow',
  appliance: 'tv',
  cleaning: 'sparkles',
  general: 'construct',
  pest_control: 'bug',
  landscaping: 'leaf',
};

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();

  const [activeRequests, setActiveRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch active requests when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchActiveRequests();
    }, [])
  );

  const fetchActiveRequests = async () => {
    try {
      setIsLoading(true);
      const response = await getServiceRequests('active');
      // Get only first 3 active requests for home screen
      setActiveRequests(response.data.slice(0, 3));
    } catch (err) {
      console.error('Error fetching active requests:', err);
      setActiveRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'A';
    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || 'A';
  };

  // Get display name (full name)
  const getDisplayName = () => {
    if (!user) return 'AgentCare';
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return fullName || 'User';
  };

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

  const renderActiveRequest = (request: ServiceRequest) => {
    const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.NEW;
    const categoryIcon = CATEGORY_ICONS[request.category] || 'construct';

    return (
      <TouchableOpacity
        key={request.id}
        style={[styles.requestCard, dynamicStyles.card]}
        onPress={() => router.push(`/request/${request.id}`)}
      >
        <View style={styles.requestHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name={categoryIcon as any} size={20} color={colors.primary} />
          </View>
          <View style={styles.requestInfo}>
            <Text style={[styles.requestTitle, dynamicStyles.text]} numberOfLines={1}>
              {request.title}
            </Text>
            {request.requestNo && (
              <Text style={[styles.requestNumber, { color: colors.primary }]}>{request.requestNo}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>{getUserInitials()}</Text>
          </View>
          <View>
            <Text style={[styles.welcomeText, dynamicStyles.textMuted]}>Welcome back,</Text>
            <Text style={[styles.brandText, dynamicStyles.text]}>{getDisplayName()}</Text>
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
              <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '20' }]}>
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

        {isLoading ? (
          <View style={[styles.loadingContainer, dynamicStyles.card]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, dynamicStyles.textMuted]}>Loading requests...</Text>
          </View>
        ) : activeRequests.length > 0 ? (
          <View style={styles.requestsList}>
            {activeRequests.map(renderActiveRequest)}
          </View>
        ) : (
          <View style={[styles.emptyCard, dynamicStyles.card]}>
            <Ionicons name="clipboard-outline" size={48} color={isDark ? colors.textMutedDark : colors.textMuted} />
            <Text style={[styles.emptyTitle, dynamicStyles.text]}>No active requests</Text>
            <Text style={[styles.emptySubtitle, dynamicStyles.textMuted]}>
              Submit a new request to get started
            </Text>
          </View>
        )}
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
  categoryIconContainer: {
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: fontSize.sm,
  },
  requestsList: {
    gap: spacing.sm,
  },
  requestCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  requestNumber: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
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
