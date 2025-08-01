const ConflictResolver = require('../../../aios-core/utils/conflict-resolver');
const GitWrapper = require('../../../aios-core/utils/git-wrapper');
const fs = require('fs').promises;
const path = require('path');
const inquirer = require('inquirer');

// Mock dependencies
jest.mock('../../../aios-core/utils/git-wrapper');
jest.mock('fs').promises;
jest.mock('inquirer');
jest.mock('chalk', () => ({
  red: jest.fn(text => text),
  yellow: jest.fn(text => text),
  blue: jest.fn(text => text),
  green: jest.fn(text => text),
  gray: jest.fn(text => text)
}));

describe('ConflictResolver', () => {
  let conflictResolver;
  let mockGit;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGit = {
      getConflicts: jest.fn(),
      execGit: jest.fn(),
      getDiff: jest.fn()
    };
    
    GitWrapper.mockImplementation(() => mockGit);
    
    conflictResolver = new ConflictResolver({ rootPath: '/test/project' });
  });

  describe('detectConflicts', () => {
    test('should detect no conflicts when repository is clean', async () => {
      mockGit.getConflicts.mockResolvedValue([]);

      const result = await conflictResolver.detectConflicts();

      expect(result.hasConflicts).toBe(false);
      expect(result.files).toEqual([]);
    });

    test('should detect and parse conflicts correctly', async () => {
      mockGit.getConflicts.mockResolvedValue(['file1.js', 'file2.js']);
      
      const conflictContent = `normal line
<<<<<<< HEAD
our change
=======
their change
>>>>>>> feature-branch
another normal line`;

      fs.readFile
        .mockResolvedValueOnce(conflictContent)
        .mockResolvedValueOnce(conflictContent);

      const result = await conflictResolver.detectConflicts();

      expect(result.hasConflicts).toBe(true);
      expect(result.files).toHaveLength(2);
      expect(result.files[0].file).toBe('file1.js');
      expect(result.files[0].conflictCount).toBe(1);
      expect(result.totalConflicts).toBe(2);
    });

    test('should detect conflict types correctly', async () => {
      mockGit.getConflicts.mockResolvedValue(['imports.js', 'version.json']);
      
      const importConflict = `<<<<<<< HEAD
import { ComponentA } from './a';
=======
import { ComponentB } from './b';
>>>>>>> feature-branch`;

      const versionConflict = `<<<<<<< HEAD
  "version": "1.2.3",
=======
  "version": "1.3.0",
>>>>>>> feature-branch`;

      fs.readFile
        .mockResolvedValueOnce(importConflict)
        .mockResolvedValueOnce(versionConflict);

      const result = await conflictResolver.detectConflicts();

      expect(result.files[0].type).toBe('imports');
      expect(result.files[1].type).toBe('version');
    });
  });

  describe('parseConflictMarkers', () => {
    test('should parse single conflict correctly', () => {
      const content = `line 1
<<<<<<< HEAD
our version
=======
their version
>>>>>>> branch
line 6`;

      const result = conflictResolver.parseConflictMarkers(content);

      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].ours).toEqual(['our version']);
      expect(result.conflicts[0].theirs).toEqual(['their version']);
      expect(result.conflicts[0].startLine).toBe(2);
      expect(result.conflicts[0].endLine).toBe(5);
    });

    test('should parse multiple conflicts', () => {
      const content = `start
<<<<<<< HEAD
first ours
=======
first theirs
>>>>>>> branch
middle
<<<<<<< HEAD
second ours
=======
second theirs
>>>>>>> branch
end`;

      const result = conflictResolver.parseConflictMarkers(content);

      expect(result.conflicts).toHaveLength(2);
      expect(result.conflicts[0].ours).toEqual(['first ours']);
      expect(result.conflicts[1].theirs).toEqual(['second theirs']);
    });
  });

  describe('resolveConflicts', () => {
    test('should handle no conflicts', async () => {
      mockGit.getConflicts.mockResolvedValue([]);

      const result = await conflictResolver.resolveConflicts('auto');

      expect(result.success).toBe(true);
      expect(result.resolved).toBe(0);
    });

    test('should use ours strategy', async () => {
      mockGit.getConflicts.mockResolvedValue(['conflict.js']);
      fs.readFile.mockResolvedValue(`<<<<<<< HEAD
ours
=======
theirs
>>>>>>> branch`);

      mockGit.execGit.mockResolvedValue('');

      const result = await conflictResolver.resolveConflicts('ours');

      expect(mockGit.execGit).toHaveBeenCalledWith('checkout --ours "conflict.js"');
      expect(mockGit.execGit).toHaveBeenCalledWith('add "conflict.js"');
      expect(result.resolved).toBe(1);
    });

    test('should use theirs strategy', async () => {
      mockGit.getConflicts.mockResolvedValue(['conflict.js']);
      fs.readFile.mockResolvedValue(`<<<<<<< HEAD
ours
=======
theirs
>>>>>>> branch`);

      mockGit.execGit.mockResolvedValue('');

      const result = await conflictResolver.resolveConflicts('theirs');

      expect(mockGit.execGit).toHaveBeenCalledWith('checkout --theirs "conflict.js"');
      expect(mockGit.execGit).toHaveBeenCalledWith('add "conflict.js"');
      expect(result.resolved).toBe(1);
    });
  });

  describe('auto resolution strategies', () => {
    test('should auto-resolve whitespace conflicts', async () => {
      const content = `start
<<<<<<< HEAD
  indented code  
=======
  indented code
>>>>>>> branch
end`;

      const resolved = await conflictResolver.autoResolveWhitespace(content, {
        conflicts: [{
          ours: ['  indented code  '],
          theirs: ['  indented code']
        }]
      });

      expect(resolved).toContain('  indented code');
      expect(resolved).not.toContain('<<<<<<<');
      expect(resolved).not.toContain('=======');
      expect(resolved).not.toContain('>>>>>>>');
    });

    test('should auto-resolve import conflicts', async () => {
      const conflictInfo = {
        conflicts: [{
          ours: ["import { A } from './a';", "import { B } from './b';"],
          theirs: ["import { B } from './b';", "import { C } from './c';"]
        }]
      };

      const content = `<<<<<<< HEAD
import { A } from './a';
import { B } from './b';
=======
import { B } from './b';
import { C } from './c';
>>>>>>> branch`;

      const resolved = await conflictResolver.autoResolveImports(content, conflictInfo);

      expect(resolved).toContain("import { A } from './a';");
      expect(resolved).toContain("import { B } from './b';");
      expect(resolved).toContain("import { C } from './c';");
      expect(resolved).not.toContain('<<<<<<<');
    });

    test('should auto-resolve version conflicts by choosing higher version', async () => {
      const content = `{
<<<<<<< HEAD
  "version": "1.2.3",
=======
  "version": "1.3.0",
>>>>>>> branch
}`;

      const conflictInfo = {
        conflicts: [{
          ours: ['  "version": "1.2.3",'],
          theirs: ['  "version": "1.3.0",']
        }]
      };

      const resolved = await conflictResolver.autoResolveVersion(content, conflictInfo);

      expect(resolved).toContain('"version": "1.3.0"');
      expect(resolved).not.toContain('"version": "1.2.3"');
      expect(resolved).not.toContain('<<<<<<<');
    });

    test('should auto-resolve JSON conflicts by merging', async () => {
      const content = `<<<<<<< HEAD
{"name": "test", "version": "1.0.0", "ours": true}
=======
{"name": "test", "version": "1.0.0", "theirs": true}
>>>>>>> branch`;

      const conflictInfo = {
        conflicts: [{
          ours: ['{"name": "test", "version": "1.0.0", "ours": true}'],
          theirs: ['{"name": "test", "version": "1.0.0", "theirs": true}']
        }]
      };

      const resolved = await conflictResolver.autoResolveJSON(content, conflictInfo);

      const parsed = JSON.parse(resolved);
      expect(parsed.name).toBe('test');
      expect(parsed.ours).toBe(true);
      expect(parsed.theirs).toBe(true);
    });
  });

  describe('interactive resolution', () => {
    test('should handle interactive resolution with user choices', async () => {
      mockGit.getConflicts.mockResolvedValue(['interactive.js']);
      
      const content = `<<<<<<< HEAD
our code
=======
their code
>>>>>>> branch`;

      fs.readFile.mockResolvedValue(content);
      fs.writeFile.mockResolvedValue(undefined);
      
      inquirer.prompt.mockResolvedValueOnce({ resolution: 'ours' });

      const result = await conflictResolver.resolveConflicts('interactive');

      expect(inquirer.prompt).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(result.resolved).toBe(1);
    });

    test('should handle skip option in interactive mode', async () => {
      mockGit.getConflicts.mockResolvedValue(['skip.js']);
      
      const content = `<<<<<<< HEAD
skip this
=======
skip that
>>>>>>> branch`;

      fs.readFile.mockResolvedValue(content);
      inquirer.prompt.mockResolvedValueOnce({ resolution: 'skip' });

      const result = await conflictResolver.resolveConflicts('interactive');

      expect(result.resolved).toBe(0);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('generateConflictReport', () => {
    test('should generate report for conflicts', async () => {
      mockGit.getConflicts.mockResolvedValue(['report.js']);
      
      const content = `<<<<<<< HEAD
report our
=======
report their
>>>>>>> branch`;

      fs.readFile.mockResolvedValue(content);

      const report = await conflictResolver.generateConflictReport();

      expect(report.summary).toContain('1 conflicts in 1 files');
      expect(report.details).toHaveLength(1);
      expect(report.details[0].file).toBe('report.js');
      expect(report.recommendations).toBeDefined();
    });

    test('should generate recommendations based on conflict types', async () => {
      mockGit.getConflicts.mockResolvedValue(['whitespace.js', 'imports.js']);
      
      fs.readFile
        .mockResolvedValueOnce(`<<<<<<< HEAD
  spaced  
=======
  spaced
>>>>>>> branch`)
        .mockResolvedValueOnce(`<<<<<<< HEAD
import A from 'a';
=======
import B from 'b';
>>>>>>> branch`);

      const report = await conflictResolver.generateConflictReport();

      expect(report.recommendations).toContainEqual(
        expect.objectContaining({ type: 'whitespace' })
      );
      expect(report.recommendations).toContainEqual(
        expect.objectContaining({ type: 'imports' })
      );
    });
  });

  describe('deepMerge', () => {
    test('should merge objects deeply', () => {
      const obj1 = {
        a: 1,
        b: { c: 2, d: 3 },
        e: [1, 2]
      };
      
      const obj2 = {
        a: 2,
        b: { c: 3, f: 4 },
        g: 5
      };

      const merged = conflictResolver.deepMerge(obj1, obj2);

      expect(merged).toEqual({
        a: 2,
        b: { c: 3, d: 3, f: 4 },
        e: [1, 2],
        g: 5
      });
    });
  });
});