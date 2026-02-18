/**
 * BOB-VETO-3: Cleanup Order Fix Tests
 *
 * Validates that BOB loads session state BEFORE running cleanup,
 * preventing race condition where cleanup might delete files still referenced in session.
 */

const path = require('path');
const fs = require('fs');
const { BobOrchestrator } = require('../../../.aios-core/core/orchestration/bob-orchestrator');

const TEST_PROJECT_ROOT = path.join(__dirname, '../../fixtures/test-project-veto-3');

describe('BOB-VETO-3: Cleanup order fix', () => {
  beforeEach(() => {
    // Clean up test project
    if (fs.existsSync(TEST_PROJECT_ROOT)) {
      fs.rmSync(TEST_PROJECT_ROOT, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_PROJECT_ROOT, { recursive: true });
  });

  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(TEST_PROJECT_ROOT)) {
      fs.rmSync(TEST_PROJECT_ROOT, { recursive: true, force: true });
    }
  });

  it('should extract protected files from context_snapshot', () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    const sessionState = {
      session_state: {
        context_snapshot: {
          files_modified: ['src/test.js', 'src/app.js'],
        },
      },
    };

    const protectedFiles = bob._extractProtectedFiles(sessionState);

    expect(protectedFiles).toContain('src/test.js');
    expect(protectedFiles).toContain('src/app.js');
    expect(protectedFiles.length).toBe(2);
  });

  it('should extract protected files from workflow phase_results', () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    const sessionState = {
      session_state: {
        workflow: {
          phase_results: {
            phase1: {
              implementation: {
                files_created: ['src/new-file.js'],
                files_modified: ['src/existing.js'],
              },
            },
            phase2: {
              implementation: {
                files_created: ['tests/test.js'],
              },
            },
          },
        },
      },
    };

    const protectedFiles = bob._extractProtectedFiles(sessionState);

    expect(protectedFiles).toContain('src/new-file.js');
    expect(protectedFiles).toContain('src/existing.js');
    expect(protectedFiles).toContain('tests/test.js');
    expect(protectedFiles.length).toBe(3);
  });

  it('should combine files from both context_snapshot and workflow', () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    const sessionState = {
      session_state: {
        context_snapshot: {
          files_modified: ['src/context.js'],
        },
        workflow: {
          phase_results: {
            phase1: {
              implementation: {
                files_created: ['src/workflow.js'],
              },
            },
          },
        },
      },
    };

    const protectedFiles = bob._extractProtectedFiles(sessionState);

    expect(protectedFiles).toContain('src/context.js');
    expect(protectedFiles).toContain('src/workflow.js');
    expect(protectedFiles.length).toBe(2);
  });

  it('should deduplicate files (use Set internally)', () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    const sessionState = {
      session_state: {
        context_snapshot: {
          files_modified: ['src/duplicate.js', 'src/unique.js'],
        },
        workflow: {
          phase_results: {
            phase1: {
              implementation: {
                files_modified: ['src/duplicate.js'], // Same file as context_snapshot
              },
            },
          },
        },
      },
    };

    const protectedFiles = bob._extractProtectedFiles(sessionState);

    // Should have only 2 unique files
    expect(protectedFiles.length).toBe(2);
    expect(protectedFiles).toContain('src/duplicate.js');
    expect(protectedFiles).toContain('src/unique.js');
  });

  it('should return empty array when no files to protect', () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    const sessionState = {
      session_state: {
        // No context_snapshot or workflow
      },
    };

    const protectedFiles = bob._extractProtectedFiles(sessionState);

    expect(protectedFiles).toEqual([]);
  });

  it('should handle missing nested properties gracefully', () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    const sessionState = {
      session_state: {
        context_snapshot: {
          // files_modified is missing
        },
        workflow: {
          phase_results: {
            phase1: {
              implementation: {
                // files_created and files_modified are missing
              },
            },
          },
        },
      },
    };

    const protectedFiles = bob._extractProtectedFiles(sessionState);

    expect(protectedFiles).toEqual([]);
  });

  it('should handle non-array files_modified gracefully', () => {
    const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

    const sessionState = {
      session_state: {
        context_snapshot: {
          files_modified: 'not-an-array', // Invalid format
        },
      },
    };

    const protectedFiles = bob._extractProtectedFiles(sessionState);

    // Should not crash, return empty array
    expect(protectedFiles).toEqual([]);
  });
});
