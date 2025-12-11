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
  Alert,
  useColorScheme,
  Animated,
  Modal,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';

// Coming Soon Modal for features not yet implemented
function ComingSoonModal({ visible, title, onClose, isDark }: { visible: boolean; title: string; onClose: () => void; isDark: boolean }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
      }}>
        <View style={{
          width: '100%',
          maxWidth: 340,
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
          alignItems: 'center',
          backgroundColor: isDark ? colors.cardDark : colors.card,
        }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}>
            <Ionicons name="construct" size={48} color={colors.primary} />
          </View>
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: spacing.sm,
            color: isDark ? colors.textDark : colors.text,
          }}>{title}</Text>
          <Text style={{
            fontSize: fontSize.md,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: spacing.lg,
            color: isDark ? colors.textMutedDark : colors.textMuted,
          }}>
            This feature is coming soon!{'\n'}We're working hard to bring it to you.
          </Text>
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.xl,
              borderRadius: borderRadius.full,
              minWidth: 120,
              opacity: pressed ? 0.8 : 1,
            })}
            onPress={onClose}
          >
            <Text style={{ color: colors.white, fontSize: fontSize.md, fontWeight: '600', textAlign: 'center' }}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const BIOMETRIC_KEY = '@agentcare_biometric_enabled';
const SAVED_EMAIL_KEY = '@agentcare_saved_email';

export default function LoginScreen() {
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'face' | 'fingerprint' | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [comingSoonModal, setComingSoonModal] = useState({ visible: false, title: '' });

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    checkBiometricSupport();
    loadSavedEmail();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (compatible && enrolled) {
      setBiometricAvailable(true);
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('face');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('fingerprint');
      }
    }
  };

  const loadSavedEmail = async () => {
    const savedEmail = await AsyncStorage.getItem(SAVED_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
    }
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setLoginError(null);

    if (rememberMe) {
      await AsyncStorage.setItem(SAVED_EMAIL_KEY, email.trim());
    } else {
      await AsyncStorage.removeItem(SAVED_EMAIL_KEY);
    }

    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      setLoginError(result.error || 'Invalid email or password. Please try again.');
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const showComingSoon = (title: string) => {
    setComingSoonModal({ visible: true, title });
  };

  const handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login to AgentCare',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      // In a real app, you'd retrieve stored credentials securely
      Alert.alert('Biometric Success', 'Please enter your credentials for first-time biometric setup.');
    }
  };

  const styles = createStyles(isDark);

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
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={isDark ? colors.textDark : colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to access your home services</Text>
          </View>

          {/* Biometric Login */}
          {biometricAvailable && (
            <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
              <View style={styles.biometricIcon}>
                <Ionicons
                  name={biometricType === 'face' ? 'scan-outline' : 'finger-print-outline'}
                  size={32}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.biometricText}>
                Use {biometricType === 'face' ? 'Face ID' : 'Touch ID'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Divider */}
          {biometricAvailable && (
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign in with email</Text>
              <View style={styles.dividerLine} />
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
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
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                {email.length > 0 && (
                  <TouchableOpacity onPress={() => setEmail('')} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={isDark ? colors.textMutedDark : colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={isDark ? colors.textMutedDark : colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMe}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color={colors.white} />}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Error Message */}
            {loginError && (
              <View style={styles.loginErrorContainer}>
                <Ionicons name="warning" size={20} color={colors.error} />
                <Text style={styles.loginErrorText}>{loginError}</Text>
              </View>
            )}

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                isLoading && styles.buttonDisabled,
                pressed && styles.buttonPressed,
                { cursor: 'pointer' } as any,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.buttonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.white} />
                </>
              )}
            </Pressable>
          </View>

          {/* Social Login */}
          <View style={styles.socialSection}>
            <Text style={styles.socialLabel}>Quick access</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton} onPress={() => showComingSoon('Sign in with Apple')}>
                <Ionicons name="logo-apple" size={24} color={isDark ? colors.white : '#000'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} onPress={() => showComingSoon('Sign in with Google')}>
                <Ionicons name="logo-google" size={22} color="#DB4437" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Create Account</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Coming Soon Modal */}
          <ComingSoonModal
            visible={comingSoonModal.visible}
            title={comingSoonModal.title}
            onClose={() => setComingSoonModal({ visible: false, title: '' })}
            isDark={isDark}
          />
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
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSize.md,
      color: isDark ? colors.textMutedDark : colors.textMuted,
    },
    biometricButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: colors.primary + '40',
      backgroundColor: colors.primary + '10',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    biometricIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    biometricText: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.primary,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: isDark ? colors.borderDark : colors.border,
    },
    dividerText: {
      paddingHorizontal: spacing.md,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      fontSize: fontSize.sm,
    },
    form: {
      marginBottom: spacing.lg,
    },
    inputGroup: {
      marginBottom: spacing.md,
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
    passwordToggle: {
      padding: spacing.md,
    },
    errorText: {
      fontSize: fontSize.sm,
      color: colors.error,
      marginTop: spacing.xs,
    },
    optionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    rememberMe: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: isDark ? colors.borderDark : colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    rememberMeText: {
      fontSize: fontSize.sm,
      color: isDark ? colors.textMutedDark : colors.textMuted,
    },
    forgotPasswordText: {
      fontSize: fontSize.sm,
      color: colors.primary,
      fontWeight: '600',
    },
    loginErrorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error + '20',
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.lg,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.error + '40',
    },
    loginErrorText: {
      flex: 1,
      color: colors.error,
      fontSize: fontSize.md,
      fontWeight: '500',
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
    socialSection: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    socialLabel: {
      fontSize: fontSize.sm,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      marginBottom: spacing.md,
    },
    socialButtons: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    socialButton: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderWidth: 1,
      borderColor: isDark ? colors.borderDark : colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: spacing.lg,
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
  });
