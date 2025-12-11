import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';
import { getMyProperties } from '../../src/services/propertyService';
import type { Property } from '../../src/types';

export default function PropertiesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  const fetchProperties = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const props = await getMyProperties();
      setProperties(props);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleAddProperty = () => {
    router.push('/property/add');
  };

  const handlePropertyPress = (property: Property) => {
    // For now, just show the property details in an expanded view
    // Could navigate to a detail page in the future
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, dynamicStyles.container]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, dynamicStyles.textMuted]}>Loading properties...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, dynamicStyles.container]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => fetchProperties(true)}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, dynamicStyles.text]}>My Properties</Text>
        <Text style={[styles.subtitle, dynamicStyles.textMuted]}>
          {properties.length} {properties.length === 1 ? 'property' : 'properties'} registered
        </Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={[styles.errorCard, { backgroundColor: colors.error + '15' }]}>
          <Ionicons name="warning-outline" size={20} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity onPress={() => fetchProperties()}>
            <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Properties List */}
      {properties.length === 0 && !error ? (
        <View style={[styles.emptyState, dynamicStyles.card]}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="home-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, dynamicStyles.text]}>No Properties Yet</Text>
          <Text style={[styles.emptyDescription, dynamicStyles.textMuted]}>
            Add your first property to start creating service requests
          </Text>
          <TouchableOpacity style={styles.addButtonLarge} onPress={handleAddProperty}>
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.addButtonLargeText}>Add Property</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.propertiesList}>
          {properties.map((property) => (
            <TouchableOpacity
              key={property.id}
              style={[styles.propertyCard, dynamicStyles.card]}
              onPress={() => handlePropertyPress(property)}
              activeOpacity={0.7}
            >
              <View style={styles.propertyIconContainer}>
                <Ionicons name="home" size={24} color={colors.primary} />
              </View>
              <View style={styles.propertyContent}>
                <View style={styles.propertyHeader}>
                  <Text style={[styles.propertyAddress, dynamicStyles.text]} numberOfLines={2}>
                    {property.address || `Unit ${property.unitNo}`}
                  </Text>
                  {property.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  )}
                </View>
                <View style={styles.propertyDetails}>
                  {property.type && (
                    <View style={styles.detailItem}>
                      <Ionicons name="business-outline" size={14} color={isDark ? colors.textMutedDark : colors.textMuted} />
                      <Text style={[styles.detailText, dynamicStyles.textMuted]}>{property.type}</Text>
                    </View>
                  )}
                  {property.ownershipType && (
                    <View style={styles.detailItem}>
                      <Ionicons name="key-outline" size={14} color={isDark ? colors.textMutedDark : colors.textMuted} />
                      <Text style={[styles.detailText, dynamicStyles.textMuted]}>
                        {property.ownershipType.charAt(0) + property.ownershipType.slice(1).toLowerCase().replace('_', ' ')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? colors.textMutedDark : colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Add Property FAB */}
      {properties.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddProperty} activeOpacity={0.8}>
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      )}

      <View style={{ height: spacing.xxl * 2 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.md,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  retryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  emptyState: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  addButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  addButtonLargeText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  propertiesList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  propertyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyContent: {
    flex: 1,
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  propertyAddress: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: 20,
  },
  primaryBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  primaryBadgeText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: fontSize.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
