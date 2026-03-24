/**
 * Tests for upload and download round-trip plus error scenarios.
 * AC: 4, 5, 9
 */
import { downloadAsset, getDownloadUrl } from '../download';
import { uploadAsset, uploadAssetWithPreview } from '../upload';

// Mock AWS SDK
const mockSend = jest.fn();
jest.mock('@aws-sdk/client-s3', () => ({
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ _type: 'PutObject', ...input })),
  GetObjectCommand: jest.fn().mockImplementation((input) => ({ _type: 'GetObject', ...input })),
  HeadObjectCommand: jest.fn().mockImplementation((input) => ({ _type: 'HeadObject', ...input })),
  S3Client: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://r2.example.com/preview-url'),
}));

// Mock retry to pass-through
jest.mock('../retry', () => ({
  withRetry: jest.fn().mockImplementation((fn: () => Promise<unknown>) => fn()),
}));

// Mock path-validator
jest.mock('../path-validator', () => ({
  validatePath: jest.fn().mockReturnValue({ valid: true }),
  validateFile: jest.fn().mockReturnValue({ valid: true }),
  buildR2Key: jest
    .fn()
    .mockImplementation(
      (clientId: string, folder: string, filename: string) => `${clientId}/${folder}/${filename}`,
    ),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { validatePath, validateFile } = require('../path-validator');

describe('uploadAsset', () => {
  const mockClient = { send: mockSend } as unknown as import('@aws-sdk/client-s3').S3Client;
  const bucket = 'brand-assets';
  const clientId = 'acme';
  const folder = '01-brand-identity';
  const filename = 'logo.png';
  const body = Buffer.from('fake-image-data');

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockResolvedValue({ ETag: '"abc123"' });
    (validatePath as jest.Mock).mockReturnValue({ valid: true });
    (validateFile as jest.Mock).mockReturnValue({ valid: true });
  });

  it('uploads an asset and returns UploadResult', async () => {
    const result = await uploadAsset(mockClient, bucket, clientId, folder, filename, body);

    expect(result).toEqual({
      key: 'acme/01-brand-identity/logo.png',
      bucket: 'brand-assets',
      size: body.length,
      contentType: 'application/octet-stream',
      etag: '"abc123"',
    });
  });

  it('uses provided content type', async () => {
    const result = await uploadAsset(mockClient, bucket, clientId, folder, filename, body, {
      contentType: 'image/png',
    });

    expect(result.contentType).toBe('image/png');
  });

  it('passes metadata and cache control to PutObjectCommand', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PutObjectCommand } = require('@aws-sdk/client-s3');

    await uploadAsset(mockClient, bucket, clientId, folder, filename, body, {
      contentType: 'image/png',
      metadata: { source: 'upload-api' },
      cacheControl: 'max-age=31536000',
    });

    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Metadata: { source: 'upload-api' },
        CacheControl: 'max-age=31536000',
        ContentType: 'image/png',
      }),
    );
  });

  it('throws when path validation fails', async () => {
    (validatePath as jest.Mock).mockReturnValue({ valid: false, error: 'bad path' });

    await expect(uploadAsset(mockClient, bucket, clientId, folder, filename, body)).rejects.toThrow(
      'Path validation failed: bad path',
    );
  });

  it('throws when file validation fails', async () => {
    (validateFile as jest.Mock).mockReturnValue({ valid: false, error: 'extension not allowed' });

    await expect(uploadAsset(mockClient, bucket, clientId, folder, filename, body)).rejects.toThrow(
      'File validation failed: extension not allowed',
    );
  });
});

describe('uploadAssetWithPreview', () => {
  const mockClient = { send: mockSend } as unknown as import('@aws-sdk/client-s3').S3Client;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockResolvedValue({ ETag: '"abc123"' });
    (validatePath as jest.Mock).mockReturnValue({ valid: true });
    (validateFile as jest.Mock).mockReturnValue({ valid: true });
  });

  it('returns upload result with preview URL', async () => {
    const result = await uploadAssetWithPreview(
      mockClient,
      'brand-assets',
      'acme',
      '01-brand-identity',
      'logo.png',
      Buffer.from('image-data'),
    );

    expect(result.key).toBe('acme/01-brand-identity/logo.png');
    expect(result.previewUrl).toBe('https://r2.example.com/preview-url');
  });
});

