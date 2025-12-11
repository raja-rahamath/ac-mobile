import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

// Countries prioritized: Bahrain first, then GCC, then others
export const COUNTRIES: Country[] = [
  // Bahrain (priority)
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  // GCC Countries
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  // Middle East
  { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'IQ', name: 'Iraq', dialCode: '+964', flag: '🇮🇶' },
  { code: 'YE', name: 'Yemen', dialCode: '+967', flag: '🇾🇪' },
  // South Asia
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵' },
  // Southeast Asia
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  // Africa
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  // Western
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
];

interface PhoneInputProps {
  value: string;
  onChangePhone: (phone: string) => void;
  onChangeCountry: (country: Country) => void;
  selectedCountry: Country;
  placeholder?: string;
  hasError?: boolean;
}

export default function PhoneInput({
  value,
  onChangePhone,
  onChangeCountry,
  selectedCountry,
  placeholder = 'Phone number',
  hasError = false,
}: PhoneInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCountry = (country: Country) => {
    onChangeCountry(country);
    setModalVisible(false);
    setSearchQuery('');
  };

  const styles = createStyles(isDark, hasError);

  return (
    <View style={styles.container}>
      {/* Country Code Selector */}
      <TouchableOpacity
        style={styles.countrySelector}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.flag}>{selectedCountry.flag}</Text>
        <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={isDark ? colors.textMutedDark : colors.textMuted}
        />
      </TouchableOpacity>

      {/* Phone Number Input */}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
        value={value}
        onChangeText={onChangePhone}
        keyboardType="phone-pad"
        autoComplete="tel"
      />

      {/* Country Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={24}
                color={isDark ? colors.textDark : colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={isDark ? colors.textMutedDark : colors.textMuted}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country or code"
              placeholderTextColor={isDark ? colors.textMutedDark : colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          {/* Country List */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item, index }) => (
              <>
                {/* Section headers */}
                {index === 0 && (
                  <Text style={styles.sectionHeader}>Bahrain</Text>
                )}
                {index === 1 && (
                  <Text style={styles.sectionHeader}>GCC Countries</Text>
                )}
                {index === 6 && (
                  <Text style={styles.sectionHeader}>Middle East</Text>
                )}
                {index === 11 && (
                  <Text style={styles.sectionHeader}>South Asia</Text>
                )}
                {index === 16 && (
                  <Text style={styles.sectionHeader}>Southeast Asia</Text>
                )}
                {index === 19 && (
                  <Text style={styles.sectionHeader}>Africa</Text>
                )}
                {index === 21 && (
                  <Text style={styles.sectionHeader}>Western Countries</Text>
                )}
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    selectedCountry.code === item.code && styles.selectedCountry,
                  ]}
                  onPress={() => handleSelectCountry(item)}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.countryDialCode}>{item.dialCode}</Text>
                  </View>
                  {selectedCountry.code === item.code && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              </>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (isDark: boolean, hasError: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: hasError ? colors.error : isDark ? colors.borderDark : colors.border,
    },
    countrySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderRightWidth: 1,
      borderRightColor: isDark ? colors.borderDark : colors.border,
      gap: spacing.xs,
    },
    flag: {
      fontSize: 20,
    },
    dialCode: {
      fontSize: fontSize.md,
      color: isDark ? colors.textDark : colors.text,
      fontWeight: '500',
    },
    input: {
      flex: 1,
      padding: spacing.md,
      fontSize: fontSize.md,
      color: isDark ? colors.textDark : colors.text,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.borderDark : colors.border,
    },
    modalTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: isDark ? colors.textDark : colors.text,
    },
    closeButton: {
      padding: spacing.xs,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.cardDark : colors.card,
      margin: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? colors.borderDark : colors.border,
    },
    searchInput: {
      flex: 1,
      padding: spacing.md,
      fontSize: fontSize.md,
      color: isDark ? colors.textDark : colors.text,
    },
    sectionHeader: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: isDark ? colors.textMutedDark : colors.textMuted,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      marginTop: spacing.sm,
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    selectedCountry: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
    },
    countryFlag: {
      fontSize: 24,
      marginRight: spacing.md,
    },
    countryInfo: {
      flex: 1,
    },
    countryName: {
      fontSize: fontSize.md,
      color: isDark ? colors.textDark : colors.text,
      fontWeight: '500',
    },
    countryDialCode: {
      fontSize: fontSize.sm,
      color: isDark ? colors.textMutedDark : colors.textMuted,
    },
  });
