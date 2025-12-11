import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { colors } from '../../src/constants/theme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? colors.backgroundDark : colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="welcome" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="register-individual" />
      <Stack.Screen name="register-company" />
    </Stack>
  );
}
