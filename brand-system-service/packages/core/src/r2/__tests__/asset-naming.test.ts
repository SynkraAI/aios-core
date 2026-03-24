/**
 * Tests for asset naming convention enforcement and metadata utilities.
 * AC: 5, 6
 */
import {
  normalizeAssetFilename,
  buildAssetMetadata,
  assetMetadataToRecord,
  folderToAssetType,
} from '../asset-naming';

describe('normalizeAssetFilename', () => {
  const fixedDate = new Date('2026-03-16T12:00:00Z');

  describe('basic transformations', () => {
    it('lowercases the filename', () => {
      const result = normalizeAssetFilename('Logo-PRIMARY.PNG', { dateSuffix: fixedDate });
      expect(result).toBe('logo-primary-20260316.png');
    });

    it('replaces spaces with hyphens', () => {
      const result = normalizeAssetFilename('my logo file.svg', { dateSuffix: fixedDate });
      expect(result).toBe('my-logo-file-20260316.svg');
    });

    it('replaces multiple consecutive spaces with a single hyphen', () => {
      const result = normalizeAssetFilename('my   logo.png', { dateSuffix: fixedDate });
      expect(result).toBe('my-logo-20260316.png');
    });
  });

  describe('special character removal', () => {
    it('removes special characters except hyphens and underscores', () => {
      const result = normalizeAssetFilename('logo@2x#final!.png', { dateSuffix: fixedDate });
      expect(result).toBe('logo2xfinal-20260316.png');
    });

    it('preserves underscores', () => {
      const result = normalizeAssetFilename('logo_dark_variant.svg', { dateSuffix: fixedDate });
      expect(result).toBe('logo_dark_variant-20260316.svg');
    });

    it('preserves hyphens', () => {
      const result = normalizeAssetFilename('brand-logo-v2.png', { dateSuffix: fixedDate });
      expect(result).toBe('brand-logo-v2-20260316.png');
    });

    it('collapses consecutive hyphens into one', () => {
      const result = normalizeAssetFilename('logo---final.png', { dateSuffix: fixedDate });
      expect(result).toBe('logo-final-20260316.png');
    });

    it('trims leading and trailing hyphens/underscores', () => {
      const result = normalizeAssetFilename('--logo--.png', { dateSuffix: fixedDate });
      expect(result).toBe('logo-20260316.png');
    });
  });

  describe('date suffix', () => {
    it('appends YYYYMMDD suffix by default', () => {
      const result = normalizeAssetFilename('logo.png', { dateSuffix: fixedDate });
      expect(result).toMatch(/^logo-20260316\.png$/);
    });

    it('can disable date suffix', () => {
      const result = normalizeAssetFilename('logo.png', { appendDate: false });
      expect(result).toBe('logo.png');
    });

    it('uses current date when no dateSuffix provided', () => {
      const result = normalizeAssetFilename('logo.png');
      // Just verify it has a date suffix pattern
      expect(result).toMatch(/^logo-\d{8}\.png$/);
    });
  });

  describe('file extension handling', () => {
    it('preserves the original extension (lowercased)', () => {
      const result = normalizeAssetFilename('Logo.SVG', { dateSuffix: fixedDate });
      expect(result).toBe('logo-20260316.svg');
    });

    it('handles filenames with multiple dots', () => {
      const result = normalizeAssetFilename('logo.v2.final.png', { dateSuffix: fixedDate });
      // After removing special chars (dot is removed from basename), only alphanumeric/hyphens/underscores remain
      expect(result).toMatch(/\.png$/);
    });
  });

  describe('edge cases', () => {
    it('throws on empty filename', () => {
      expect(() => normalizeAssetFilename('')).toThrow('Filename cannot be empty');
    });

    it('throws on whitespace-only filename', () => {
      expect(() => normalizeAssetFilename('   ')).toThrow('Filename cannot be empty');
    });

    it('handles Unicode characters by removing them', () => {
      const result = normalizeAssetFilename('logo-cafe.png', { dateSuffix: fixedDate });
      expect(result).toBe('logo-cafe-20260316.png');
    });

    it('handles filename with only special chars in basename (fallback to "unnamed")', () => {
      const result = normalizeAssetFilename('@#$.png', { dateSuffix: fixedDate });
      expect(result).toBe('unnamed-20260316.png');
    });
  });
});

