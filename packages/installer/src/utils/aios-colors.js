/**
 * AIOS Color Palette v4.0.4
 * 
 * Brand-inspired color system for CLI tools and terminal output.
 * Colors derived from AIOS logo gradient (magenta → orange → purple → blue)
 * Primary purple references ClickUp brand color.
 * 
 * @see docs/standards/AIOS-COLOR-PALETTE-V2.1.md
 * @module aios-colors
 */

const chalk = require('chalk');

/**
 * AIOS Brand Color Palette
 * All colors are WCAG AA compliant on dark terminals
 */
const colors = {
  // ============================================
  // CORE BRAND COLORS
  // ============================================
  
  /**
   * Primary brand color - ClickUp-inspired purple
   * Usage: Main questions, headers, CTAs, primary actions
   */
  primary: chalk.hex('#8B5CF6'),
  
  /**
   * Secondary brand color - Magenta accent from logo gradient
   * Usage: Important highlights, special emphasis, key information
   */
  secondary: chalk.hex('#EC4899'),
  
  /**
   * Tertiary brand color - Blue accent from logo gradient
   * Usage: Secondary actions, links, complementary elements
   */
  tertiary: chalk.hex('#3B82F6'),
  
  // ============================================
  // FUNCTIONAL COLORS
  // ============================================
  
  /**
   * Success state color
   * Usage: Checkmarks, completed steps, success messages
   */
  success: chalk.hex('#10B981'),
  
  /**
   * Warning state color - Orange from logo gradient
   * Usage: Warnings, confirmations, caution states
   */
  warning: chalk.hex('#F59E0B'),
  
  /**
   * Error state color
   * Usage: Errors, critical alerts, validation failures
   */
  error: chalk.hex('#EF4444'),
  
  /**
   * Info state color - Cyan-blue from logo gradient
   * Usage: Info messages, tips, helper text, additional context
   */
  info: chalk.hex('#06B6D4'),
  
  // ============================================
  // NEUTRAL COLORS
  // ============================================
  
  /**
   * Muted text color
   * Usage: Subtle text, disabled states, secondary content
   */
  muted: chalk.hex('#94A3B8'),
  
  /**
   * Dim text color
   * Usage: Secondary text, muted content, less important info
   */
  dim: chalk.hex('#64748B'),
  
  // ============================================
  // GRADIENT SYSTEM
  // ============================================
  
  /**
   * Brand gradient colors for animations and special effects
   * Matches AIOS logo gradient: magenta → purple → blue
   */
  gradient: {
    /** Gradient start - Magenta (logo top) */
    start: chalk.hex('#EC4899'),
    
    /** Gradient middle - Purple (brand) */
    middle: chalk.hex('#8B5CF6'),
    
    /** Gradient end - Blue (logo bottom) */
    end: chalk.hex('#3B82F6'),
  },
  
  // ============================================
  // SEMANTIC SHORTCUTS
  // ============================================
  
  /**
   * Highlighted text - Bold magenta for key information
   */
  highlight: chalk.hex('#EC4899').bold,
  
  /**
   * Primary branding - Bold purple for AIOS brand moments
   */
  brandPrimary: chalk.hex('#8B5CF6').bold,
  
  /**
   * Secondary branding - Cyan for supporting brand elements
   */
  brandSecondary: chalk.hex('#06B6D4'),
};

/**
 * Pre-formatted status indicators with color and symbols
 */
const status = {
  /** Success indicator: ✓ (green) */
  success: (text) => `${colors.success('✓')} ${text}`,
  
  /** Error indicator: ✗ (red) */
  error: (text) => `${colors.error('✗')} ${text}`,
  
  /** Warning indicator: ⚠️ (orange) */
  warning: (text) => `${colors.warning('⚠️')} ${text}`,
  
  /** Info indicator: ℹ (cyan) */
  info: (text) => `${colors.info('ℹ')} ${text}`,
  
  /** Loading indicator: ⏳ (cyan) */
  loading: (text) => `${colors.info('⏳')} ${text}`,
  
  /** Skipped indicator: ⊘ (muted) */
  skipped: (text) => `${colors.muted('⊘')} ${text}`,
  
  /** Tip indicator: 💡 (info) */
  tip: (text) => `${colors.info('💡')} ${text}`,
  
  /** Party indicator: 🎉 (brand primary) */
  celebrate: (text) => `${colors.brandPrimary('🎉')} ${text}`,
};

/**
 * Formatted heading helpers
 */
const headings = {
  /** H1 - Brand primary, bold, large spacing */
  h1: (text) => `\n${colors.brandPrimary(text)}\n`,
  
  /** H2 - Primary color, bold */
  h2: (text) => `\n${colors.primary.bold(text)}\n`,
  
  /** H3 - Primary color */
  h3: (text) => colors.primary(text),
  
  /** Section divider */
  divider: () => colors.dim('─'.repeat(50)),
};

/**
 * Formatted list helpers
 */
const lists = {
  /** Bullet point (primary) */
  bullet: (text) => `${colors.primary('•')} ${text}`,
  
  /** Numbered item (primary) */
  numbered: (num, text) => `${colors.primary(`${num}.`)} ${text}`,
  
  /** Checkbox unchecked */
  checkbox: (text, checked = false) => {
    const icon = checked ? colors.success('☑') : colors.muted('☐');
    return `${icon} ${text}`;
  },
};

/**
 * Example usage for documentation
 */
const examples = {
  welcome: () => {
    console.log(headings.h1('🎉 Welcome to AIOS v4 Installer!'));
    console.log(colors.info('Let\'s configure your project in just a few steps...\n'));
  },
  
  question: () => {
    console.log(colors.primary('? Select your project type:'));
    console.log(lists.bullet('Greenfield (new project)'));
    console.log(lists.bullet('Brownfield (existing project)'));
  },
  
  progress: () => {
    console.log(status.loading('Installing dependencies...'));
    console.log(status.success('Dependencies installed'));
    console.log(status.loading('Configuring environment...'));
  },
  
  feedback: () => {
    console.log(status.success('Configuration complete!'));
    console.log(status.warning('Existing .env found. Overwrite?'));
    console.log(status.error('Invalid path provided'));
    console.log(status.tip('You can change this later in settings'));
  },
  
  complete: () => {
    console.log('\n' + headings.divider());
    console.log(status.celebrate('Installation Complete!'));
    console.log(colors.info('Your AIOS project is ready to use.'));
    console.log(headings.divider() + '\n');
  },
};

// Export all utilities
module.exports = {
  colors,
  status,
  headings,
  lists,
  examples,
};

// Also export as default for ESM compatibility
module.exports.default = module.exports;

