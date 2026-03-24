/**
 * @bss/static-generator - Static Site Generator
 *
 * Generates static HTML/CSS/JS for Brand Books, Landing Pages,
 * and Institutional Sites per ADR-001 (Static-First Architecture).
 *
 * Key responsibilities:
 * - HTML generation from Eta templates
 * - Build-time token injection as rendered HTML
 * - Three delivery formats: online deploy, PDF, local package (ZIP)
 * - Platform-agnostic output (Vercel, Netlify, any static host)
 * - Relative paths for local package portability (NFR-9.2)
 * - Client-side search via Fuse.js
 */

export {
  StaticGenerator,
  loadBrandConfig,
  injectColors,
  injectTypography,
  injectSpacing,
  injectComponents,
  buildSearchIndex,
  BRAND_BOOK_PAGES,
  type GeneratorOptions,
  type GeneratorConfig,
  type BrandConfig,
  type BuildType,
  type ColorSwatch,
  type ColorGroup,
  type TypographySpecimen,
  type SpacingBlock,
  type ComponentProperty,
  type ComponentGroup,
  type SearchIndexEntry,
  type BrandBookPage,
} from './static-generator';

export {
  PdfGenerator,
  type PdfGeneratorConfig,
  type PdfGeneratorResult,
} from './pdf-generator';

export {
  downloadGoogleFonts,
  extractGoogleFontFamilies,
  type FontDownloadResult,
} from './font-downloader';

export {
  validateRelativePaths,
  replaceGoogleFontsLinks,
  inlineSearchIndex,
  type PathViolation,
  type ValidationResult,
} from './path-validator';

export {
  buildPackage,
  generateReadme,
  type PackageBuildOptions,
  type PackageBuildResult,
} from './package-builder';

export {
  runBuildPipeline,
  type BuildResult,
} from './build-pipeline';

export {
  generateToc,
  type TocEntry,
  type TocChild,
} from './toc-generator';

// Copy Framework (BSS-5.4)
export {
  LandingPageCopyFramework,
  CopyValidator,
  CopyPlaceholderGenerator,
  copyToTemplateVars,
  type CopyBrief,
  type Testimonial,
  type PricingTierBrief,
  type FaqItemBrief,
  type LandingPageCopy,
  type HeroCopy,
  type ProblemCopy,
  type SolutionCopy,
  type SolutionFeature,
  type HowItWorksCopy,
  type HowItWorksStep,
  type SocialProofCopy,
  type SocialProofTestimonial,
  type SocialProofMetric,
  type PricingCopy,
  type PricingTier,
  type FaqCopy,
  type FaqItem,
  type FinalCtaCopy,
  type HeroSocialProof,
  type ValidationResult as CopyValidationResult,
  type ValidationIssue,
  type ValidationSeverity,
  type SectionWordCount,
} from './copy-framework';

// SEO Engine (BSS-5.5)
export {
  SEOMetadataEngine,
  type SEOInput,
  type SEOMetadata,
  type OpenGraphMeta,
  type ImageInput,
  type HeadingEntry,
  type SEOWarning,
  type SitemapEntry,
  type RobotsConfig,
  type RobotsRule,
} from './seo';

// Microcopy Guide (BSS-5.7)
export {
  MicrocopyGuide,
  type MicrocopyInput,
  type MicrocopyItem,
  type MicrocopyData,
  type MicrocopySection,
  type MicrocopyValidationError,
} from './microcopy';

// Static Package Exporter (BSS-5.8)
export {
  StaticPackageExporter,
  ExportError,
  type ExportOptions,
  type ExportResult,
} from './exporter';
