import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { colors } from '../src/constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="request/new"
          options={{
            title: 'New Request',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="request/[id]"
          options={{
            title: 'Request Details',
          }}
        />
        <Stack.Screen
          name="track/[id]"
          options={{
            title: 'Track Technician',
          }}
        />
      </Stack>
    </>
  );
}
