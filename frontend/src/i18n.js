import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction
import translationFR from './locales/fr/translation.json';
import translationEN from './locales/en/translation.json';
import translationDE from './locales/de/translation.json';

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
    }
  };
} catch (error) {
  // Fallback resources
  resources = {
    fr: { translation: {} },
    en: { translation: {} },
    de: { translation: {} }
  };
}

// Log the current language from localStorage before initialization
const currentLanguage = localStorage.getItem('i18nextLng') || 'fr';

i18n
  // Détection de la langue du navigateur
  .use(LanguageDetector)
  // Intégration avec React
  .use(initReactI18next)
  // Initialisation de i18next
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut si la langue détectée n'est pas disponible
    debug: true, // Afficher les logs de débogage pour identifier les problèmes
    
    // Configuration pour React
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
      skipTranslationOnMissingKey: false
    },
    
    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs
    },
    
    // Configuration de la détection de langue
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })
  .then(() => {
    // Vérifier la langue active après l'initialisation
    console.log('Langue active après initialisation:', i18n.language);

    // Ajouter un écouteur pour enregistrer les changements de langue
    i18n.on('languageChanged', (lng) => {
      console.log('Langue changée à:', lng);
      // Forcer la mise à jour du localStorage
      localStorage.setItem('i18nextLng', lng);
      // Force refresh de la page pour appliquer complètement les changements
      window.location.reload();
    });
  })
  .catch((error) => {
    console.error('Erreur lors du chargement des ressources de traduction:', error);
  });

export default i18n; 