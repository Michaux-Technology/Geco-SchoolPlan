import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction
import translationFR from './i18n/locales/fr/translation.json';
import translationEN from './i18n/locales/en/translation.json';
import translationDE from './i18n/locales/de/translation.json';
import translationES from './i18n/locales/es/translation.json';

// On catch les erreurs potentielles d'importation pour les diagnostiquer
let resources;
try {
  resources = {
    fr: {
      translation: translationFR
    },
    en: {
      translation: translationEN
    },
    de: {
      translation: translationDE
    },
    es: {
      translation: translationES
    }
  };
} catch (error) {
  console.error('Erreur lors du chargement des ressources:', error);
  // Fallback resources
  resources = {
    fr: { translation: {} },
    en: { translation: {} },
    de: { translation: {} },
    es: { translation: {} }
  };
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    debug: process.env.NODE_ENV === 'development',
    
    // Configuration pour React
    react: {
      useSuspense: true,
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    // Permettre l'accès aux objets de traduction
    returnObjects: false,
    
    // Configuration de la détection de langue
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    }
  });

// Ajouter un écouteur pour enregistrer les changements de langue
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n; 