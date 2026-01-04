import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import fr from './locales/fr.json';
import en from './locales/en.json';

const i18n = new I18n({
  fr,
  en,
});

// Définir la langue par défaut selon le device
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'fr';

// Fallback sur le français si traduction manquante
i18n.defaultLocale = 'fr';
i18n.enableFallback = true;

export default i18n;

// Hook pour changer la langue
export const setLanguage = (lang: 'fr' | 'en') => {
  i18n.locale = lang;
};

export const getCurrentLanguage = (): string => {
  return i18n.locale;
};
