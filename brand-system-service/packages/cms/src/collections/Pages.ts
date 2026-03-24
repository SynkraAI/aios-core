/**
 * Pages Collection Configuration (BSS-5.6, AC-4, AC-7)
 *
 * Payload CMS 3.x collection for managing site pages.
 * Includes draft/publish workflow via Payload's versions feature.
 *
 * Fields:
 * - slug (text, unique)
 * - title (text, required)
 * - template (select)
 * - content (rich text, Lexical editor)
 * - seoTitle (text, max 60)
 * - seoDescription (text, max 155)
 * - status (select: draft | published)
 * - publishedAt (date)
 */

import type { CMSTemplate, PageStatus } from '../types';
import {
  adminAccess,
  editorReadAccess,
  editorWriteAccess,
  viewerAccess,
} from '../access/roles';

/**
 * Payload CMS collection config type (simplified for portable definition).
 * Full typing comes from `payload` when installed as peer dependency.
 */
export interface PagesCollectionConfig {
  readonly slug: string;
  readonly admin: { readonly useAsTitle: string };
  readonly access: {
    readonly read: typeof viewerAccess;
    readonly create: typeof editorWriteAccess;
    readonly update: typeof editorWriteAccess;
    readonly delete: typeof adminAccess;
  };
  readonly versions: {
    readonly drafts: { readonly autosave: boolean };
  };
  readonly fields: readonly PagesField[];
}

interface PagesField {
  readonly name: string;
  readonly type: string;
  readonly required?: boolean;
  readonly unique?: boolean;
  readonly maxLength?: number;
  readonly options?: readonly FieldOption[];
  readonly defaultValue?: string | boolean;
  readonly admin?: Record<string, unknown>;
  readonly hooks?: Record<string, unknown>;
}

interface FieldOption {
  readonly label: string;
  readonly value: string;
}

// ---------------------------------------------------------------------------
// Template options
// ---------------------------------------------------------------------------

const TEMPLATE_OPTIONS: readonly FieldOption[] = [
  { label: 'Landing Page', value: 'landing-page' },
  { label: 'About', value: 'about' },
  { label: 'Services', value: 'services' },
  { label: 'Blog Post', value: 'blog-post' },
  { label: 'Contact', value: 'contact' },
  { label: 'Pricing', value: 'pricing' },
  { label: 'Terms & Privacy', value: 'terms-privacy' },
  { label: '404', value: '404' },
] satisfies readonly { label: string; value: CMSTemplate }[];

const STATUS_OPTIONS: readonly FieldOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
] satisfies readonly { label: string; value: PageStatus }[];

// ---------------------------------------------------------------------------
// Collection definition
// ---------------------------------------------------------------------------

export const Pages: PagesCollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: viewerAccess,
    create: editorWriteAccess,
    update: editorWriteAccess,
    delete: adminAccess,
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g., "about-us")',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'template',
      type: 'select',
      required: true,
      options: TEMPLATE_OPTIONS,
      defaultValue: 'landing-page',
    },
    {
      name: 'content',
      type: 'richText',
      required: false,
      admin: {
        description: 'Page body content (Lexical editor)',
      },
    },
    {
      name: 'seoTitle',
      type: 'text',
      required: false,
      maxLength: 60,
      admin: {
        description: 'SEO title (max 60 characters)',
      },
    },
    {
      name: 'seoDescription',
      type: 'text',
      required: false,
      maxLength: 155,
      admin: {
        description: 'SEO meta description (max 155 characters)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: STATUS_OPTIONS,
      defaultValue: 'draft',
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: false,
      admin: {
        description: 'Automatically set when status changes to published',
      },
    },
  ],
};
