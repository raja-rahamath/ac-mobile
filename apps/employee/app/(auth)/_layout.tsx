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
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
