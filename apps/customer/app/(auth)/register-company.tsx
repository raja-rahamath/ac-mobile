import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import PhoneInput, { Country, COUNTRIES } from '../../src/components/PhoneInput';

interface FormData {
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  contactPhone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  companyName?: string;
  contactFirstName?: string;
  contactLastName?: string;
  email?: string;
  contactPhone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterCompanyScreen() {
  const { registerCompany } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactFirstName: '',
    contactLastName: '',
    email: '',
    contactPhone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Bahrain default

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.contactFirstName.trim()) {
      newErrors.contactFirstName = 'First name is required';
    }

    if (!formData.contactLastName.trim()) {
      newErrors.contactLastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{8,}$/.test(formData.contactPhone.replace(/\s/g, ''))) {
      newErrors.contactPhone = 'Phone must be at least 8 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    // Combine country code with phone number
    const fullPhoneNumber = `${selectedCountry.dialCode}${formData.contactPhone.trim().replace(/^0+/, '')}`;
    const result = await registerCompany({
      email: formData.email.trim(),
      password: formData.password,
      companyName: formData.companyName.trim(),
      contactFirstName: formData.contactFirstName.trim(),
      contactLastName: formData.contactLastName.trim(),
      contactPhone: fullPhoneNumber,
    });
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        'Registration Successful',
        'Please check your email to verify your account before logging in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } else {
      Alert.alert('Registration Failed', result.error || 'Please try again');
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
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? colors.textDark : colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Company Account</Text>
          <Text style={styles.subtitle}>Register your business</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Company Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name</Text>
            <View style={[styles.inputContainer, errors.companyName && styles.inputError]}>
              <Ionicons
                name="business-outline"
                size={20}
                color={isDark ? colors.textMutedDark : colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter company name"
                placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                value={formData.companyName}
                onChangeText={(text) => updateField('companyName', text)}
                autoCapitalize="words"
              />
            </View>
            {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
          </View>

          {/* Section Header */}
          <Text style={styles.sectionHeader}>Contact Person</Text>

          {/* Contact Name Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>First Name</Text>
              <View style={[styles.inputContainer, errors.contactFirstName && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="First name"
                  placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                  value={formData.contactFirstName}
                  onChangeText={(text) => updateField('contactFirstName', text)}
                  autoCapitalize="words"
                />
              </View>
              {errors.contactFirstName && <Text style={styles.errorText}>{errors.contactFirstName}</Text>}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Last Name</Text>
              <View style={[styles.inputContainer, errors.contactLastName && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Last name"
                  placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                  value={formData.contactLastName}
                  onChangeText={(text) => updateField('contactLastName', text)}
                  autoCapitalize="words"
                />
              </View>
              {errors.contactLastName && <Text style={styles.errorText}>{errors.contactLastName}</Text>}
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Email</Text>
            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={isDark ? colors.textMutedDark : colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter business email"
                placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Phone</Text>
            <PhoneInput
              value={formData.contactPhone}
              onChangePhone={(text) => updateField('contactPhone', text)}
              onChangeCountry={setSelectedCountry}
              selectedCountry={selectedCountry}
              placeholder="Phone number"
              hasError={!!errors.contactPhone}
            />
            {errors.contactPhone && <Text style={styles.errorText}>{errors.contactPhone}</Text>}
          </View>

          {/* Section Header */}
          <Text style={styles.sectionHeader}>Account Security</Text>

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
                placeholder="Create a password"
                placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                secureTextEntry={!showPassword}
                textContentType="oneTimeCode"
                autoComplete="off"
                autoCorrect={false}
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

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={isDark ? colors.textMutedDark : colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                value={formData.confirmPassword}
                onChangeText={(text) => updateField('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                textContentType="oneTimeCode"
                autoComplete="off"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={isDark ? colors.textMutedDark : colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Create Company Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          By creating an account, you agree to our{' '}
          <Text style={styles.linkText}>Terms of Service</Text> and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
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
    header: {
      marginBottom: spacing.xl,
      marginTop: spacing.md,
    },
    backButton: {
      marginBottom: spacing.md,
    },
    title: {
      fontSize: fontSize.xxl,
      fontWeight: '700',
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSize.md,
      color: isDark ? colors.textMutedDark : colors.textMuted,
    },
    form: {
      marginBottom: spacing.lg,
    },
    sectionHeader: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: isDark ? colors.textDark : colors.text,
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    halfWidth: {
      flex: 1,
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
      borderRadius: borderRadius.md,
      borderWidth: 1,
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
    passwordToggle: {
      padding: spacing.md,
    },
    errorText: {
      fontSize: fontSize.sm,
      color: colors.error,
      marginTop: spacing.xs,
    },
    button: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      marginTop: spacing.md,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: colors.white,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    termsText: {
      fontSize: fontSize.sm,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    linkText: {
      color: colors.primary,
      fontWeight: '500',
    },
  });
