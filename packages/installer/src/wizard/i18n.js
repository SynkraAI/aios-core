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

    // User Profile (Story 10.2 - Epic 10: User Profile System)
    userProfileQuestion: 'When AI generates code for you, which option best describes you?',
    modoAssistido: 'Assisted Mode',
    modoAssistidoDesc: "I can't tell if the code is right or wrong",
    modoAssistidoHint: 'You talk to Bob, who handles all validation',
    modoAvancado: 'Advanced Mode',
    modoAvancadoDesc: 'I can identify when something is wrong and fix it',
    modoAvancadoHint: 'You have direct access to all agents',
    userProfileSkipped: 'Using existing user profile',
    languageSkipped: 'Using existing language',

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
    quickStart: 'Quick Start:',
    quickStartAgents: 'Talk to your AI agents: @dev, @qa, @architect',
    quickStartStory: 'Create a story: @pm *create-story',
    quickStartHelp: 'Get help: @aios-master *help',

    // Cancellation
    cancelConfirm: 'Cancel installation?',
    cancelled: 'Installation cancelled.',
    tryAgain: 'Run `npx @synkra/aios-core init` to try again.',
    continuing: 'Continuing installation...',
  },

  pt: {
    // Language selection
    selectLanguage: 'Selecione o idioma:',

    // User Profile (Story 10.2 - Epic 10: User Profile System)
    // PRD: AIOS v2.0 "Projeto Bob" - Seção 2.4 (exact copy)
    userProfileQuestion: 'Quando uma IA gera código para você, qual dessas opções te descreve melhor?',
    modoAssistido: 'Modo Assistido',
    modoAssistidoDesc: 'Não sei avaliar se o código está certo ou errado',
    modoAssistidoHint: 'Você conversa com Bob, que cuida de toda a validação',
    modoAvancado: 'Modo Avançado',
    modoAvancadoDesc: 'Consigo identificar quando algo está errado e corrigir',
    modoAvancadoHint: 'Você tem acesso direto a todos os agentes',
    userProfileSkipped: 'Usando perfil de usuário existente',
    languageSkipped: 'Usando idioma existente',

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
    quickStart: 'Início Rápido:',
    quickStartAgents: 'Converse com seus agentes IA: @dev, @qa, @architect',
    quickStartStory: 'Crie uma story: @pm *create-story',
    quickStartHelp: 'Obtenha ajuda: @aios-master *help',

    // Cancellation
    cancelConfirm: 'Cancelar instalação?',
    cancelled: 'Instalação cancelada.',
    tryAgain: 'Execute `npx @synkra/aios-core init` para tentar novamente.',
    continuing: 'Continuando instalação...',
  },

  es: {
    // Language selection
    selectLanguage: 'Seleccione idioma:',

    // User Profile (Story 10.2 - Epic 10: User Profile System)
    userProfileQuestion: 'Cuando una IA genera código para ti, ¿cuál de estas opciones te describe mejor?',
    modoAssistido: 'Modo Asistido',
    modoAssistidoDesc: 'No sé evaluar si el código está bien o mal',
    modoAssistidoHint: 'Hablas con Bob, que se encarga de toda la validación',
    modoAvancado: 'Modo Avanzado',
    modoAvancadoDesc: 'Puedo identificar cuando algo está mal y corregirlo',
    modoAvancadoHint: 'Tienes acceso directo a todos los agentes',
    userProfileSkipped: 'Usando perfil de usuario existente',
    languageSkipped: 'Usando idioma existente',

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
    quickStart: 'Inicio Rápido:',
    quickStartAgents: 'Habla con tus agentes IA: @dev, @qa, @architect',
    quickStartStory: 'Crea una story: @pm *create-story',
    quickStartHelp: 'Obtén ayuda: @aios-master *help',

    // Cancellation
    cancelConfirm: '¿Cancelar instalación?',
    cancelled: 'Instalación cancelada.',
    tryAgain: 'Ejecute `npx @synkra/aios-core init` para intentar nuevamente.',
    continuing: 'Continuando instalación...',
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
