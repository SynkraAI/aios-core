/**
 * Tests for signed URL generation — both api (15min) and download (1h) tiers.
 * AC: 3, 9
 */
import { generateSignedDownloadUrl, generateSignedUploadUrl } from '../signed-urls';
import { SIGNED_URL_EXPIRY } from '../types';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => ({
  GetObjectCommand: jest.fn().mockImplementation((input) => ({ _type: 'GetObject', ...input })),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ _type: 'PutObject', ...input })),
  S3Client: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://r2.example.com/signed-url?token=abc'),
}));

// Mock retry to pass-through (no delay)
jest.mock('../retry', () => ({
  withRetry: jest.fn().mockImplementation((fn: () => Promise<unknown>) => fn()),
}));

// Mock path-validator
jest.mock('../path-validator', () => ({
  validatePath: jest.fn().mockReturnValue({ valid: true }),
}));

/* eslint-disable @typescript-eslint/no-var-requires */
const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const { validatePath } = require('../path-validator');
/* eslint-enable @typescript-eslint/no-var-requires */

describe('generateSignedDownloadUrl', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockClient = {} as any;
  const bucket = 'brand-assets';
  const clientId = 'acme';
  const r2Key = 'acme/01-brand-identity/logo.png';

  beforeEach(() => {
    jest.clearAllMocks();
    (validatePath as jest.Mock).mockReturnValue({ valid: true });
  });

  it('generates a signed download URL', async () => {
    const url = await generateSignedDownloadUrl(mockClient, bucket, clientId, r2Key);
    expect(url).toBe('https://r2.example.com/signed-url?token=abc');
  });

  it('uses download tier expiry (1h) by default', async () => {
    await generateSignedDownloadUrl(mockClient, bucket, clientId, r2Key);
    expect(getSignedUrl).toHaveBeenCalledWith(mockClient, expect.anything(), {
      expiresIn: SIGNED_URL_EXPIRY.download,
    });
  });

  it('uses api tier expiry (15min) when purpose is api', async () => {
    await generateSignedDownloadUrl(mockClient, bucket, clientId, r2Key, 'api');
    expect(getSignedUrl).toHaveBeenCalledWith(mockClient, expect.anything(), {
      expiresIn: SIGNED_URL_EXPIRY.api,
    });
  });

  it('creates a GetObjectCommand with correct bucket and key', async () => {
    await generateSignedDownloadUrl(mockClient, bucket, clientId, r2Key);
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: bucket,
      Key: r2Key,
    });
  });

  it('validates path before generating URL', async () => {
    await generateSignedDownloadUrl(mockClient, bucket, clientId, r2Key);
    expect(validatePath).toHaveBeenCalledWith(clientId, r2Key);
  });

  it('throws when path validation fails', async () => {
    (validatePath as jest.Mock).mockReturnValue({ valid: false, error: 'bad path' });
    await expect(generateSignedDownloadUrl(mockClient, bucket, clientId, r2Key)).rejects.toThrow(
      'Path validation failed: bad path',
    );
  });
});

describe('generateSignedUploadUrl', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockClient = {} as any;
  const bucket = 'brand-assets';
  const clientId = 'acme';
  const r2Key = 'acme/01-brand-identity/logo.png';
  const contentType = 'image/png';

  beforeEach(() => {
    jest.clearAllMocks();
    (validatePath as jest.Mock).mockReturnValue({ valid: true });
  });

  it('generates a signed upload URL', async () => {
    const url = await generateSignedUploadUrl(mockClient, bucket, clientId, r2Key, contentType);
    expect(url).toBe('https://r2.example.com/signed-url?token=abc');
  });

  it('always uses api tier expiry (15min) for uploads', async () => {
    await generateSignedUploadUrl(mockClient, bucket, clientId, r2Key, contentType);
    expect(getSignedUrl).toHaveBeenCalledWith(mockClient, expect.anything(), {
      expiresIn: SIGNED_URL_EXPIRY.api,
    });
  });

  it('creates a PutObjectCommand with content type', async () => {
    await generateSignedUploadUrl(mockClient, bucket, clientId, r2Key, contentType);
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: bucket,
      Key: r2Key,
      ContentType: contentType,
    });
  });

  it('throws when path validation fails', async () => {
    (validatePath as jest.Mock).mockReturnValue({ valid: false, error: 'invalid path' });
    await expect(
      generateSignedUploadUrl(mockClient, bucket, clientId, r2Key, contentType),
    ).rejects.toThrow('Path validation failed: invalid path');
  });
});

describe('SIGNED_URL_EXPIRY constants', () => {
  it('api tier is 15 minutes (900 seconds)', () => {
    expect(SIGNED_URL_EXPIRY.api).toBe(900);
  });

  it('download tier is 1 hour (3600 seconds)', () => {
    expect(SIGNED_URL_EXPIRY.download).toBe(3600);
  });
});
