import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';

const { width, height } = Dimensions.get('window');

const MOCK_NAVIGATION = {
  destination: {
    name: 'Ahmed Al-Rashid',
    address: 'Villa 23, Palm Jumeirah, Dubai',
    phone: '+971501234567',
    coordinates: { lat: 25.1185, lng: 55.1370 },
  },
  route: {
    distance: '2.5 km',
    duration: '12 min',
    nextTurn: 'Turn right on Beach Road in 500m',
  },
};

export default function NavigateScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const dynamicStyles = {
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    card: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
  };

  const handleOpenMaps = () => {
    const { lat, lng } = MOCK_NAVIGATION.destination.coordinates;
    const url = `https://maps.google.com/?daddr=${lat},${lng}`;
    Linking.openURL(url);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${MOCK_NAVIGATION.destination.phone}`);
  };

  const handleArrived = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="navigate" size={80} color={colors.primary + '40'} />
          <Text style={[styles.mapText, dynamicStyles.textMuted]}>Navigation View</Text>
          <TouchableOpacity style={styles.openMapsButton} onPress={handleOpenMaps}>
            <Ionicons name="open-outline" size={18} color={colors.primary} />
            <Text style={styles.openMapsText}>Open in Google Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Route Info Overlay */}
        <View style={styles.routeOverlay}>
          <View style={styles.routeCard}>
            <View style={styles.routeInfo}>
              <Text style={styles.routeDistance}>{MOCK_NAVIGATION.route.distance}</Text>
              <Text style={styles.routeDuration}>{MOCK_NAVIGATION.route.duration}</Text>
            </View>
          </View>
        </View>

        {/* Turn Direction */}
        <View style={styles.turnOverlay}>
          <View style={styles.turnCard}>
            <Ionicons name="arrow-forward" size={24} color={colors.primary} />
            <Text style={styles.turnText}>{MOCK_NAVIGATION.route.nextTurn}</Text>
          </View>
        </View>

        {/* Simulated Route Visualization */}
        <View style={styles.routeVisualization}>
          <View style={styles.currentLocation}>
            <Ionicons name="navigate" size={28} color={colors.white} />
          </View>
          <View style={styles.routePath}>
            <View style={styles.routeDots}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={styles.routeDot} />
              ))}
            </View>
          </View>
          <View style={styles.destinationPin}>
            <Ionicons name="location" size={32} color={colors.error} />
          </View>
        </View>
      </View>

      {/* Bottom Panel */}
      <View style={[styles.bottomPanel, dynamicStyles.card]}>
        {/* Destination Info */}
        <View style={styles.destinationInfo}>
          <View style={styles.destinationAvatar}>
            <Text style={styles.avatarText}>{MOCK_NAVIGATION.destination.name.charAt(0)}</Text>
          </View>
          <View style={styles.destinationDetails}>
            <Text style={[styles.destinationName, dynamicStyles.text]}>
              {MOCK_NAVIGATION.destination.name}
            </Text>
            <Text style={[styles.destinationAddress, dynamicStyles.textMuted]} numberOfLines={1}>
              {MOCK_NAVIGATION.destination.address}
            </Text>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* ETA Bar */}
        <View style={styles.etaBar}>
          <View style={styles.etaItem}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={[styles.etaLabel, dynamicStyles.textMuted]}>ETA</Text>
            <Text style={[styles.etaValue, dynamicStyles.text]}>{MOCK_NAVIGATION.route.duration}</Text>
          </View>
          <View style={styles.etaDivider} />
          <View style={styles.etaItem}>
            <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
            <Text style={[styles.etaLabel, dynamicStyles.textMuted]}>Distance</Text>
            <Text style={[styles.etaValue, dynamicStyles.text]}>{MOCK_NAVIGATION.route.distance}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.cancelButton, dynamicStyles.card]} onPress={() => router.back()}>
            <Text style={[styles.cancelText, { color: colors.error }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrivedButton} onPress={handleArrived}>
            <Ionicons name="checkmark" size={20} color={colors.white} />
            <Text style={styles.arrivedText}>I've Arrived</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary + '08',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.md,
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  openMapsText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  routeOverlay: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  routeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  routeDistance: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  routeDuration: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  turnOverlay: {
    position: 'absolute',
    top: 80,
    left: spacing.lg,
    right: spacing.lg,
  },
  turnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  turnText: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  routeVisualization: {
    position: 'absolute',
    left: spacing.xl * 2,
    right: spacing.xl * 2,
    top: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentLocation: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  routePath: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  routeDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary + '60',
  },
  destinationPin: {
    alignItems: 'center',
  },
  bottomPanel: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  destinationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  destinationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  destinationDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  destinationName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  destinationAddress: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  etaBar: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  etaItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  etaDivider: {
    width: 1,
    backgroundColor: colors.primary + '30',
    marginVertical: spacing.xs,
  },
  etaLabel: {
    fontSize: fontSize.xs,
  },
  etaValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  arrivedButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    gap: spacing.sm,
  },
  arrivedText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
