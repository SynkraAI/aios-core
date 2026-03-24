/**
 * Tests for R2 operations: createClientFolderStructure and listClientAssets.
 * AC: 4, 7, 8
 */
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

import { createClientFolderStructure, listClientAssets } from '../operations';
import { ASSET_FOLDERS } from '../types';

// Mock the S3Client send method
const mockSend = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...actual,
    S3Client: jest.fn().mockImplementation(() => ({
      send: (...args: unknown[]) => mockSend(...args),
    })),
  };
});

describe('createClientFolderStructure', () => {
  const client = new S3Client({});
  const bucket = 'test-bucket';

  beforeEach(() => {
    mockSend.mockReset();
    mockSend.mockResolvedValue({});
  });

  it('creates .keep placeholder in all 10 ASSET_FOLDERS', async () => {
    const result = await createClientFolderStructure('acme-corp', client, bucket);

    // Should have called PutObject 10 times
    expect(mockSend).toHaveBeenCalledTimes(10);
    expect(result).toHaveLength(10);

    // Verify each folder was created
    for (let i = 0; i < ASSET_FOLDERS.length; i++) {
      const call = mockSend.mock.calls[i][0];
      expect(call).toBeInstanceOf(PutObjectCommand);
      expect(call.input.Bucket).toBe(bucket);
      expect(call.input.Key).toBe(`acme-corp/${ASSET_FOLDERS[i]}/.keep`);
      expect(call.input.ContentType).toBe('application/x-empty');
    }
  });

  it('returns array of created folder paths', async () => {
    const result = await createClientFolderStructure('client-123', client, bucket);

    expect(result).toEqual(ASSET_FOLDERS.map((f) => `client-123/${f}/`));
  });

  it('is idempotent — PutObject overwrites without error', async () => {
    // Call twice — should succeed both times
    await createClientFolderStructure('acme', client, bucket);
    await createClientFolderStructure('acme', client, bucket);

    expect(mockSend).toHaveBeenCalledTimes(20);
  });

  it('throws on empty clientId', async () => {
    await expect(createClientFolderStructure('', client, bucket)).rejects.toThrow(
      'Client ID cannot be empty',
    );
  });

  it('throws on whitespace-only clientId', async () => {
    await expect(createClientFolderStructure('   ', client, bucket)).rejects.toThrow(
      'Client ID cannot be empty',
    );
  });

  it('propagates S3 errors', async () => {
    mockSend.mockRejectedValue(new Error('Access Denied'));

    await expect(createClientFolderStructure('acme', client, bucket)).rejects.toThrow(
      'Access Denied',
    );
  });
});

describe('listClientAssets', () => {
  const client = new S3Client({});
  const bucket = 'test-bucket';

  beforeEach(() => {
    mockSend.mockReset();
  });

  it('lists all assets for a client (no folder filter)', async () => {
    mockSend.mockResolvedValue({
      Contents: [
        {
          Key: 'acme/01-brand-identity/logo.png',
          Size: 1024,
          LastModified: new Date('2026-03-16'),
          ETag: '"abc"',
        },
        {
          Key: 'acme/03-social-media/post.jpg',
          Size: 2048,
          LastModified: new Date('2026-03-16'),
          ETag: '"def"',
        },
      ],
      IsTruncated: false,
    });

    const result = await listClientAssets('acme', client, bucket);

    expect(result.objects).toHaveLength(2);
    expect(result.isTruncated).toBe(false);
    expect(result.objects[0].key).toBe('acme/01-brand-identity/logo.png');
    expect(result.objects[1].key).toBe('acme/03-social-media/post.jpg');
  });

  it('filters by folder when specified', async () => {
    mockSend.mockResolvedValue({
      Contents: [
        {
          Key: 'acme/01-brand-identity/logo.png',
          Size: 1024,
          LastModified: new Date('2026-03-16'),
        },
      ],
      IsTruncated: false,
    });

    const result = await listClientAssets('acme', client, bucket, {
      folder: '01-brand-identity',
    });

    expect(result.objects).toHaveLength(1);

    // Verify the ListObjectsV2Command was called with the right prefix
    const call = mockSend.mock.calls[0][0];
    expect(call).toBeInstanceOf(ListObjectsV2Command);
    expect(call.input.Prefix).toBe('acme/01-brand-identity/');
  });

  it('supports pagination via continuationToken', async () => {
    // First page
    mockSend.mockResolvedValueOnce({
      Contents: [{ Key: 'acme/01-brand-identity/logo1.png', Size: 1024, LastModified: new Date() }],
      IsTruncated: true,
      NextContinuationToken: 'token-abc',
    });

    const page1 = await listClientAssets('acme', client, bucket, { maxKeys: 1 });
    expect(page1.objects).toHaveLength(1);
    expect(page1.isTruncated).toBe(true);
    expect(page1.nextContinuationToken).toBe('token-abc');

    // Second page
    mockSend.mockResolvedValueOnce({
      Contents: [{ Key: 'acme/01-brand-identity/logo2.png', Size: 2048, LastModified: new Date() }],
      IsTruncated: false,
    });

    const page2 = await listClientAssets('acme', client, bucket, {
      continuationToken: 'token-abc',
      maxKeys: 1,
    });
    expect(page2.objects).toHaveLength(1);
    expect(page2.isTruncated).toBe(false);
  });

  it('returns empty array when no objects found', async () => {
    mockSend.mockResolvedValue({
      Contents: [],
      IsTruncated: false,
    });

    const result = await listClientAssets('acme', client, bucket);
    expect(result.objects).toHaveLength(0);
    expect(result.isTruncated).toBe(false);
  });

  it('handles undefined Contents gracefully', async () => {
    mockSend.mockResolvedValue({
      IsTruncated: false,
    });

    const result = await listClientAssets('acme', client, bucket);
    expect(result.objects).toHaveLength(0);
  });
});
