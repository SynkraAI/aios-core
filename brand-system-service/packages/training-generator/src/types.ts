/**
 * Types of training guides that can be generated.
 */
export type TrainingGuideType =
  | 'brand_usage'
  | 'static_site_update'
  | 'social_media'
  | 'developer_onboarding';

/**
 * Loom video placeholder configuration.
 */
export interface LoomPlaceholder {
  /** Suggested video title */
  readonly title: string;
  /** Target duration in minutes */
  readonly duration: string;
  /** Bullet-point outline for recording */
  readonly outline: readonly string[];
  /** Loom URL (empty string if not yet recorded) */
  readonly url: string;
}

/**
 * Training configuration per client (training-config.yaml schema).
 */
export interface TrainingConfig {
  /** Client identifier */
  readonly clientId: string;
  /** Brand tokens package name (e.g., '@brand-system/acme-tokens') */
  readonly brandTokensPackage: string;
  /** Client display name */
  readonly clientName: string;
  /** Primary brand color in hex */
  readonly primaryColor: string;
  /** Which guides to generate */
  readonly guides: {
    readonly brand_usage: boolean;
    readonly static_site_update: boolean;
    readonly social_media: boolean;
    readonly developer_onboarding: boolean;
  };
  /** Loom video URLs per guide (empty string if not yet recorded) */
  readonly loomPlaceholders: {
    readonly brand_usage: string;
    readonly static_site_update: string;
    readonly social_media: string;
    readonly developer_onboarding: string;
  };
}

/**
 * Result of generating a training document.
 */
export interface TrainingGenerationResult {
  /** Guide type that was generated */
  readonly guideType: TrainingGuideType;
  /** Generated HTML content */
  readonly html: string;
  /** Output file name */
  readonly fileName: string;
  /** Whether generation was successful */
  readonly success: boolean;
  /** Error message if generation failed */
  readonly error?: string;
}

/**
 * Result of a full training generation run.
 */
export interface TrainingBatchResult {
  /** Client ID the training was generated for */
  readonly clientId: string;
  /** Individual guide results */
  readonly guides: readonly TrainingGenerationResult[];
  /** Index page HTML */
  readonly indexHtml: string;
  /** Total guides generated successfully */
  readonly successCount: number;
  /** Total guides that failed */
  readonly failCount: number;
}

/**
 * R2 upload configuration for training files.
 */
export interface TrainingUploadConfig {
  /** R2 bucket name */
  readonly bucketName: string;
  /** R2 endpoint URL */
  readonly endpoint: string;
  /** R2 access key ID */
  readonly accessKeyId: string;
  /** R2 secret access key */
  readonly secretAccessKey: string;
  /** Signed URL expiry in seconds (default: 30 days = 2592000) */
  readonly signedUrlExpiry?: number;
}

/**
 * Default Loom placeholders for each guide type.
 */
export const DEFAULT_LOOM_PLACEHOLDERS: Record<TrainingGuideType, LoomPlaceholder> = {
  brand_usage: {
    title: 'Brand System Walkthrough',
    duration: '3-5 min',
    outline: [
      'Open the brand book (online or PDF)',
      'Walk through color palette and typography',
      'Demonstrate logo usage and clear space rules',
      'Show tone of voice guidelines with examples',
      'Quick-reference card overview',
    ],
    url: '',
  },
  static_site_update: {
    title: 'Static Site Content Updates',
    duration: '3-5 min',
    outline: [
      'Open the HTML files in a text editor',
      'Show how to update text content',
      'Demonstrate image replacement process',
      'Explain R2 upload path naming',
      'When to escalate to a developer',
    ],
    url: '',
  },
  social_media: {
    title: 'Social Media Content Guide',
    duration: '3-5 min',
    outline: [
      'Open the content calendar spreadsheet',
      'Walk through template usage in Canva',
      'Explain hashtag strategy (niche/medium/broad)',
      'Review posting cadence by platform',
      'Brand voice reminders for social copy',
    ],
    url: '',
  },
  developer_onboarding: {
    title: 'Design System Developer Setup',
    duration: '3-5 min',
    outline: [
      'Install the token package via npm',
      'Import CSS custom properties into your project',
      'Configure Tailwind with brand tokens',
      'How to request token updates from the brand team',
      'Troubleshooting common integration issues',
    ],
    url: '',
  },
};

/** Training R2 upload expiry: 30 days in seconds */
export const TRAINING_SIGNED_URL_EXPIRY = 2592000;
