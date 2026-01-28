/**
 * Internationalization (i18n) for AIOS Wizard
 *
 * Supports: English, Portuguese, Spanish
 *
 * @module wizard/i18n
 */

const TRANSLATIONS = {
  en: {
    // Language selection
    selectLanguage: 'Select language:',

    // Project type
    projectTypeQuestion: 'What type of project are you setting up?',
    greenfield: 'Greenfield',
    greenfieldDesc: 'new project from scratch',
    brownfield: 'Brownfield',
    brownfieldDesc: 'existing project',

    // IDE selection
    ideQuestion: 'Select IDE(s):',
    ideHint: 'Space to select, Enter to confirm',
    recommended: 'Recommended',

    // Progress messages
    installingCore: 'Installing AIOS core...',
    installingIDE: 'Configuring IDEs...',
    installingDeps: 'Installing dependencies...',
    configuringEnv: 'Configuring environment...',
    validating: 'Validating installation...',

    // Status
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    skipped: 'Skipped',

    // Completion
    installComplete: 'Installation Complete!',
    readyToUse: 'Your AIOS project is ready.',
    nextSteps: 'Next steps:',

    // Cancellation
    cancelConfirm: 'Cancel installation?',
    cancelled: 'Installation cancelled.',
    tryAgain: 'Run `npx @synkra/aios-core init` to try again.',
  },

  pt: {
    // Language selection
    selectLanguage: 'Selecione o idioma:',

    // Project type
    projectTypeQuestion: 'Que tipo de projeto você está configurando?',
    greenfield: 'Greenfield',
    greenfieldDesc: 'projeto novo do zero',
    brownfield: 'Brownfield',
    brownfieldDesc: 'projeto existente',

    // IDE selection
    ideQuestion: 'Selecione IDE(s):',
    ideHint: 'Espaço para selecionar, Enter para confirmar',
    recommended: 'Recomendado',

    // Progress messages
    installingCore: 'Instalando AIOS core...',
    installingIDE: 'Configurando IDEs...',
    installingDeps: 'Instalando dependências...',
    configuringEnv: 'Configurando ambiente...',
    validating: 'Validando instalação...',

    // Status
    success: 'Sucesso',
    error: 'Erro',
    warning: 'Aviso',
    skipped: 'Pulado',

    // Completion
    installComplete: 'Instalação Completa!',
    readyToUse: 'Seu projeto AIOS está pronto.',
    nextSteps: 'Próximos passos:',

    // Cancellation
    cancelConfirm: 'Cancelar instalação?',
    cancelled: 'Instalação cancelada.',
    tryAgain: 'Execute `npx @synkra/aios-core init` para tentar novamente.',
  },

  es: {
    // Language selection
    selectLanguage: 'Seleccione idioma:',

    // Project type
    projectTypeQuestion: '¿Qué tipo de proyecto estás configurando?',
    greenfield: 'Greenfield',
    greenfieldDesc: 'proyecto nuevo desde cero',
    brownfield: 'Brownfield',
    brownfieldDesc: 'proyecto existente',

    // IDE selection
    ideQuestion: 'Seleccione IDE(s):',
    ideHint: 'Espacio para seleccionar, Enter para confirmar',
    recommended: 'Recomendado',

    // Progress messages
    installingCore: 'Instalando AIOS core...',
    installingIDE: 'Configurando IDEs...',
    installingDeps: 'Instalando dependencias...',
    configuringEnv: 'Configurando ambiente...',
    validating: 'Validando instalación...',

    // Status
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    skipped: 'Omitido',

    // Completion
    installComplete: '¡Instalación Completa!',
    readyToUse: 'Tu proyecto AIOS está listo.',
    nextSteps: 'Próximos pasos:',

    // Cancellation
    cancelConfirm: '¿Cancelar instalación?',
    cancelled: 'Instalación cancelada.',
    tryAgain: 'Ejecute `npx @synkra/aios-core init` para intentar nuevamente.',
  },
};

// Current language (default: English)
let currentLanguage = 'en';

/**
 * Set current language
 * @param {string} lang - Language code (en, pt, es)
 */
function setLanguage(lang) {
  if (TRANSLATIONS[lang]) {
    currentLanguage = lang;
  }
}

/**
 * Get current language
 * @returns {string} Current language code
 */
function getLanguage() {
  return currentLanguage;
}

/**
 * Get translated string
 * @param {string} key - Translation key
 * @returns {string} Translated string
 */
function t(key) {
  return TRANSLATIONS[currentLanguage][key] || TRANSLATIONS['en'][key] || key;
}

/**
 * Get language selection choices
 * @returns {Array} Inquirer choices
 */
function getLanguageChoices() {
  return [
    { name: 'English', value: 'en' },
    { name: 'Português', value: 'pt' },
    { name: 'Español', value: 'es' },
  ];
}

module.exports = {
  setLanguage,
  getLanguage,
  t,
  getLanguageChoices,
  TRANSLATIONS,
};
