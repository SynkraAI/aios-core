/**
 * Integration Tests for UnifiedActivationPipeline
 *
 * Story ACT-6: Unified Activation Pipeline
 *
 * Tests:
 * - Each of 12 agents activates through unified pipeline
 * - Identical context structure for all agents
 * - Parallel loading of 5 loaders
 * - Sequential steps with data dependencies
 * - Timeout protection and fallback behavior
 * - Backward compatibility (generate-greeting.js still works)
 * - Performance targets (<200ms total)
 * - Error isolation (one loader fails, others still work)
 */

'use strict';

// --- Mock Setup (BEFORE requiring modules) ---

const mockCoreConfig = {
  user_profile: 'advanced',
  agentIdentity: {
    greeting: {
      preference: 'auto',
      contextDetection: true,
      sessionDetection: 'hybrid',
    },
  },
  dataLocation: '.aios-core/data',
  devStoryLocation: 'docs/stories',
  projectStatus: { enabled: true },
};

const mockAgentDefinition = {
  agent: {
    id: 'dev',
    name: 'Dex',
    icon: '\uD83D\uDCBB',
    title: 'Full Stack Developer',
  },
  persona_profile: {
    archetype: 'Builder',
    communication: {
      greeting_levels: {
        minimal: '\uD83D\uDCBB dev Agent ready',
        named: '\uD83D\uDCBB Dex (Builder) ready. Let\'s build something great!',
        archetypal: '\uD83D\uDCBB Dex the Builder ready to innovate!',
      },
      signature_closing: '-- Dex, sempre construindo',
    },
    greeting_levels: {
      minimal: '\uD83D\uDCBB dev Agent ready',
      named: '\uD83D\uDCBB Dex (Builder) ready. Let\'s build something great!',
      archetypal: '\uD83D\uDCBB Dex the Builder ready to innovate!',
    },
  },
  persona: {
    role: 'Expert Senior Software Engineer',
  },
  commands: [
    { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show help' },
    { name: 'develop', visibility: ['full', 'quick'], description: 'Implement story' },
    { name: 'exit', visibility: ['full', 'quick', 'key'], description: 'Exit' },
  ],
};

const mockSessionContext = {
  sessionType: 'new',
  message: null,
  previousAgent: null,
  lastCommands: [],
  workflowActive: null,
  currentStory: null,
};

const mockProjectStatus = {
  branch: 'main',
  modifiedFiles: [],
  modifiedFilesTotalCount: 0,
  recentCommits: [],
  currentStory: null,
};

const mockGitConfig = {
  configured: true,
  type: 'github',
  branch: 'main',
};

// Mock fs.promises
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    promises: {
      ...actual.promises,
      readFile: jest.fn().mockImplementation((filePath) => {
        if (filePath.includes('core-config.yaml')) {
          const yaml = jest.requireActual('js-yaml');
          return Promise.resolve(yaml.dump(mockCoreConfig));
        }
        if (filePath.includes('.md')) {
          return Promise.resolve('```yaml\nagent:\n  id: dev\n  name: Dex\n  icon: "\uD83D\uDCBB"\n```');
        }
        return Promise.resolve('');
      }),
      access: jest.fn().mockResolvedValue(undefined),
    },
    existsSync: actual.existsSync,
    readFileSync: jest.fn().mockImplementation((filePath) => {
      if (filePath.includes('core-config.yaml')) {
        const yaml = jest.requireActual('js-yaml');
        return yaml.dump(mockCoreConfig);
      }
      if (filePath.includes('workflow-patterns.yaml')) {
        return 'workflows: {}';
      }
      if (filePath.includes('session-state.json')) {
        return JSON.stringify({});
      }
      return '';
    }),
  };
});

// Mock agent-config-loader
jest.mock('../../.aios-core/development/scripts/agent-config-loader', () => ({
  AgentConfigLoader: jest.fn().mockImplementation(() => ({
    loadComplete: jest.fn().mockResolvedValue({
      config: { dataLocation: '.aios-core/data' },
      definition: mockAgentDefinition,
      agent: mockAgentDefinition.agent,
      persona_profile: mockAgentDefinition.persona_profile,
      commands: mockAgentDefinition.commands,
    }),
  })),
}));

