import * as fs from 'fs';
import * as path from 'path';
import type { DimensionResult, SupportedImageFormat } from './types';

/**
 * Supported image format magic bytes for header-based dimension reading.
 */
const IMAGE_SIGNATURES: Record<string, SupportedImageFormat> = {
  '89504e47': 'png',
  'ffd8ff': 'jpeg',
  '47494638': 'gif',
  '424d': 'bmp',
  '52494646': 'webp',
};

/**
 * Parses a dimension string like '1080x1920' into width and height.
 *
 * @throws Error if the format is invalid
 */
export function parseDimensions(dimensions: string): { width: number; height: number } {
  const match = dimensions.match(/^(\d+)\s*[xX×]\s*(\d+)$/);
  if (!match) {
    throw new Error(
      `Invalid dimension format: "${dimensions}". Expected format: WIDTHxHEIGHT (e.g., 1080x1920)`
    );
  }
  return {
    width: parseInt(match[1], 10),
    height: parseInt(match[2], 10),
  };
}

/**
 * Reads PNG dimensions from the IHDR chunk (bytes 16-23).
 */
function readPNGDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 24) {
    return null;
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

/**
 * Reads JPEG dimensions by scanning for SOF markers.
 */
function readJPEGDimensions(buffer: Buffer): { width: number; height: number } | null {
  let offset = 2;
  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xff) {
      return null;
    }
    const marker = buffer[offset + 1];

    // SOF0-SOF3 markers contain image dimensions
    if (marker >= 0xc0 && marker <= 0xc3) {
      if (offset + 9 > buffer.length) {
        return null;
      }
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }

    // Skip non-SOF markers
    if (offset + 3 >= buffer.length) {
      return null;
    }
    const segmentLength = buffer.readUInt16BE(offset + 2);
    offset += 2 + segmentLength;
  }
  return null;
}

/**
 * Reads GIF dimensions from the header (bytes 6-9).
 */
function readGIFDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 10) {
    return null;
  }
  const width = buffer.readUInt16LE(6);
  const height = buffer.readUInt16LE(8);
  return { width, height };
}

/**
 * Reads BMP dimensions from the DIB header (bytes 18-25).
 */
function readBMPDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 26) {
    return null;
  }
  const width = buffer.readInt32LE(18);
  const height = Math.abs(buffer.readInt32LE(22));
  return { width, height };
}

/**
 * Reads WebP dimensions from the VP8 bitstream or VP8L header.
 */
function readWebPDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 30) {
    return null;
  }

  const fourcc = buffer.toString('ascii', 12, 16);

  if (fourcc === 'VP8 ') {
    // Lossy VP8: dimensions at bytes 26-29
    if (buffer.length < 30) {
      return null;
    }
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { width, height };
  }

  if (fourcc === 'VP8L') {
    // Lossless VP8L: bits packed at byte 21
    if (buffer.length < 25) {
      return null;
    }
    const bits = buffer.readUInt32LE(21);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return { width, height };
  }

  return null;
}

/**
 * Detects the image format from the file's magic bytes.
 */
function detectFormat(buffer: Buffer): SupportedImageFormat | null {
  const hex = buffer.subarray(0, 4).toString('hex');

  for (const [signature, format] of Object.entries(IMAGE_SIGNATURES)) {
    if (hex.startsWith(signature)) {
      return format;
    }
  }
  return null;
}

/**
 * Reads image dimensions from a file by parsing the image header.
 * Does NOT load the full image into memory — only reads the header bytes.
 *
 * @param filePath - Path to the image file
 * @returns Width and height, or null if the format is unsupported or the file is unreadable
 */
export function readImageDimensions(
  filePath: string
): { width: number; height: number } | null {
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    return null;
  }

  const buffer = fs.readFileSync(resolvedPath);
  const format = detectFormat(buffer);

  if (!format) {
    return null;
  }

  switch (format) {
    case 'png':
      return readPNGDimensions(buffer);
    case 'jpeg':
    case 'jpg':
      return readJPEGDimensions(buffer);
    case 'gif':
      return readGIFDimensions(buffer);
    case 'bmp':
      return readBMPDimensions(buffer);
    case 'webp':
      return readWebPDimensions(buffer);
    default:
      return null;
  }
}

/**
 * Checks if an image file matches the expected dimensions.
 *
 * @param filePath - Path to the image file
 * @param expectedDimensions - Expected dimensions as 'WIDTHxHEIGHT' (e.g., '1080x1920')
 * @returns DimensionResult with pass/fail status and details
 *
 * @example
 * ```ts
 * const result = checkDimensions('./banner.png', '1080x1920');
 * // result.pass === true if banner.png is 1080x1920
 * ```
 */
export function checkDimensions(filePath: string, expectedDimensions: string): DimensionResult {
  const { width: expectedWidth, height: expectedHeight } = parseDimensions(expectedDimensions);
  const actualDims = readImageDimensions(filePath);

  if (!actualDims) {
    return {
      filePath,
      expected: expectedDimensions,
      actual: null,
      expectedWidth,
      expectedHeight,
      actualWidth: null,
      actualHeight: null,
      pass: false,
      message: `Could not read dimensions from "${filePath}". File may not exist or format is unsupported.`,
    };
  }

  const pass = actualDims.width === expectedWidth && actualDims.height === expectedHeight;
  const actual = `${actualDims.width}x${actualDims.height}`;

  return {
    filePath,
    expected: expectedDimensions,
    actual,
    expectedWidth,
    expectedHeight,
    actualWidth: actualDims.width,
    actualHeight: actualDims.height,
    pass,
    message: pass
      ? `PASS: "${filePath}" is ${actual} (expected ${expectedDimensions})`
      : `FAIL: "${filePath}" is ${actual} but expected ${expectedDimensions}`,
  };
}
