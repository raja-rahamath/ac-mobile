import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const dynamicStyles = {
    container: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
    text: { color: isDark ? colors.textDark : colors.text },
    textMuted: { color: isDark ? colors.textMutedDark : colors.textMuted },
    input: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderColor: isDark ? colors.borderDark : colors.border,
      color: isDark ? colors.textDark : colors.text,
    },
    inputError: {
      borderColor: colors.error,
    },
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await login(email.trim().toLowerCase(), password);

      if (result.success) {
        router.replace('/(tabs)');
      } else {
        setErrors({ general: result.error || 'Login failed' });
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, dynamicStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="construct" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.title, dynamicStyles.text]}>AgentCare</Text>
          <Text style={[styles.subtitle, dynamicStyles.textMuted]}>Technician Portal</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <Text style={[styles.formTitle, dynamicStyles.text]}>Sign In</Text>
          <Text style={[styles.formSubtitle, dynamicStyles.textMuted]}>
            Enter your credentials to access your jobs
          </Text>

          {/* General Error */}
          {errors.general && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, dynamicStyles.text]}>Email</Text>
            <View
              style={[
                styles.inputContainer,
                dynamicStyles.input,
                errors.email && dynamicStyles.inputError,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={isDark ? colors.textMutedDark : colors.textMuted}
              />
              <TextInput
                style={[styles.input, { color: dynamicStyles.input.color }]}
                placeholder="Enter your email"
                placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!isLoading}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, dynamicStyles.text]}>Password</Text>
            <View
              style={[
                styles.inputContainer,
                dynamicStyles.input,
                errors.password && dynamicStyles.inputError,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={isDark ? colors.textMutedDark : colors.textMuted}
              />
              <TextInput
                style={[styles.input, { color: dynamicStyles.input.color }]}
                placeholder="Enter your password"
                placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={isDark ? colors.textMutedDark : colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => Alert.alert('Forgot Password', 'Please contact your supervisor to reset your password.')}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, dynamicStyles.textMuted]}>
            Need help? Contact your supervisor
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  form: {
    flex: 1,
  },
  formTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: fontSize.sm,
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    height: '100%',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  loginButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
  },
});
