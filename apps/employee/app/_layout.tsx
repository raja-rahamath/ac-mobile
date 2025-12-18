import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { colors } from '../src/constants/theme';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? colors.backgroundDark : colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? colors.backgroundDark : colors.background,
          },
          headerTintColor: isDark ? colors.textDark : colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: isDark ? colors.backgroundDark : colors.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="job/[id]"
          options={{
            title: 'Job Details',
          }}
        />
        <Stack.Screen
          name="job/[id]/work"
          options={{
            title: 'Work in Progress',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="job/[id]/complete"
          options={{
            title: 'Complete Job',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="job/[id]/invoice"
          options={{
            title: 'Generate Invoice',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="job/[id]/payment"
          options={{
            title: 'Record Payment',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="navigate/[id]"
          options={{
            title: 'Navigate',
            presentation: 'fullScreenModal',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
