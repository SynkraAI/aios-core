'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FIXTURES = path.resolve(__dirname, 'fixtures');
const VALID_REGISTRY = path.join(FIXTURES, 'valid-registry.yaml');

describe('Entity Registry Schema (AC: 1, 7, 8)', () => {
  let registry;

  beforeAll(() => {
    const content = fs.readFileSync(VALID_REGISTRY, 'utf8');
    registry = yaml.load(content);
  });

  describe('metadata section', () => {
    it('has required metadata fields', () => {
      expect(registry.metadata).toBeDefined();
      expect(registry.metadata.version).toBeDefined();
      expect(registry.metadata.lastUpdated).toBeDefined();
      expect(registry.metadata.entityCount).toBeDefined();
      expect(registry.metadata.checksumAlgorithm).toBeDefined();
    });

    it('version follows semver format', () => {
      expect(registry.metadata.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('checksumAlgorithm is sha256', () => {
      expect(registry.metadata.checksumAlgorithm).toBe('sha256');
    });

    it('entityCount is a number', () => {
      expect(typeof registry.metadata.entityCount).toBe('number');
    });
  });

  describe('entity structure', () => {
    it('entities object exists with category keys', () => {
      expect(registry.entities).toBeDefined();
      expect(typeof registry.entities).toBe('object');
    });

    it('each entity has required fields', () => {
      for (const [category, entities] of Object.entries(registry.entities)) {
        for (const [id, entity] of Object.entries(entities)) {
          expect(entity.path).toBeDefined();
          expect(entity.type).toBeDefined();
          expect(entity.purpose).toBeDefined();
          expect(entity.keywords).toBeDefined();
          expect(Array.isArray(entity.keywords)).toBe(true);
          expect(entity.usedBy).toBeDefined();
          expect(Array.isArray(entity.usedBy)).toBe(true);
          expect(entity.dependencies).toBeDefined();
          expect(Array.isArray(entity.dependencies)).toBe(true);
        }
      }
    });

    it('entity type is one of the allowed values', () => {
      const allowedTypes = ['task', 'template', 'script', 'module', 'agent', 'checklist', 'data'];
      for (const [category, entities] of Object.entries(registry.entities)) {
        for (const [id, entity] of Object.entries(entities)) {
          expect(allowedTypes).toContain(entity.type);
        }
      }
    });
  });

  describe('adaptability section (AC: 7)', () => {
    it('each entity has adaptability with score', () => {
      for (const [category, entities] of Object.entries(registry.entities)) {
        for (const [id, entity] of Object.entries(entities)) {
          expect(entity.adaptability).toBeDefined();
          expect(typeof entity.adaptability.score).toBe('number');
          expect(entity.adaptability.score).toBeGreaterThanOrEqual(0);
          expect(entity.adaptability.score).toBeLessThanOrEqual(1);
        }
      }
    });

    it('adaptability has constraints and extensionPoints arrays', () => {
      for (const [category, entities] of Object.entries(registry.entities)) {
        for (const [id, entity] of Object.entries(entities)) {
          expect(Array.isArray(entity.adaptability.constraints)).toBe(true);
          expect(Array.isArray(entity.adaptability.extensionPoints)).toBe(true);
        }
      }
    });
  });

  describe('checksum field (AC: 8)', () => {
    it('each entity has a checksum field', () => {
      for (const [category, entities] of Object.entries(registry.entities)) {
        for (const [id, entity] of Object.entries(entities)) {
          expect(entity.checksum).toBeDefined();
          expect(typeof entity.checksum).toBe('string');
        }
      }
    });

    it('checksum follows sha256:hex format', () => {
      for (const [category, entities] of Object.entries(registry.entities)) {
        for (const [id, entity] of Object.entries(entities)) {
          expect(entity.checksum).toMatch(/^sha256:[a-f0-9]{64}$/);
        }
      }
    });

    it('each entity has lastVerified timestamp', () => {
      for (const [category, entities] of Object.entries(registry.entities)) {
        for (const [id, entity] of Object.entries(entities)) {
          expect(entity.lastVerified).toBeDefined();
        }
      }
    });
  });

  describe('categories section', () => {
    it('categories is an array', () => {
      expect(Array.isArray(registry.categories)).toBe(true);
      expect(registry.categories.length).toBeGreaterThan(0);
    });

    it('each category has id, description, basePath', () => {
      for (const cat of registry.categories) {
        expect(cat.id).toBeDefined();
        expect(cat.description).toBeDefined();
        expect(cat.basePath).toBeDefined();
      }
    });
  });
});
