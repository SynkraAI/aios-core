/**
 * Tests for R2 client creation and configuration.
 * AC: 2, 8, 9
 */
import { createR2Client, r2ConfigFromEnv } from '../client';
import type { R2Config } from '../types';

// Mock the S3Client constructor
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation((config) => ({
    _config: config,
    send: jest.fn(),
    destroy: jest.fn(),
  })),
}));

describe('createR2Client', () => {
  const validConfig: R2Config = {
    accountId: 'test-account-123',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLE',
    bucketName: 'brand-assets',
    region: 'auto',
  };

  it('creates a client with valid configuration', () => {
    const client = createR2Client(validConfig);
    expect(client).toBeDefined();
  });

  it('uses the correct R2 endpoint format', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client } = require('@aws-sdk/client-s3');
    createR2Client(validConfig);

    expect(S3Client).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: `https://${validConfig.accountId}.r2.cloudflarestorage.com`,
      }),
    );
  });

  it('enables path-style addressing (required for R2)', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client } = require('@aws-sdk/client-s3');
    createR2Client(validConfig);

    expect(S3Client).toHaveBeenCalledWith(
      expect.objectContaining({
        forcePathStyle: true,
      }),
    );
  });

  it('defaults region to auto', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client } = require('@aws-sdk/client-s3');
    const configNoRegion: R2Config = { ...validConfig, region: undefined };
    createR2Client(configNoRegion);

    expect(S3Client).toHaveBeenCalledWith(
      expect.objectContaining({
        region: 'auto',
      }),
    );
  });

  it('passes credentials correctly', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client } = require('@aws-sdk/client-s3');
    createR2Client(validConfig);

    expect(S3Client).toHaveBeenCalledWith(
      expect.objectContaining({
        credentials: {
          accessKeyId: validConfig.accessKeyId,
          secretAccessKey: validConfig.secretAccessKey,
        },
      }),
    );
  });

  describe('validation errors', () => {
    it('throws ConfigError when accountId is missing', () => {
      expect(() => createR2Client({ ...validConfig, accountId: '' })).toThrow(
        'R2_ACCOUNT_ID is required',
      );
    });

    it('throws ConfigError when accessKeyId is missing', () => {
      expect(() => createR2Client({ ...validConfig, accessKeyId: '' })).toThrow(
        'R2_ACCESS_KEY_ID is required',
      );
    });

    it('throws ConfigError when secretAccessKey is missing', () => {
      expect(() => createR2Client({ ...validConfig, secretAccessKey: '' })).toThrow(
        'R2_SECRET_ACCESS_KEY is required',
      );
    });

    it('throws ConfigError when bucketName is missing', () => {
      expect(() => createR2Client({ ...validConfig, bucketName: '' })).toThrow(
        'R2_BUCKET_NAME is required',
      );
    });
  });
});

describe('r2ConfigFromEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('reads all R2 config from environment', () => {
    process.env['R2_ACCOUNT_ID'] = 'env-account';
    process.env['R2_ACCESS_KEY_ID'] = 'env-key';
    process.env['R2_SECRET_ACCESS_KEY'] = 'env-secret';
    process.env['R2_BUCKET_NAME'] = 'my-bucket';
    process.env['R2_REGION'] = 'us-east-1';

    const config = r2ConfigFromEnv();

    expect(config).toEqual({
      accountId: 'env-account',
      accessKeyId: 'env-key',
      secretAccessKey: 'env-secret',
      bucketName: 'my-bucket',
      region: 'us-east-1',
    });
  });

  it('defaults bucketName to brand-assets', () => {
    process.env['R2_ACCOUNT_ID'] = 'x';
    process.env['R2_ACCESS_KEY_ID'] = 'x';
    process.env['R2_SECRET_ACCESS_KEY'] = 'x';
    delete process.env['R2_BUCKET_NAME'];

    const config = r2ConfigFromEnv();
    expect(config.bucketName).toBe('brand-assets');
  });

  it('defaults region to auto', () => {
    process.env['R2_ACCOUNT_ID'] = 'x';
    process.env['R2_ACCESS_KEY_ID'] = 'x';
    process.env['R2_SECRET_ACCESS_KEY'] = 'x';
    delete process.env['R2_REGION'];

    const config = r2ConfigFromEnv();
    expect(config.region).toBe('auto');
  });

  it('returns empty strings for missing required values', () => {
    delete process.env['R2_ACCOUNT_ID'];
    delete process.env['R2_ACCESS_KEY_ID'];
    delete process.env['R2_SECRET_ACCESS_KEY'];

    const config = r2ConfigFromEnv();
    expect(config.accountId).toBe('');
    expect(config.accessKeyId).toBe('');
    expect(config.secretAccessKey).toBe('');
  });
});
