import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import PhoneInput, { Country, COUNTRIES } from '../../src/components/PhoneInput';
import { API_CONFIG } from '../../src/constants/api';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      // Parse phone number to extract country code and local number
      let phoneNumber = user.phone || '';
      let country = COUNTRIES[0]; // Default to Bahrain

      // Try to match country code from phone
      if (phoneNumber) {
        for (const c of COUNTRIES) {
          if (phoneNumber.startsWith(c.dialCode)) {
            country = c;
            phoneNumber = phoneNumber.slice(c.dialCode.length);
            break;
          }
        }
      }

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: phoneNumber,
      });
      setSelectedCountry(country);
    }
  }, [user]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Check if there are changes
      if (user) {
        const originalPhone = user.phone?.replace(selectedCountry.dialCode, '') || '';
        const hasChange =
          newData.firstName !== (user.firstName || '') ||
          newData.lastName !== (user.lastName || '') ||
          newData.phone !== originalPhone;
        setHasChanges(hasChange);
      }
      return newData;
    });
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.phone && !/^[\d\s-]{6,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const fullPhoneNumber = formData.phone
        ? `${selectedCountry.dialCode}${formData.phone.trim().replace(/^0+/, '')}`
        : '';

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/customer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: fullPhoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Your profile has been updated', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: false,
          title: '',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={isDark ? colors.textDark : colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Personal Information</Text>
            <Text style={styles.subtitle}>Update your profile details</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email (Read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, styles.inputDisabled]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={isDark ? colors.textMutedDark : colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.inputTextDisabled]}
                  value={formData.email}
                  editable={false}
                  placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                />
                <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
              </View>
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            {/* Name Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>First Name *</Text>
                <View style={[styles.inputContainer, errors.firstName && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="First name"
                    placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                    value={formData.firstName}
                    onChangeText={(text) => updateField('firstName', text)}
                    autoCapitalize="words"
                  />
                </View>
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Last Name *</Text>
                <View style={[styles.inputContainer, errors.lastName && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Last name"
                    placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
                    value={formData.lastName}
                    onChangeText={(text) => updateField('lastName', text)}
                    autoCapitalize="words"
                  />
                </View>
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <PhoneInput
                value={formData.phone}
                onChangePhone={(text) => updateField('phone', text)}
                onChangeCountry={setSelectedCountry}
                selectedCountry={selectedCountry}
                placeholder="Phone number"
                hasError={!!errors.phone}
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, (!hasChanges || isSaving) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color={colors.white} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? colors.cardDark : colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl,
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
    },
    form: {
      marginBottom: spacing.lg,
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
      borderRadius: borderRadius.lg,
      borderWidth: 1.5,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
    inputDisabled: {
      backgroundColor: isDark ? colors.cardDark + '80' : colors.border + '40',
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
    inputTextDisabled: {
      color: isDark ? colors.textMutedDark : colors.textMuted,
    },
    errorText: {
      fontSize: fontSize.sm,
      color: colors.error,
      marginTop: spacing.xs,
    },
    helperText: {
      fontSize: fontSize.xs,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      marginTop: spacing.xs,
    },
    saveButton: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      color: colors.white,
      fontSize: fontSize.lg,
      fontWeight: '700',
    },
  });