// Mock session context loader
jest.mock('../../.aios-core/core/session/context-loader', () => {
  return jest.fn().mockImplementation(() => ({
    loadContext: jest.fn().mockReturnValue(mockSessionContext),
  }));
});

// Mock project status loader
jest.mock('../../.aios-core/infrastructure/scripts/project-status-loader', () => ({
  loadProjectStatus: jest.fn().mockResolvedValue(mockProjectStatus),
}));

// Mock git config detector
jest.mock('../../.aios-core/infrastructure/scripts/git-config-detector', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockReturnValue(mockGitConfig),
  }));
});

// Mock permission mode
jest.mock('../../.aios-core/core/permissions', () => ({
  PermissionMode: jest.fn().mockImplementation(() => ({
    currentMode: 'ask',
    load: jest.fn().mockResolvedValue('ask'),
    getBadge: jest.fn().mockReturnValue('[Ask]'),
    _loaded: false,
  })),
  OperationGuard: jest.fn(),
}));

// Mock config-resolver
jest.mock('../../.aios-core/core/config/config-resolver', () => ({
  resolveConfig: jest.fn().mockReturnValue({
    config: mockCoreConfig,
  }),
}));

// Mock validate-user-profile
jest.mock('../../.aios-core/infrastructure/scripts/validate-user-profile', () => ({
  validateUserProfile: jest.fn().mockReturnValue({
    valid: true,
    value: 'advanced',
    warning: null,
  }),
}));

// Mock greeting-preference-manager
jest.mock('../../.aios-core/development/scripts/greeting-preference-manager', () => {
  return jest.fn().mockImplementation(() => ({
    getPreference: jest.fn().mockReturnValue('auto'),
  }));
});

// Mock context-detector
jest.mock('../../.aios-core/core/session/context-detector', () => {
  return jest.fn().mockImplementation(() => ({
    detectSessionType: jest.fn().mockReturnValue('new'),
  }));
});

// Mock workflow-navigator
jest.mock('../../.aios-core/development/scripts/workflow-navigator', () => {
  return jest.fn().mockImplementation(() => ({
    detectWorkflowState: jest.fn().mockReturnValue(null),
    getNextSteps: jest.fn().mockReturnValue([]),
    suggestNextCommands: jest.fn().mockReturnValue([]),
    formatSuggestions: jest.fn().mockReturnValue(''),
    getGreetingMessage: jest.fn().mockReturnValue(''),
    extractContext: jest.fn().mockReturnValue({}),
    patterns: { workflows: {} },
  }));
});

// Mock config cache
jest.mock('../../.aios-core/core/config/config-cache', () => ({
  globalConfigCache: {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    invalidate: jest.fn(),
  },
}));

// Mock performance tracker
jest.mock('../../.aios-core/infrastructure/scripts/performance-tracker', () => ({
  trackConfigLoad: jest.fn(),
}));

// --- Require modules AFTER mocks ---
const { UnifiedActivationPipeline, ALL_AGENT_IDS } = require('../../.aios-core/development/scripts/unified-activation-pipeline');
const { AgentConfigLoader } = require('../../.aios-core/development/scripts/agent-config-loader');
const SessionContextLoader = require('../../.aios-core/core/session/context-loader');
const { loadProjectStatus } = require('../../.aios-core/infrastructure/scripts/project-status-loader');
const GitConfigDetector = require('../../.aios-core/infrastructure/scripts/git-config-detector');
const { PermissionMode } = require('../../.aios-core/core/permissions');

// ============================================================
// Tests
// ============================================================

