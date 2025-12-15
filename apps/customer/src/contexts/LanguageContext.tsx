import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { en, ar, TranslationKeys } from '../i18n/translations';

export type LanguageCode = 'en' | 'ar';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: TranslationKeys;
  isRTL: boolean;
  languageLabel: string;
}

const LANGUAGE_STORAGE_KEY = '@agentcare_language';

const translations: Record<LanguageCode, TranslationKeys> = {
  en,
  ar,
};

const languageLabels: Record<LanguageCode, string> = {
  en: 'English',
  ar: 'العربية',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
          setLanguageState(savedLanguage);
          // Set RTL for Arabic
          const shouldBeRTL = savedLanguage === 'ar';
          if (I18nManager.isRTL !== shouldBeRTL) {
            I18nManager.allowRTL(shouldBeRTL);
            I18nManager.forceRTL(shouldBeRTL);
          }
        }
      } catch (error) {
        console.log('Failed to load language:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: LanguageCode) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);

      // Handle RTL for Arabic
      const shouldBeRTL = lang === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
        // Note: RTL changes require app restart on some platforms
        // For a full implementation, you'd need to handle app restart
      }
    } catch (error) {
      console.error('Failed to save language:', error);
      throw error;
    }
  }, []);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    isRTL: language === 'ar',
    languageLabel: languageLabels[language],
  };

  // Don't render children until language is loaded
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for getting just translations (useful for components that don't need to change language)
export function useTranslation(): TranslationKeys {
  const { t } = useLanguage();
  return t;
}