describe('downloadAsset', () => {
  const mockClient = { send: mockSend } as unknown as import('@aws-sdk/client-s3').S3Client;
  const bucket = 'brand-assets';
  const clientId = 'acme';
  const r2Key = 'acme/01-brand-identity/logo.png';

  beforeEach(() => {
    jest.clearAllMocks();
    (validatePath as jest.Mock).mockReturnValue({ valid: true });
  });

  it('downloads an asset and returns Buffer with metadata', async () => {
    const content = Buffer.from('image-binary-data');

    // Mock an async iterable body (like an S3 stream)
    const asyncBody = {
      async *[Symbol.asyncIterator]() {
        yield content;
      },
    };

    mockSend.mockResolvedValue({
      Body: asyncBody,
      ContentType: 'image/png',
    });

    const result = await downloadAsset(mockClient, bucket, clientId, r2Key);

    expect(result.body).toEqual(content);
    expect(result.contentType).toBe('image/png');
    expect(result.size).toBe(content.length);
  });

  it('defaults content type to application/octet-stream', async () => {
    const asyncBody = {
      async *[Symbol.asyncIterator]() {
        yield Buffer.from('data');
      },
    };

    mockSend.mockResolvedValue({
      Body: asyncBody,
      ContentType: undefined,
    });

    const result = await downloadAsset(mockClient, bucket, clientId, r2Key);
    expect(result.contentType).toBe('application/octet-stream');
  });

  it('throws when response body is empty', async () => {
    mockSend.mockResolvedValue({ Body: null });

    await expect(downloadAsset(mockClient, bucket, clientId, r2Key)).rejects.toThrow(
      'Empty response body',
    );
  });

  it('throws when path validation fails', async () => {
    (validatePath as jest.Mock).mockReturnValue({ valid: false, error: 'cross-client access' });

    await expect(downloadAsset(mockClient, bucket, clientId, r2Key)).rejects.toThrow(
      'Path validation failed: cross-client access',
    );
  });
});

describe('getDownloadUrl', () => {
  const mockClient = { send: mockSend } as unknown as import('@aws-sdk/client-s3').S3Client;
  const bucket = 'brand-assets';
  const clientId = 'acme';
  const r2Key = 'acme/01-brand-identity/logo.png';

  beforeEach(() => {
    jest.clearAllMocks();
    (validatePath as jest.Mock).mockReturnValue({ valid: true });
    // HeadObject succeeds (object exists)
    mockSend.mockResolvedValue({});
  });

  it('returns a signed URL after verifying object exists', async () => {
    const url = await getDownloadUrl(mockClient, bucket, clientId, r2Key);
    expect(url).toBe('https://r2.example.com/preview-url');
  });

  it('throws 404-like error when object does not exist', async () => {
    const notFoundError = Object.assign(new Error('not found'), {
      $metadata: { httpStatusCode: 404 },
    });
    mockSend.mockRejectedValueOnce(notFoundError);

    await expect(getDownloadUrl(mockClient, bucket, clientId, r2Key)).rejects.toThrow(
      'Object not found',
    );
  });

  it('re-throws non-404 errors from HeadObject', async () => {
    const serverError = Object.assign(new Error('internal'), {
      $metadata: { httpStatusCode: 500 },
    });
    mockSend.mockRejectedValueOnce(serverError);

    await expect(getDownloadUrl(mockClient, bucket, clientId, r2Key)).rejects.toThrow('internal');
  });
});

describe('upload + download round-trip', () => {
  const mockClient = { send: mockSend } as unknown as import('@aws-sdk/client-s3').S3Client;
  const bucket = 'brand-assets';
  const clientId = 'acme';
  const folder = '01-brand-identity';
  const filename = 'logo.png';
  const originalData = Buffer.from('PNG-image-data-here');

  beforeEach(() => {
    jest.clearAllMocks();
    (validatePath as jest.Mock).mockReturnValue({ valid: true });
    (validateFile as jest.Mock).mockReturnValue({ valid: true });
  });

  it('data uploaded can be downloaded with same content', async () => {
    // Upload
    mockSend.mockResolvedValueOnce({ ETag: '"etag-1"' });
    const uploadResult = await uploadAsset(
      mockClient,
      bucket,
      clientId,
      folder,
      filename,
      originalData,
      {
        contentType: 'image/png',
      },
    );

    expect(uploadResult.key).toBe('acme/01-brand-identity/logo.png');
    expect(uploadResult.size).toBe(originalData.length);

    // Download - mock returns the same data
    const asyncBody = {
      async *[Symbol.asyncIterator]() {
        yield originalData;
      },
    };
    mockSend.mockResolvedValueOnce({
      Body: asyncBody,
      ContentType: 'image/png',
    });

    const downloadResult = await downloadAsset(mockClient, bucket, clientId, uploadResult.key);

    expect(downloadResult.body).toEqual(originalData);
    expect(downloadResult.contentType).toBe('image/png');
    expect(downloadResult.size).toBe(originalData.length);
  });
});
