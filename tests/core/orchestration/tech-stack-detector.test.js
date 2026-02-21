/**
 * Unit tests for tech-stack-detector module
 *
 * Tests the TechStackDetector class that detects project technology
 * stack before workflow execution using filesystem checks.
 */

jest.mock('fs-extra');

const fs = require('fs-extra');

const TechStackDetector = require('../../../.aios-core/core/orchestration/tech-stack-detector');

describe('TechStackDetector', () => {
  let detector;

  beforeEach(() => {
    jest.resetAllMocks();
    fs.pathExists.mockResolvedValue(false);
    fs.readJson.mockResolvedValue(null);
    fs.readdir.mockResolvedValue([]);
    fs.readFile.mockResolvedValue('');
    detector = new TechStackDetector('/project');
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('sets project root and empty cache', () => {
      expect(detector.projectRoot).toBe('/project');
      expect(detector._packageJsonCache).toBeNull();
    });
  });

  // ============================================================
  // detect (integration)
  // ============================================================
  describe('detect', () => {
    test('returns empty profile for bare project', async () => {
      const profile = await detector.detect();

      expect(profile.hasDatabase).toBe(false);
      expect(profile.hasFrontend).toBe(false);
      expect(profile.hasBackend).toBe(false);
      expect(profile.hasTypeScript).toBe(false);
      expect(profile.hasTests).toBe(false);
      expect(profile.confidence).toBe(50);
      expect(profile.detectedAt).toBeDefined();
      expect(profile.applicablePhases).toContain(1);
      expect(profile.applicablePhases).not.toContain(2);
      expect(profile.applicablePhases).not.toContain(3);
    });

    test('detects full stack project', async () => {
      fs.pathExists.mockImplementation((p) => {
        if (p.endsWith('package.json')) return true;
        if (p.endsWith('tsconfig.json')) return true;
        if (p.endsWith('tests')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0',
          express: '^4.0.0',
          pg: '^8.0.0',
          tailwindcss: '^3.0.0',
          vite: '^5.0.0',
        },
        devDependencies: {
          typescript: '^5.0.0',
          jest: '^30.0.0',
        },
      });

      const profile = await detector.detect();

      expect(profile.hasDatabase).toBe(true);
      expect(profile.database.type).toBe('postgresql');
      expect(profile.hasFrontend).toBe(true);
      expect(profile.frontend.framework).toBe('react');
      expect(profile.frontend.buildTool).toBe('vite');
      expect(profile.frontend.styling).toBe('tailwind');
      expect(profile.hasBackend).toBe(true);
      expect(profile.backend.type).toBe('express');
      expect(profile.hasTypeScript).toBe(true);
      expect(profile.hasTests).toBe(true);
      expect(profile.confidence).toBeGreaterThan(80);
      expect(profile.applicablePhases).toContain(2);
      expect(profile.applicablePhases).toContain(3);
    });
  });

  // ============================================================
  // _detectDatabase
  // ============================================================
  describe('database detection', () => {
    test('detects Supabase from directory', async () => {
      fs.pathExists.mockImplementation((p) => {
        if (p.endsWith('supabase')) return true;
        if (p.includes('migrations')) return true;
        return false;
      });
      fs.readdir.mockResolvedValue(['001_init.sql']);
      fs.readFile.mockResolvedValue('CREATE TABLE users; ENABLE ROW LEVEL SECURITY;');

      const profile = await detector.detect();

      expect(profile.hasDatabase).toBe(true);
      expect(profile.database.type).toBe('supabase');
      expect(profile.database.hasMigrations).toBe(true);
      expect(profile.database.hasRLS).toBe(true);
    });

    test('detects Prisma from directory', async () => {
      fs.pathExists.mockImplementation((p) => {
        if (p.endsWith('prisma')) return true;
        if (p.endsWith('schema.prisma')) return true;
        return false;
      });

      const profile = await detector.detect();

      expect(profile.hasDatabase).toBe(true);
      expect(profile.database.type).toBe('postgresql');
      expect(profile.database.hasSchema).toBe(true);
    });

    test('detects MongoDB from deps', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { mongoose: '^7.0.0' },
      });

      const profile = await detector.detect();

      expect(profile.hasDatabase).toBe(true);
      expect(profile.database.type).toBe('mongodb');
    });

    test('detects MySQL from deps', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { mysql2: '^3.0.0' },
      });

      const profile = await detector.detect();

      expect(profile.hasDatabase).toBe(true);
      expect(profile.database.type).toBe('mysql');
    });

    test('detects SQLite from deps', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { 'better-sqlite3': '^9.0.0' },
      });

      const profile = await detector.detect();

      expect(profile.hasDatabase).toBe(true);
      expect(profile.database.type).toBe('sqlite');
    });

    test('detects Supabase from deps', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { '@supabase/supabase-js': '^2.0.0' },
      });

      const profile = await detector.detect();

      expect(profile.database.type).toBe('supabase');
    });

    test('detects env vars from .env file', async () => {
      fs.pathExists.mockImplementation((p) => {
        if (p.endsWith('package.json')) return true;
        if (p.endsWith('.env')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({
        dependencies: { pg: '^8.0.0' },
      });
      fs.readFile.mockResolvedValue('DATABASE_URL=postgres://...');

      const profile = await detector.detect();

      expect(profile.database.envVarsConfigured).toBe(true);
    });
  });

  // ============================================================
  // _detectFrontend
  // ============================================================
  describe('frontend detection', () => {
    test('detects React', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { react: '^18.0.0' },
      });

      const profile = await detector.detect();

      expect(profile.hasFrontend).toBe(true);
      expect(profile.frontend.framework).toBe('react');
    });

    test('detects Vue', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { vue: '^3.0.0' },
      });

      const profile = await detector.detect();

      expect(profile.frontend.framework).toBe('vue');
    });

    test('detects Angular', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { '@angular/core': '^17.0.0' },
      });

      const profile = await detector.detect();

      expect(profile.frontend.framework).toBe('angular');
    });

    test('detects Svelte', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { svelte: '^4.0.0' },
      });

      const profile = await detector.detect();

      expect(profile.frontend.framework).toBe('svelte');
    });

    test('detects Next.js as React', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { next: '^14.0.0' },
      });

      const profile = await detector.detect();

      expect(profile.frontend.framework).toBe('react');
    });

    test('detects Nuxt as Vue', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { nuxt: '^3.0.0' },
      });

      const profile = await detector.detect();

      expect(profile.frontend.framework).toBe('vue');
    });

    test('detects build tools', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { react: '^18', webpack: '^5' },
      });

      const profile = await detector.detect();
      expect(profile.frontend.buildTool).toBe('webpack');
    });

    test('detects styled-components', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { react: '^18', 'styled-components': '^6' },
      });

      const profile = await detector.detect();
      expect(profile.frontend.styling).toBe('styled-components');
    });

    test('detects emotion styling', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { react: '^18', '@emotion/react': '^11' },
      });

      const profile = await detector.detect();
      expect(profile.frontend.styling).toBe('emotion');
    });

    test('detects scss styling', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { react: '^18' },
        devDependencies: { sass: '^1.0' },
      });

      const profile = await detector.detect();
      expect(profile.frontend.styling).toBe('scss');
    });

    test('detects shadcn from ui directory', async () => {
      fs.pathExists.mockImplementation((p) => {
        if (p.endsWith('package.json')) return true;
        if (p.includes('src/components/ui')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({
        dependencies: { react: '^18' },
      });

      const profile = await detector.detect();
      expect(profile.frontend.componentLibrary).toBe('shadcn');
    });

    test('detects MUI component library', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { react: '^18', '@mui/material': '^5' },
      });

      const profile = await detector.detect();
      expect(profile.frontend.componentLibrary).toBe('mui');
    });

    test('detects frontend from .jsx files in src', async () => {
      fs.pathExists.mockImplementation((p) => {
        if (p.endsWith('src')) return true;
        return false;
      });
      fs.readdir.mockResolvedValue(['App.jsx', 'index.js']);

      const profile = await detector.detect();
      expect(profile.hasFrontend).toBe(true);
    });
  });

  // ============================================================
  // _detectBackend
  // ============================================================
  describe('backend detection', () => {
    test('detects Express', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { express: '^4.0.0' },
      });

      const profile = await detector.detect();

      expect(profile.hasBackend).toBe(true);
      expect(profile.backend.type).toBe('express');
    });

    test('detects Fastify', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { fastify: '^4.0.0' },
      });

      const profile = await detector.detect();
      expect(profile.backend.type).toBe('fastify');
    });

    test('detects NestJS', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { '@nestjs/core': '^10.0.0' },
      });

      const profile = await detector.detect();
      expect(profile.backend.type).toBe('nest');
    });

    test('detects Hono', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { hono: '^4.0.0' },
      });

      const profile = await detector.detect();
      expect(profile.backend.type).toBe('hono');
    });

    test('detects edge functions', async () => {
      fs.pathExists.mockImplementation((p) => {
        if (p.includes('supabase/functions')) return true;
        return false;
      });

      const profile = await detector.detect();
      expect(profile.hasBackend).toBe(true);
      expect(profile.backend.type).toBe('edge-functions');
    });

    test('detects API routes', async () => {
      fs.pathExists.mockImplementation((p) => {
        if (p.endsWith('package.json')) return true;
        if (p.endsWith('src/api')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({
        dependencies: { express: '^4' },
      });

      const profile = await detector.detect();
      expect(profile.backend.hasAPI).toBe(true);
    });
  });

  // ============================================================
  // _detectTypeScript
  // ============================================================
  describe('typescript detection', () => {
    test('detects from dependency', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        devDependencies: { typescript: '^5.0.0' },
      });

      const profile = await detector.detect();
      expect(profile.hasTypeScript).toBe(true);
    });

    test('detects from tsconfig.json', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('tsconfig.json'));

      const profile = await detector.detect();
      expect(profile.hasTypeScript).toBe(true);
    });
  });

  // ============================================================
  // _detectTests
  // ============================================================
  describe('test detection', () => {
    test('detects from test framework dep', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        devDependencies: { vitest: '^1.0.0' },
      });

      const profile = await detector.detect();
      expect(profile.hasTests).toBe(true);
    });

    test('detects from test directory', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('tests'));

      const profile = await detector.detect();
      expect(profile.hasTests).toBe(true);
    });
  });

  // ============================================================
  // _computeApplicablePhases
  // ============================================================
  describe('applicable phases', () => {
    test('phase 1 always applicable', async () => {
      const profile = await detector.detect();
      expect(profile.applicablePhases).toContain(1);
    });

    test('phase 2 only with database', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { pg: '^8' },
      });

      const profile = await detector.detect();
      expect(profile.applicablePhases).toContain(2);
    });

    test('phase 3 only with frontend', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { react: '^18' },
      });

      const profile = await detector.detect();
      expect(profile.applicablePhases).toContain(3);
    });

    test('phases 4-10 always included', async () => {
      const profile = await detector.detect();
      for (const p of [4, 5, 6, 7, 8, 9, 10]) {
        expect(profile.applicablePhases).toContain(p);
      }
    });
  });

  // ============================================================
  // _calculateConfidence
  // ============================================================
  describe('confidence calculation', () => {
    test('base confidence is 50', async () => {
      const profile = await detector.detect();
      expect(profile.confidence).toBe(50);
    });

    test('confidence caps at 100', async () => {
      fs.pathExists.mockImplementation((p) => {
        if (p.endsWith('package.json')) return true;
        if (p.endsWith('tsconfig.json')) return true;
        if (p.endsWith('tests')) return true;
        if (p.includes('src/components/ui')) return true;
        if (p.endsWith('.env')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({
        dependencies: {
          react: '^18', vite: '^5', tailwindcss: '^3',
          express: '^4', pg: '^8',
        },
        devDependencies: { typescript: '^5', jest: '^30' },
      });
      fs.readFile.mockResolvedValue('DATABASE_URL=postgres://...');

      const profile = await detector.detect();
      expect(profile.confidence).toBeLessThanOrEqual(100);
    });
  });

  // ============================================================
  // getSummary (static)
  // ============================================================
  describe('getSummary', () => {
    test('returns summary for full stack', () => {
      const profile = {
        hasFrontend: true,
        frontend: { framework: 'react', styling: 'tailwind' },
        hasDatabase: true,
        database: { type: 'supabase', hasRLS: true },
        hasBackend: true,
        backend: { type: 'express' },
        hasTypeScript: true,
      };

      const summary = TechStackDetector.getSummary(profile);
      expect(summary).toContain('react');
      expect(summary).toContain('tailwind');
      expect(summary).toContain('supabase');
      expect(summary).toContain('RLS');
      expect(summary).toContain('express');
      expect(summary).toContain('TypeScript');
    });

    test('returns no stack detected for empty profile', () => {
      const profile = {
        hasFrontend: false,
        frontend: {},
        hasDatabase: false,
        database: {},
        hasBackend: false,
        backend: {},
        hasTypeScript: false,
      };

      expect(TechStackDetector.getSummary(profile)).toBe('No stack detected');
    });

    test('handles unknown framework/type', () => {
      const profile = {
        hasFrontend: true,
        frontend: { framework: null, styling: null },
        hasDatabase: true,
        database: { type: null, hasRLS: false },
        hasBackend: false,
        backend: {},
        hasTypeScript: false,
      };

      const summary = TechStackDetector.getSummary(profile);
      expect(summary).toContain('unknown');
    });
  });

  // ============================================================
  // _loadPackageJson caching
  // ============================================================
  describe('package.json caching', () => {
    test('caches package.json across detectors', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockResolvedValue({
        dependencies: { react: '^18', express: '^4' },
      });

      await detector.detect();
      // readJson called only once despite multiple _getAllDependencies calls
      expect(fs.readJson).toHaveBeenCalledTimes(1);
    });

    test('handles corrupt package.json', async () => {
      fs.pathExists.mockImplementation((p) => p.endsWith('package.json'));
      fs.readJson.mockRejectedValue(new Error('parse error'));

      const profile = await detector.detect();
      expect(profile.hasDatabase).toBe(false);
    });
  });
});
