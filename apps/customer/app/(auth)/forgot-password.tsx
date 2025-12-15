import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { API_CONFIG, ENDPOINTS } from '../../src/constants/api';

type ScreenState = 'input' | 'success';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenState, setScreenState] = useState<ScreenState>('input');

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.FORGOT_PASSWORD}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setScreenState('success');
      } else {
        // Always show success message for security (don't reveal if email exists)
        setScreenState('success');
      }
    } catch (err) {
      // Even on network error, show success for security
      setScreenState('success');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleBackToLogin = () => {
    router.replace('/(auth)/login');
  };

  const styles = createStyles(isDark);

  // Success State
  if (screenState === 'success') {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <Ionicons name="mail-outline" size={48} color={colors.primary} />
              </View>
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successMessage}>
                We've sent password reset instructions to:
              </Text>
              <Text style={styles.successEmail}>{email}</Text>
              <Text style={styles.successHint}>
                If you don't see the email, check your spam folder. The link will expire in 24 hours.
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleBackToLogin}
              >
                <Ionicons name="arrow-back" size={20} color={colors.white} />
                <Text style={styles.buttonText}>Back to Login</Text>
              </Pressable>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => {
                  setScreenState('input');
                  setError(null);
                }}
              >
                <Text style={styles.resendText}>
                  Didn't receive email? <Text style={styles.resendLink}>Try again</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // Input State
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={isDark ? colors.textDark : colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, error && styles.inputError]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={isDark ? colors.textMutedDark : colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoFocus
                />
                {email.length > 0 && (
                  <TouchableOpacity onPress={() => setEmail('')} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                isLoading && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                  <Ionicons name="send" size={20} color={colors.white} />
                </>
              )}
            </Pressable>
          </View>

          {/* Back to Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: spacing.lg,
    },
    backButton: {
      marginBottom: spacing.lg,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? colors.cardDark : colors.card,
    },
    header: {
      marginBottom: spacing.xl,
      alignItems: 'center',
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: fontSize.md,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: spacing.md,
    },
    form: {
      marginBottom: spacing.lg,
    },
    inputGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.xs,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1.5,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
    inputError: {
      borderColor: colors.error,
    },
    inputIcon: {
      marginLeft: spacing.md,
    },
    input: {
      flex: 1,
      padding: spacing.md,
      fontSize: fontSize.md,
      color: isDark ? colors.textDark : colors.text,
    },
    clearButton: {
      padding: spacing.sm,
      marginRight: spacing.xs,
    },
    errorText: {
      fontSize: fontSize.sm,
      color: colors.error,
      marginTop: spacing.xs,
    },
    button: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    buttonText: {
      color: colors.white,
      fontSize: fontSize.lg,
      fontWeight: '700',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    footerText: {
      fontSize: fontSize.md,
      color: isDark ? colors.textMutedDark : colors.textMuted,
    },
    linkText: {
      fontSize: fontSize.md,
      color: colors.primary,
      fontWeight: '700',
    },
    // Success State Styles
    successContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: spacing.xl * 2,
    },
    successIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    successTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    successMessage: {
      fontSize: fontSize.md,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    successEmail: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.lg,
    },
    successHint: {
      fontSize: fontSize.sm,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    resendButton: {
      marginTop: spacing.lg,
      padding: spacing.md,
    },
    resendText: {
      fontSize: fontSize.sm,
      color: isDark ? colors.textMutedDark : colors.textMuted,
    },
    resendLink: {
      color: colors.primary,
      fontWeight: '600',
    },
  });
