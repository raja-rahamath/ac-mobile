import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

const MOCK_TRACKING = {
  technician: {
    id: 't1',
    name: 'Ahmed Hassan',
    phone: '+971501234567',
    rating: 4.8,
    vehicle: 'White Toyota Hilux - A 12345',
    eta: 15, // minutes
    location: {
      latitude: 25.1123,
      longitude: 55.1391,
    },
  },
  destination: {
    address: 'Villa 23, Palm Jumeirah, Dubai',
    latitude: 25.1185,
    longitude: 55.1370,
  },
  status: 'en_route',
};

export default function TrackScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tracking = MOCK_TRACKING;

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  const handleCall = () => {
    Linking.openURL(`tel:${tracking.technician.phone}`);
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={64} color={colors.primary + '40'} />
          <Text style={[styles.mapPlaceholderText, dynamicStyles.textMuted]}>
            Live map tracking
          </Text>
          <Text style={[styles.mapPlaceholderSubtext, dynamicStyles.textMuted]}>
            Technician location updates in real-time
          </Text>
        </View>

        {/* Map Overlay - ETA */}
        <View style={styles.etaOverlay}>
          <View style={styles.etaCard}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <View>
              <Text style={styles.etaLabel}>Estimated Arrival</Text>
              <Text style={styles.etaTime}>{tracking.technician.eta} mins</Text>
            </View>
          </View>
        </View>

        {/* Simulated Route */}
        <View style={styles.routeSimulation}>
          <View style={styles.technicianMarker}>
            <Ionicons name="car" size={24} color={colors.white} />
          </View>
          <View style={styles.routeLine} />
          <View style={styles.destinationMarker}>
            <Ionicons name="home" size={20} color={colors.white} />
          </View>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, dynamicStyles.card]}>
        {/* Technician Info */}
        <View style={styles.technicianRow}>
          <View style={styles.technicianAvatar}>
            <Text style={styles.avatarText}>{tracking.technician.name.charAt(0)}</Text>
          </View>
          <View style={styles.technicianInfo}>
            <Text style={[styles.technicianName, dynamicStyles.text]}>
              {tracking.technician.name}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.ratingText}>{tracking.technician.rating}</Text>
            </View>
          </View>
          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.actionIcon} onPress={handleCall}>
              <Ionicons name="call" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="chatbubble" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={[styles.vehicleRow, dynamicStyles.card]}>
          <Ionicons name="car" size={20} color={isDark ? colors.textMutedDark : colors.textMuted} />
          <Text style={[styles.vehicleText, dynamicStyles.textMuted]}>
            {tracking.technician.vehicle}
          </Text>
        </View>

        {/* Status Timeline */}
        <View style={styles.statusTimeline}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, styles.statusDotComplete]} />
            <Text style={[styles.statusLabel, dynamicStyles.text]}>Request Accepted</Text>
            <Ionicons name="checkmark" size={16} color={colors.success} />
          </View>
          <View style={[styles.statusLine, styles.statusLineComplete]} />
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, styles.statusDotActive]} />
            <Text style={[styles.statusLabel, dynamicStyles.text]}>On the Way</Text>
            <View style={styles.activeIndicator}>
              <Text style={styles.activeText}>Now</Text>
            </View>
          </View>
          <View style={styles.statusLine} />
          <View style={styles.statusItem}>
            <View style={styles.statusDot} />
            <Text style={[styles.statusLabel, dynamicStyles.textMuted]}>Arrived</Text>
          </View>
        </View>

        {/* Destination */}
        <View style={styles.destinationRow}>
          <View style={[styles.destinationIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.destinationText, dynamicStyles.text]} numberOfLines={2}>
            {tracking.destination.address}
          </Text>
        </View>

        {/* Share Location Button */}
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color={colors.primary} />
          <Text style={styles.shareButtonText}>Share Live Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary + '08',
  },
  mapPlaceholderText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.md,
  },
  mapPlaceholderSubtext: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  etaOverlay: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  etaLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  etaTime: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  routeSimulation: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    top: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  technicianMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  routeLine: {
    flex: 1,
    height: 4,
    backgroundColor: colors.primary + '40',
    marginHorizontal: spacing.sm,
    borderRadius: 2,
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheet: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  technicianRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  technicianAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  technicianInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  technicianName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: '#f59e0b',
    fontWeight: fontWeight.medium,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  vehicleText: {
    fontSize: fontSize.sm,
  },
  statusTimeline: {
    marginBottom: spacing.lg,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusDotComplete: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  statusDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusLabel: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  statusLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 7,
    marginVertical: 2,
  },
  statusLineComplete: {
    backgroundColor: colors.success,
  },
  activeIndicator: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  activeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  destinationIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationText: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  shareButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
