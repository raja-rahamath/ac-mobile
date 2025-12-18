import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../src/constants/theme';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Authenticated - go to main app
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // Not authenticated - go to login
  return <Redirect href="/(auth)/login" />;
}