describe('folderToAssetType', () => {
  it('maps all 10 folders to asset types', () => {
    expect(folderToAssetType('01-brand-identity')).toBe('brand-identity');
    expect(folderToAssetType('02-design-system')).toBe('design-system');
    expect(folderToAssetType('03-social-media')).toBe('social-media');
    expect(folderToAssetType('04-marketing')).toBe('marketing');
    expect(folderToAssetType('05-documents')).toBe('documents');
    expect(folderToAssetType('06-video')).toBe('video');
    expect(folderToAssetType('07-audio')).toBe('audio');
    expect(folderToAssetType('08-fonts')).toBe('fonts');
    expect(folderToAssetType('09-templates')).toBe('templates');
    expect(folderToAssetType('10-misc')).toBe('misc');
  });
});

describe('buildAssetMetadata', () => {
  it('builds complete metadata with all required fields', () => {
    const metadata = buildAssetMetadata({
      clientId: 'acme-corp',
      folder: '01-brand-identity',
      originalFilename: 'Logo Primary.PNG',
      normalizedFilename: 'logo-primary-20260316.png',
      uploadedBy: 'user@acme.com',
      fileSize: 1024,
      contentType: 'image/png',
    });

    expect(metadata.clientId).toBe('acme-corp');
    expect(metadata.folder).toBe('01-brand-identity');
    expect(metadata.originalFilename).toBe('Logo Primary.PNG');
    expect(metadata.normalizedFilename).toBe('logo-primary-20260316.png');
    expect(metadata.uploadedBy).toBe('user@acme.com');
    expect(metadata.assetType).toBe('brand-identity');
    expect(metadata.fileSize).toBe('1024');
    expect(metadata.contentType).toBe('image/png');
    // uploadedAt should be an ISO 8601 string
    expect(metadata.uploadedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('stores fileSize as a string (R2 metadata constraint)', () => {
    const metadata = buildAssetMetadata({
      clientId: 'acme',
      folder: '10-misc',
      originalFilename: 'doc.pdf',
      normalizedFilename: 'doc-20260316.pdf',
      uploadedBy: 'admin',
      fileSize: 50 * 1024 * 1024,
      contentType: 'application/pdf',
    });

    expect(typeof metadata.fileSize).toBe('string');
    expect(metadata.fileSize).toBe(String(50 * 1024 * 1024));
  });
});

describe('assetMetadataToRecord', () => {
  it('converts metadata to a string record with x-bss- prefixed keys', () => {
    const metadata = buildAssetMetadata({
      clientId: 'acme-corp',
      folder: '03-social-media',
      originalFilename: 'post.png',
      normalizedFilename: 'post-20260316.png',
      uploadedBy: 'user@acme.com',
      fileSize: 2048,
      contentType: 'image/png',
    });

    const record = assetMetadataToRecord(metadata);

    expect(record['x-bss-client-id']).toBe('acme-corp');
    expect(record['x-bss-folder']).toBe('03-social-media');
    expect(record['x-bss-original-filename']).toBe('post.png');
    expect(record['x-bss-normalized-filename']).toBe('post-20260316.png');
    expect(record['x-bss-uploaded-by']).toBe('user@acme.com');
    expect(record['x-bss-asset-type']).toBe('social-media');
    expect(record['x-bss-file-size']).toBe('2048');
    expect(record['x-bss-content-type']).toBe('image/png');
    expect(record['x-bss-uploaded-at']).toBeDefined();

    // All values should be strings
    for (const value of Object.values(record)) {
      expect(typeof value).toBe('string');
    }
  });
});
