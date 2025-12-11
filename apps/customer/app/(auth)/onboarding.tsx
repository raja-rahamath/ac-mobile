import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  features: string[];
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'home-outline',
    title: 'Home Services\nMade Simple',
    subtitle: 'Your trusted partner',
    description: 'Book professional maintenance services for your home with just a few taps.',
    color: '#4F46E5',
    features: ['Plumbing', 'Electrical', 'AC Repair', 'Cleaning'],
  },
  {
    id: '2',
    icon: 'location-outline',
    title: 'Real-Time\nTracking',
    subtitle: 'Know exactly when',
    description: 'Track your technician in real-time and get accurate arrival estimates.',
    color: '#0EA5E9',
    features: ['Live GPS', 'ETA Updates', 'Direct Contact', 'Status Alerts'],
  },
  {
    id: '3',
    icon: 'chatbubbles-outline',
    title: 'AI-Powered\nSupport',
    subtitle: '24/7 assistance',
    description: 'Get instant help from our AI assistant Fatima, available around the clock.',
    color: '#10B981',
    features: ['Instant Answers', 'Smart Booking', 'Issue Diagnosis', 'Cost Estimates'],
  },
  {
    id: '4',
    icon: 'shield-checkmark-outline',
    title: 'Verified\nProfessionals',
    subtitle: 'Trust & quality',
    description: 'All our technicians are background-checked, certified, and rated by customers.',
    color: '#F59E0B',
    features: ['Background Checked', 'Licensed', 'Insured', '4.8+ Rating'],
  },
];

const STORAGE_KEY = '@agentcare_onboarding_complete';

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const styles = createStyles(isDark);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    router.replace('/(auth)/welcome');
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.slideContent, { opacity, transform: [{ scale }] }]}>
          {/* Icon Circle */}
          <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
            <View style={[styles.iconInner, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={48} color={colors.white} />
            </View>
          </View>

          {/* Text Content */}
          <Text style={[styles.subtitle, { color: item.color }]}>{item.subtitle}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* Feature Pills */}
          <View style={styles.features}>
            {item.features.map((feature, idx) => (
              <View key={idx} style={[styles.featurePill, { borderColor: item.color }]}>
                <Ionicons name="checkmark" size={14} color={item.color} />
                <Text style={[styles.featureText, { color: item.color }]}>{feature}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {ONBOARDING_SLIDES.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          const dotColor = ONBOARDING_SLIDES[currentIndex].color;

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: dotColor,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;
  const currentColor = ONBOARDING_SLIDES[currentIndex].color;

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {renderPagination()}

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: currentColor }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={isLastSlide ? 'arrow-forward' : 'chevron-forward'}
            size={20}
            color={colors.white}
          />
        </TouchableOpacity>
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
    skipButton: {
      position: 'absolute',
      top: 60,
      right: spacing.lg,
      zIndex: 10,
      padding: spacing.sm,
    },
    skipText: {
      fontSize: fontSize.md,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      fontWeight: '500',
    },
    slide: {
      width,
      paddingHorizontal: spacing.xl,
      paddingTop: height * 0.12,
    },
    slideContent: {
      alignItems: 'center',
    },
    iconCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    iconInner: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    subtitle: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: isDark ? colors.textDark : colors.text,
      textAlign: 'center',
      lineHeight: 40,
      marginBottom: spacing.md,
    },
    description: {
      fontSize: fontSize.md,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.xl,
    },
    features: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    featurePill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1.5,
      gap: spacing.xs,
    },
    featureText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    bottomSection: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl + 20,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xl,
      gap: spacing.xs,
    },
    dot: {
      height: 8,
      borderRadius: 4,
    },
    nextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.lg,
      gap: spacing.sm,
    },
    nextButtonText: {
      color: colors.white,
      fontSize: fontSize.lg,
      fontWeight: '700',
    },
  });
