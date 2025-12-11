import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../src/constants/theme';

const ONBOARDING_KEY = '@agentcare_onboarding_complete';

export default function Index() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
    setOnboardingComplete(completed === 'true');
  };

  // Still loading
  if (authLoading || onboardingComplete === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Authenticated - go to main app
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // First time user - show onboarding
  if (!onboardingComplete) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  // Returning user - show welcome/login
  return <Redirect href="/(auth)/welcome" />;
}