describe('UnifiedActivationPipeline', () => {
  let pipeline;

  beforeEach(() => {
    jest.clearAllMocks();

    // Restore default mock implementations that may have been overridden by prior tests.
    // jest.clearAllMocks() only clears call history, NOT implementations set via mockImplementation().
    AgentConfigLoader.mockImplementation(() => ({
      loadComplete: jest.fn().mockResolvedValue({
        config: { dataLocation: '.aios-core/data' },
        definition: mockAgentDefinition,
        agent: mockAgentDefinition.agent,
        persona_profile: mockAgentDefinition.persona_profile,
        commands: mockAgentDefinition.commands,
      }),
    }));

    SessionContextLoader.mockImplementation(() => ({
      loadContext: jest.fn().mockReturnValue(mockSessionContext),
    }));

    loadProjectStatus.mockImplementation(() => Promise.resolve(mockProjectStatus));

    GitConfigDetector.mockImplementation(() => ({
      get: jest.fn().mockReturnValue(mockGitConfig),
    }));

    PermissionMode.mockImplementation(() => ({
      currentMode: 'ask',
      load: jest.fn().mockResolvedValue('ask'),
      getBadge: jest.fn().mockReturnValue('[Ask]'),
      _loaded: false,
    }));

    const ContextDetector = require('../../.aios-core/core/session/context-detector');
    ContextDetector.mockImplementation(() => ({
      detectSessionType: jest.fn().mockReturnValue('new'),
    }));

    pipeline = new UnifiedActivationPipeline();
  });

  // -----------------------------------------------------------
  // 1. Core Activation
  // -----------------------------------------------------------
  describe('activate()', () => {
    it('should activate an agent and return greeting + context + duration', async () => {
      const result = await pipeline.activate('dev');

      expect(result).toHaveProperty('greeting');
      expect(result).toHaveProperty('context');
      expect(result).toHaveProperty('duration');
      expect(typeof result.greeting).toBe('string');
      expect(typeof result.duration).toBe('number');
      expect(result.greeting.length).toBeGreaterThan(0);
    });

    it('should return a non-empty greeting string', async () => {
      const result = await pipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
      expect(result.greeting.length).toBeGreaterThan(5);
    });

    it('should include duration in response', async () => {
      const result = await pipeline.activate('dev');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  // -----------------------------------------------------------
  // 2. All 12 Agents - Identical Context Structure
  // -----------------------------------------------------------
  describe('all 12 agents produce identical context structure', () => {
    const expectedContextKeys = [
      'agent', 'config', 'session', 'projectStatus', 'gitConfig',
      'permissions', 'preference', 'sessionType', 'workflowState',
      'userProfile', 'conversationHistory', 'lastCommands',
      'previousAgent', 'sessionMessage', 'workflowActive', 'sessionStory',
    ];

    ALL_AGENT_IDS.forEach(agentId => {
      it(`should produce correct context structure for @${agentId}`, async () => {
        // Adjust mock to return the agent's ID
        AgentConfigLoader.mockImplementation(() => ({
          loadComplete: jest.fn().mockResolvedValue({
            config: { dataLocation: '.aios-core/data' },
            definition: {
              ...mockAgentDefinition,
              agent: { ...mockAgentDefinition.agent, id: agentId },
            },
            agent: { ...mockAgentDefinition.agent, id: agentId },
            persona_profile: mockAgentDefinition.persona_profile,
            commands: mockAgentDefinition.commands,
          }),
        }));

        const result = await pipeline.activate(agentId);

        // Verify all expected keys exist in context
        for (const key of expectedContextKeys) {
          expect(result.context).toHaveProperty(key);
        }

        // Verify context has the correct agent ID
        expect(result.context.agent.id).toBe(agentId);

        // Verify greeting is a non-empty string
        expect(typeof result.greeting).toBe('string');
        expect(result.greeting.length).toBeGreaterThan(0);
      });
    });

    it('should produce contexts with the exact same keys for all agents', async () => {
      const contextKeys = [];

      for (const agentId of ALL_AGENT_IDS) {
        AgentConfigLoader.mockImplementation(() => ({
          loadComplete: jest.fn().mockResolvedValue({
            config: {},
            definition: {
              ...mockAgentDefinition,
              agent: { ...mockAgentDefinition.agent, id: agentId },
            },
            agent: { ...mockAgentDefinition.agent, id: agentId },
            persona_profile: mockAgentDefinition.persona_profile,
            commands: mockAgentDefinition.commands,
          }),
        }));

        const result = await pipeline.activate(agentId);
        contextKeys.push(Object.keys(result.context).sort().join(','));
      }

      // All contexts should have the same key set
      const uniqueKeyPatterns = new Set(contextKeys);
      expect(uniqueKeyPatterns.size).toBe(1);
    });
  });

  // -----------------------------------------------------------
  // 3. Parallel Loading
  // -----------------------------------------------------------
  describe('parallel loading', () => {
    it('should call all 5 loaders', async () => {
      await pipeline.activate('dev');

      // AgentConfigLoader called
      expect(AgentConfigLoader).toHaveBeenCalled();

      // SessionContextLoader called
      expect(SessionContextLoader).toHaveBeenCalled();

      // ProjectStatusLoader called
      expect(loadProjectStatus).toHaveBeenCalled();

      // GitConfigDetector called
      expect(GitConfigDetector).toHaveBeenCalled();

      // PermissionMode called
      expect(PermissionMode).toHaveBeenCalled();
    });

    it('should load all 5 loaders even if one is slow', async () => {
      // Make one loader slow but still within timeout
      loadProjectStatus.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockProjectStatus), 50)),
      );

      const result = await pipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
      expect(result.context.projectStatus).toEqual(mockProjectStatus);
    });
  });

  // -----------------------------------------------------------
  // 4. Error Isolation (one loader fails, others still work)
  // -----------------------------------------------------------
  describe('error isolation', () => {
    it('should still produce greeting when AgentConfigLoader fails', async () => {
      AgentConfigLoader.mockImplementation(() => ({
        loadComplete: jest.fn().mockRejectedValue(new Error('Agent config error')),
      }));

      const freshPipeline = new UnifiedActivationPipeline();
      const result = await freshPipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
      expect(typeof result.greeting).toBe('string');
    });

    it('should still produce greeting when SessionContextLoader fails', async () => {
      SessionContextLoader.mockImplementation(() => ({
        loadContext: jest.fn().mockImplementation(() => { throw new Error('Session error'); }),
      }));

      const result = await pipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
    });

    it('should still produce greeting when ProjectStatusLoader fails', async () => {
      loadProjectStatus.mockRejectedValue(new Error('Project status error'));

      const result = await pipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
      expect(result.context.projectStatus).toBeNull();
    });

    it('should still produce greeting when GitConfigDetector fails', async () => {
      GitConfigDetector.mockImplementation(() => ({
        get: jest.fn().mockImplementation(() => { throw new Error('Git config error'); }),
      }));

      const result = await pipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
    });

    it('should still produce greeting when PermissionMode fails', async () => {
      PermissionMode.mockImplementation(() => ({
        currentMode: 'ask',
        load: jest.fn().mockRejectedValue(new Error('Permission error')),
        getBadge: jest.fn().mockReturnValue('[Ask]'),
      }));

      const result = await pipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
    });

    it('should use fallback when ALL loaders fail', async () => {
      AgentConfigLoader.mockImplementation(() => ({
        loadComplete: jest.fn().mockRejectedValue(new Error('fail')),
      }));
      SessionContextLoader.mockImplementation(() => ({
        loadContext: jest.fn().mockImplementation(() => { throw new Error('fail'); }),
      }));
      loadProjectStatus.mockRejectedValue(new Error('fail'));
      GitConfigDetector.mockImplementation(() => ({
        get: jest.fn().mockImplementation(() => { throw new Error('fail'); }),
      }));
      PermissionMode.mockImplementation(() => ({
        load: jest.fn().mockRejectedValue(new Error('fail')),
        getBadge: jest.fn().mockReturnValue(''),
      }));

      // Recreate pipeline to pick up new mocks
      const freshPipeline = new UnifiedActivationPipeline();
      const result = await freshPipeline.activate('dev');
      expect(result.greeting).toBeTruthy();
      expect(result.greeting).toContain('dev');
    });
  });

  // -----------------------------------------------------------
  // 5. Timeout Protection
  // -----------------------------------------------------------
  describe('timeout protection', () => {
    it('should return fallback greeting if pipeline exceeds timeout', async () => {
      // Make all loaders very slow
      AgentConfigLoader.mockImplementation(() => ({
        loadComplete: jest.fn().mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve(null), 500)),
        ),
      }));
      loadProjectStatus.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(null), 500)),
      );

      const result = await pipeline.activate('dev');
      // Should still return something (either from pipeline or timeout fallback)
      expect(result.greeting).toBeTruthy();
      expect(typeof result.greeting).toBe('string');
      expect(result.fallback).toBe(true);
    });
  });

  // -----------------------------------------------------------
  // 6. Enriched Context Shape
  // -----------------------------------------------------------
  describe('enriched context shape', () => {
    it('should include agent definition in context', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.agent).toBeDefined();
      expect(result.context.agent.id).toBe('dev');
    });

    it('should include session info in context', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.session).toBeDefined();
      expect(result.context.sessionType).toBe('new');
    });

    it('should include project status in context', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.projectStatus).toEqual(mockProjectStatus);
    });

    it('should include git config in context', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.gitConfig).toEqual(mockGitConfig);
    });

    it('should include permission data in context', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.permissions).toBeDefined();
      expect(result.context.permissions.mode).toBe('ask');
      expect(result.context.permissions.badge).toBe('[Ask]');
    });

    it('should include user profile in context', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.userProfile).toBe('advanced');
    });

    it('should include preference in context', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.preference).toBe('auto');
    });

    it('should include workflow state (null for new session)', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.workflowState).toBeNull();
    });

    it('should include backward-compatible legacy fields', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context).toHaveProperty('conversationHistory');
      expect(result.context).toHaveProperty('lastCommands');
      expect(result.context).toHaveProperty('previousAgent');
      expect(result.context).toHaveProperty('sessionMessage');
      expect(result.context).toHaveProperty('workflowActive');
      expect(result.context).toHaveProperty('sessionStory');
    });
  });

  // -----------------------------------------------------------
  // 7. Session Type Detection
  // -----------------------------------------------------------
  describe('session type detection', () => {
    it('should detect new session type', async () => {
      const result = await pipeline.activate('dev');
      expect(result.context.sessionType).toBe('new');
    });

    it('should use session type from SessionContextLoader when available', async () => {
      SessionContextLoader.mockImplementation(() => ({
        loadContext: jest.fn().mockReturnValue({
          ...mockSessionContext,
          sessionType: 'existing',
          lastCommands: ['develop'],
        }),
      }));

      const result = await pipeline.activate('dev');
      expect(result.context.sessionType).toBe('existing');
    });

    it('should prefer conversation history over session context for detection', async () => {
      const ContextDetector = require('../../.aios-core/core/session/context-detector');
      ContextDetector.mockImplementation(() => ({
        detectSessionType: jest.fn().mockReturnValue('workflow'),
      }));

      // Recreate pipeline to pick up new mock
      const freshPipeline = new UnifiedActivationPipeline();

      const result = await freshPipeline.activate('dev', {
        conversationHistory: [{ content: '*develop story-1' }, { content: '*run-tests' }],
      });
      expect(result.context.sessionType).toBe('workflow');
    });
  });

  // -----------------------------------------------------------
  // 8. Fallback Greeting
  // -----------------------------------------------------------
  describe('fallback greeting', () => {
    it('should produce a valid fallback for unknown agents', async () => {
      AgentConfigLoader.mockImplementation(() => ({
        loadComplete: jest.fn().mockRejectedValue(new Error('Agent not found')),
      }));

      // Recreate pipeline to pick up new mock
      const freshPipeline = new UnifiedActivationPipeline();
      const result = await freshPipeline.activate('unknown-agent');
      expect(result.greeting).toBeTruthy();
      expect(typeof result.greeting).toBe('string');
      // The greeting should contain the agent ID somewhere
      expect(result.greeting).toContain('unknown-agent');
    });

    it('should include the agent ID in fallback greeting', async () => {
      const greeting = pipeline._generateFallbackGreeting('test-agent');
      expect(greeting).toContain('test-agent');
    });
  });

  // -----------------------------------------------------------
  // 9. Static Methods
  // -----------------------------------------------------------
  describe('static methods', () => {
    it('getAllAgentIds() should return all 12 agent IDs', () => {
      const ids = UnifiedActivationPipeline.getAllAgentIds();
      expect(ids).toHaveLength(12);
      expect(ids).toContain('dev');
      expect(ids).toContain('qa');
      expect(ids).toContain('architect');
      expect(ids).toContain('pm');
      expect(ids).toContain('po');
      expect(ids).toContain('sm');
      expect(ids).toContain('analyst');
      expect(ids).toContain('data-engineer');
      expect(ids).toContain('ux-design-expert');
      expect(ids).toContain('devops');
      expect(ids).toContain('aios-master');
      expect(ids).toContain('squad-creator');
    });

    it('isValidAgentId() should return true for valid IDs', () => {
      expect(UnifiedActivationPipeline.isValidAgentId('dev')).toBe(true);
      expect(UnifiedActivationPipeline.isValidAgentId('qa')).toBe(true);
      expect(UnifiedActivationPipeline.isValidAgentId('aios-master')).toBe(true);
    });

    it('isValidAgentId() should return false for invalid IDs', () => {
      expect(UnifiedActivationPipeline.isValidAgentId('invalid')).toBe(false);
      expect(UnifiedActivationPipeline.isValidAgentId('')).toBe(false);
      expect(UnifiedActivationPipeline.isValidAgentId('DEV')).toBe(false);
    });
  });

  // -----------------------------------------------------------
  // 10. Default Icon Mapping
  // -----------------------------------------------------------
  describe('default icon mapping', () => {
    it('should return correct icons for known agents', () => {
      expect(pipeline._getDefaultIcon('dev')).toBe('\uD83D\uDCBB');
      expect(pipeline._getDefaultIcon('aios-master')).toBe('\uD83D\uDC51');
    });

    it('should return default robot icon for unknown agents', () => {
      expect(pipeline._getDefaultIcon('unknown')).toBe('\uD83E\uDD16');
    });
  });

  // -----------------------------------------------------------
  // 11. Default Context
  // -----------------------------------------------------------
  describe('default context', () => {
    it('_getDefaultContext should return complete structure', () => {
      const ctx = pipeline._getDefaultContext('dev');
      expect(ctx.agent.id).toBe('dev');
      expect(ctx.sessionType).toBe('new');
      expect(ctx.permissions.mode).toBe('ask');
      expect(ctx.preference).toBe('auto');
      expect(ctx.userProfile).toBe('advanced');
    });

    it('_getDefaultSessionContext should return new session defaults', () => {
      const session = pipeline._getDefaultSessionContext();
      expect(session.sessionType).toBe('new');
      expect(session.previousAgent).toBeNull();
      expect(session.lastCommands).toEqual([]);
    });
  });

  // -----------------------------------------------------------
  // 12. Agent Definition Building
  // -----------------------------------------------------------
  describe('agent definition building', () => {
    it('should build from loaded config data', () => {
      const agentComplete = {
        agent: { id: 'dev', name: 'Dex', icon: '\uD83D\uDCBB' },
        persona_profile: mockAgentDefinition.persona_profile,
        definition: { persona: { role: 'Developer' }, commands: [] },
        commands: [{ name: 'help' }],
      };

      const def = pipeline._buildAgentDefinition('dev', agentComplete);
      expect(def.id).toBe('dev');
      expect(def.name).toBe('Dex');
      expect(def.persona_profile).toBeDefined();
      expect(def.commands).toHaveLength(1);
    });

    it('should return fallback definition when loader returns null', () => {
      const def = pipeline._buildAgentDefinition('dev', null);
      expect(def.id).toBe('dev');
      expect(def.name).toBe('dev');
      expect(def.persona_profile).toBeDefined();
      expect(def.persona_profile.greeting_levels).toBeDefined();
      expect(def.commands).toEqual([]);
    });
  });

  // -----------------------------------------------------------
  // 13. Preference Resolution
  // -----------------------------------------------------------
  describe('preference resolution', () => {
    it('should bypass bob mode restriction for PM agent', () => {
      const pmAgent = { id: 'pm' };
      const pref = pipeline._resolvePreference(pmAgent, 'bob');
      // PM bypasses bob mode, should call getPreference with 'advanced'
      expect(pipeline.preferenceManager.getPreference).toHaveBeenCalledWith('advanced');
    });

    it('should apply bob mode restriction for non-PM agents', () => {
      const devAgent = { id: 'dev' };
      pipeline._resolvePreference(devAgent, 'bob');
      expect(pipeline.preferenceManager.getPreference).toHaveBeenCalledWith('bob');
    });

    it('should pass through advanced profile without changes', () => {
      const devAgent = { id: 'dev' };
      pipeline._resolvePreference(devAgent, 'advanced');
      expect(pipeline.preferenceManager.getPreference).toHaveBeenCalledWith('advanced');
    });
  });

  // -----------------------------------------------------------
  // 14. Workflow State Detection
  // -----------------------------------------------------------
  describe('workflow state detection', () => {
    it('should return null for non-workflow sessions', () => {
      const result = pipeline._detectWorkflowState(mockSessionContext, 'new');
      expect(result).toBeNull();
    });

    it('should return null when session context is null', () => {
      const result = pipeline._detectWorkflowState(null, 'workflow');
      expect(result).toBeNull();
    });

    it('should return null when no command history', () => {
      const result = pipeline._detectWorkflowState(
        { lastCommands: [] },
        'workflow',
      );
      expect(result).toBeNull();
    });

    it('should attempt detection for workflow sessions with commands', () => {
      const sessionWithCommands = {
        lastCommands: ['develop', 'run-tests'],
      };
      pipeline._detectWorkflowState(sessionWithCommands, 'workflow');
      expect(pipeline.workflowNavigator.detectWorkflowState).toHaveBeenCalledWith(
        ['develop', 'run-tests'],
        sessionWithCommands,
      );
    });
  });

  // -----------------------------------------------------------
  // 15. generate-greeting.js Backward Compatibility
  // -----------------------------------------------------------
  describe('generate-greeting.js backward compatibility', () => {
    it('should export generateGreeting function', () => {
      const { generateGreeting } = require('../../.aios-core/development/scripts/generate-greeting');
      expect(typeof generateGreeting).toBe('function');
    });
  });

  // -----------------------------------------------------------
  // 16. Performance
  // -----------------------------------------------------------
  describe('performance', () => {
    it('should complete activation within 500ms (mocked loaders)', async () => {
      const startTime = Date.now();
      await pipeline.activate('dev');
      const duration = Date.now() - startTime;
      // With mocked loaders, should be well under 500ms
      // Real-world target is <200ms; CI environments have variable timing
      expect(duration).toBeLessThan(500);
    });

    it('should report duration in result', async () => {
      const result = await pipeline.activate('dev');
      expect(result.duration).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  // -----------------------------------------------------------
  // 17. Safe Load Wrapper
  // -----------------------------------------------------------
  describe('_safeLoad', () => {
    it('should return result on success', async () => {
      const result = await pipeline._safeLoad('TestLoader', () => Promise.resolve({ data: 'test' }));
      expect(result).toEqual({ data: 'test' });
    });

    it('should return null on error', async () => {
      const result = await pipeline._safeLoad('TestLoader', () => Promise.reject(new Error('fail')));
      expect(result).toBeNull();
    });

    it('should return null on timeout', async () => {
      const result = await pipeline._safeLoad('TestLoader', () =>
        new Promise(resolve => setTimeout(() => resolve('late'), 500)),
      );
      expect(result).toBeNull();
    });
  });

  // -----------------------------------------------------------
  // 18. Constructor Options
  // -----------------------------------------------------------
  describe('constructor options', () => {
    it('should accept custom projectRoot', () => {
      const customPipeline = new UnifiedActivationPipeline({ projectRoot: '/custom/path' });
      expect(customPipeline.projectRoot).toBe('/custom/path');
    });

    it('should use cwd as default projectRoot', () => {
      const defaultPipeline = new UnifiedActivationPipeline();
      expect(defaultPipeline.projectRoot).toBe(process.cwd());
    });

    it('should accept custom greetingBuilder', () => {
      const mockBuilder = { buildGreeting: jest.fn() };
      const customPipeline = new UnifiedActivationPipeline({ greetingBuilder: mockBuilder });
      expect(customPipeline.greetingBuilder).toBe(mockBuilder);
    });
  });

  // -----------------------------------------------------------
  // 19. ALL_AGENT_IDS constant
  // -----------------------------------------------------------
  describe('ALL_AGENT_IDS', () => {
    it('should contain exactly 12 agents', () => {
      expect(ALL_AGENT_IDS).toHaveLength(12);
    });

    it('should not have duplicates', () => {
      const unique = new Set(ALL_AGENT_IDS);
      expect(unique.size).toBe(ALL_AGENT_IDS.length);
    });

    it('should include the formerly Path-B agents', () => {
      expect(ALL_AGENT_IDS).toContain('devops');
      expect(ALL_AGENT_IDS).toContain('data-engineer');
      expect(ALL_AGENT_IDS).toContain('ux-design-expert');
    });
  });
});
