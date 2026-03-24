/**
 * Unit tests for TemplateEngine (Satori + Sharp rendering pipeline).
 *
 * Strategy: Mock Satori and Sharp to avoid native dependencies in CI.
 * Tests cover: PNG render, JPG render, font loading, token injection,
 * size limit enforcement, and Instagram platform spec.
 */

import React from 'react';
import type { RenderOptions, PlatformSpec, TokenSet, FontConfig } from '../types';
import { TemplateSizeError } from '../types';

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing TemplateEngine
// ---------------------------------------------------------------------------

const mockSatori = jest.fn<Promise<string>, [unknown, unknown]>();
jest.mock('satori', () => ({
  __esModule: true,
  default: (...args: [unknown, unknown]) => mockSatori(...args),
}));

const mockToBuffer = jest.fn<Promise<Buffer>, []>();
const mockJpeg = jest.fn().mockReturnValue({ toBuffer: mockToBuffer });
const mockPng = jest.fn().mockReturnValue({ toBuffer: mockToBuffer });
const mockResize = jest.fn().mockReturnValue({ jpeg: mockJpeg, png: mockPng });
const mockSharp = jest.fn().mockReturnValue({ resize: mockResize });
jest.mock('sharp', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockSharp(...args),
}));

jest.mock('@bss/core', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

// Import after mocks
import { TemplateEngine } from '../template-engine';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createTestFont(): FontConfig {
  return {
    name: 'TestFont',
    data: new ArrayBuffer(100),
    weight: 400,
    style: 'normal',
  };
}

function createTestTokens(): TokenSet {
  return {
    color: {
      primary: { $value: '#FF5733', $type: 'color' },
      secondary: { $value: '#33FF57', $type: 'color' },
    },
    typography: {
      heading: {
        fontFamily: { $value: 'TestFont', $type: 'fontFamily' },
        fontSize: { $value: 32, $type: 'dimension' },
      },
    },
    spacing: {
      sm: { $value: 8, $type: 'dimension' },
      md: { $value: 16, $type: 'dimension' },
    },
  };
}

const INSTAGRAM_SPEC: PlatformSpec = {
  platform: 'instagram',
  width: 1080,
  height: 1080,
  format: 'png',
};

const YOUTUBE_SPEC: PlatformSpec = {
  platform: 'youtube',
  width: 1280,
  height: 720,
  format: 'jpg',
  maxFileSizeMB: 2,
};

/** Simple test component that consumes tokens */
function TestTemplate(props: { tokens: TokenSet }): React.ReactElement {
  const primaryColor =
    props.tokens.color?.primary &&
    '$value' in props.tokens.color.primary
      ? String(props.tokens.color.primary.$value)
      : '#000000';

  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        backgroundColor: primaryColor,
        width: '100%',
        height: '100%',
      },
    },
    React.createElement('span', null, 'Hello Brand')
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TemplateEngine', () => {
  let engine: TemplateEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new TemplateEngine();

    // Default: Satori returns valid SVG string
    mockSatori.mockResolvedValue(
      '<svg width="1080" height="1080"><rect fill="#FF5733"/></svg>'
    );

    // Default: Sharp returns a small buffer (100 bytes)
    mockToBuffer.mockResolvedValue(Buffer.alloc(100, 0));
  });

  // -------------------------------------------------------------------------
  // AC 9: Successful PNG render with Instagram 1080x1080
  // -------------------------------------------------------------------------

  describe('PNG render (Instagram 1080x1080)', () => {
    it('renders a JSX element to a PNG buffer', async () => {
      const tokens = createTestTokens();
      const options: RenderOptions = {
        element: React.createElement(TestTemplate, { tokens }),
        tokens,
        spec: INSTAGRAM_SPEC,
        fonts: [createTestFont()],
        clientId: 'client-001',
      };

      const result = await engine.render(options);

      // Verify Satori was called with correct dimensions
      expect(mockSatori).toHaveBeenCalledTimes(1);
      const satoriArgs = mockSatori.mock.calls[0][1] as Record<string, unknown>;
      expect(satoriArgs).toMatchObject({
        width: 1080,
        height: 1080,
      });

      // Verify Sharp was called with SVG buffer
      expect(mockSharp).toHaveBeenCalledTimes(1);
      expect(mockResize).toHaveBeenCalledWith(1080, 1080);
      expect(mockPng).toHaveBeenCalledTimes(1);
      expect(mockJpeg).not.toHaveBeenCalled();

      // Result is a Buffer
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBe(100);
    });
  });

  // -------------------------------------------------------------------------
  // AC 9: Successful JPG render with YouTube 1280x720
  // -------------------------------------------------------------------------

  describe('JPG render (YouTube 1280x720)', () => {
    it('renders a JSX element to a JPG buffer', async () => {
      mockToBuffer.mockResolvedValue(Buffer.alloc(200, 0));
      const tokens = createTestTokens();
      const options: RenderOptions = {
        element: React.createElement(TestTemplate, { tokens }),
        tokens,
        spec: { ...YOUTUBE_SPEC, maxFileSizeMB: undefined },
        fonts: [createTestFont()],
        clientId: 'client-002',
      };

      const result = await engine.render(options);

      expect(mockResize).toHaveBeenCalledWith(1280, 720);
      expect(mockJpeg).toHaveBeenCalledWith({ quality: 90 });
      expect(mockPng).not.toHaveBeenCalled();
      expect(result.length).toBe(200);
    });
  });

  // -------------------------------------------------------------------------
  // AC 9: Font loading passed to Satori correctly
  // -------------------------------------------------------------------------

  describe('Font loading', () => {
    it('passes font configurations to Satori', async () => {
      const font1 = createTestFont();
      const font2: FontConfig = {
        name: 'BoldFont',
        data: new ArrayBuffer(200),
        weight: 700,
        style: 'italic',
      };

      const tokens = createTestTokens();
      const options: RenderOptions = {
        element: React.createElement(TestTemplate, { tokens }),
        tokens,
        spec: INSTAGRAM_SPEC,
        fonts: [font1, font2],
      };

      await engine.render(options);

      const satoriArgs = mockSatori.mock.calls[0][1] as {
        fonts: Array<{ name: string; weight: number; style: string }>;
      };
      expect(satoriArgs.fonts).toHaveLength(2);
      expect(satoriArgs.fonts[0]).toMatchObject({
        name: 'TestFont',
        weight: 400,
        style: 'normal',
      });
      expect(satoriArgs.fonts[1]).toMatchObject({
        name: 'BoldFont',
        weight: 700,
        style: 'italic',
      });
    });

    it('applies default weight and style when not provided', async () => {
      const font: FontConfig = {
        name: 'MinimalFont',
        data: new ArrayBuffer(50),
      };
      const tokens = createTestTokens();

      await engine.render({
        element: React.createElement(TestTemplate, { tokens }),
        tokens,
        spec: INSTAGRAM_SPEC,
        fonts: [font],
      });

      const satoriArgs = mockSatori.mock.calls[0][1] as {
        fonts: Array<{ weight: number; style: string }>;
      };
      expect(satoriArgs.fonts[0].weight).toBe(400);
      expect(satoriArgs.fonts[0].style).toBe('normal');
    });
  });

  // -------------------------------------------------------------------------
  // AC 9: Token injection into template
  // -------------------------------------------------------------------------

  describe('Token injection', () => {
    it('passes token values to the JSX element via props', async () => {
      const tokens = createTestTokens();
      const element = React.createElement(TestTemplate, { tokens });

      // Verify the element was created with tokens
      expect(element.props.tokens).toBe(tokens);
      expect(element.props.tokens.color?.primary).toEqual({
        $value: '#FF5733',
        $type: 'color',
      });

      const options: RenderOptions = {
        element,
        tokens,
        spec: INSTAGRAM_SPEC,
        fonts: [createTestFont()],
      };

      // Satori receives the element with tokens already bound
      await engine.render(options);
      expect(mockSatori).toHaveBeenCalledTimes(1);

      // The first argument to Satori is the React element
      const satoriElement = mockSatori.mock.calls[0][0];
      expect(satoriElement).toBe(element);
    });
  });

  // -------------------------------------------------------------------------
  // AC 9: TemplateSizeError thrown when output exceeds maxFileSizeMB
  // -------------------------------------------------------------------------

  describe('Size limit enforcement', () => {
    it('throws TemplateSizeError when output exceeds maxFileSizeMB', async () => {
      // Return a 3MB buffer
      const largeBuf = Buffer.alloc(3 * 1024 * 1024, 0);
      mockToBuffer.mockResolvedValue(largeBuf);

      const tokens = createTestTokens();
      const options: RenderOptions = {
        element: React.createElement(TestTemplate, { tokens }),
        tokens,
        spec: YOUTUBE_SPEC, // maxFileSizeMB: 2
        fonts: [createTestFont()],
        clientId: 'client-over-limit',
      };

      await expect(engine.render(options)).rejects.toThrow(TemplateSizeError);
      await expect(engine.render(options)).rejects.toThrow(/exceeds size limit/);
    });

    it('does not throw when output is within maxFileSizeMB', async () => {
      // Return a 1MB buffer (under 2MB limit)
      const smallBuf = Buffer.alloc(1 * 1024 * 1024, 0);
      mockToBuffer.mockResolvedValue(smallBuf);

      const tokens = createTestTokens();
      const options: RenderOptions = {
        element: React.createElement(TestTemplate, { tokens }),
        tokens,
        spec: YOUTUBE_SPEC,
        fonts: [createTestFont()],
      };

      const result = await engine.render(options);
      expect(result.length).toBe(1 * 1024 * 1024);
    });

    it('does not enforce size limit when maxFileSizeMB is not set', async () => {
      const largeBuf = Buffer.alloc(5 * 1024 * 1024, 0);
      mockToBuffer.mockResolvedValue(largeBuf);

      const tokens = createTestTokens();
      const options: RenderOptions = {
        element: React.createElement(TestTemplate, { tokens }),
        tokens,
        spec: INSTAGRAM_SPEC, // no maxFileSizeMB
        fonts: [createTestFont()],
      };

      const result = await engine.render(options);
      expect(result.length).toBe(5 * 1024 * 1024);
    });
  });

  // -------------------------------------------------------------------------
  // TemplateSizeError structure
  // -------------------------------------------------------------------------

  describe('TemplateSizeError', () => {
    it('contains correct size information', () => {
      const error = new TemplateSizeError(3145728, 2097152, 'youtube');
      expect(error.name).toBe('TemplateSizeError');
      expect(error.code).toBe('TEMPLATE_SIZE_ERROR');
      expect(error.actualSizeBytes).toBe(3145728);
      expect(error.maxSizeBytes).toBe(2097152);
      expect(error.platform).toBe('youtube');
      expect(error.message).toContain('youtube');
      expect(error.message).toContain('exceeds size limit');
      expect(error).toBeInstanceOf(Error);
    });
  });

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  describe('Error handling', () => {
    it('wraps Satori errors with context', async () => {
      mockSatori.mockRejectedValue(new Error('Invalid JSX'));

      const tokens = createTestTokens();
      const options: RenderOptions = {
        element: React.createElement(TestTemplate, { tokens }),
        tokens,
        spec: INSTAGRAM_SPEC,
        fonts: [createTestFont()],
      };

      await expect(engine.render(options)).rejects.toThrow(
        /Failed to render template for instagram/
      );
    });

    it('wraps Sharp errors with context', async () => {
      mockToBuffer.mockRejectedValue(new Error('Sharp processing failed'));

      const tokens = createTestTokens();
      const options: RenderOptions = {
        element: React.createElement(TestTemplate, { tokens }),
        tokens,
        spec: INSTAGRAM_SPEC,
        fonts: [createTestFont()],
      };

      await expect(engine.render(options)).rejects.toThrow(
        /Failed to render template for instagram/
      );
    });
  });
});
