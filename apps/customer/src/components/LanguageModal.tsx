import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';
import { useLanguage, LanguageCode } from '../contexts/LanguageContext';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

const LANGUAGES: { code: LanguageCode; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
];

export default function LanguageModal({ visible, onClose }: LanguageModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { language, setLanguage, t } = useLanguage();

  const handleSelectLanguage = async (code: LanguageCode) => {
    await setLanguage(code);
    onClose();
  };

  const styles = createStyles(isDark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{t.languages.selectLanguage}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? colors.textDark : colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Language Options */}
            <View style={styles.options}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.option,
                    language === lang.code && styles.optionSelected,
                  ]}
                  onPress={() => handleSelectLanguage(lang.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionNativeLabel}>{lang.nativeLabel}</Text>
                    {lang.code !== 'en' && (
                      <Text style={styles.optionLabel}>{lang.label}</Text>
                    )}
                  </View>
                  {language === lang.code && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '85%',
      maxWidth: 340,
    },
    content: {
      backgroundColor: isDark ? colors.cardDark : colors.card,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.borderDark : colors.border,
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: isDark ? colors.textDark : colors.text,
    },
    closeButton: {
      padding: spacing.xs,
    },
    options: {
      padding: spacing.md,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.sm,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    optionSelected: {
      backgroundColor: colors.primary + '15',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    optionContent: {
      flex: 1,
    },
    optionNativeLabel: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: isDark ? colors.textDark : colors.text,
    },
    optionLabel: {
      fontSize: fontSize.sm,
      color: isDark ? colors.textMutedDark : colors.textMuted,
      marginTop: 2,
    },
  });
