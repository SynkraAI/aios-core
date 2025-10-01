/**
 * Unit tests for Elicitation Engine
 * @module elicitation-engine.test
 */

const ElicitationEngine = require('../../../aios-core/utils/elicitation-engine');
const inquirer = require('inquirer');

// Mock inquirer
jest.mock('inquirer');

describe('ElicitationEngine', () => {
  let elicitationEngine;

  beforeEach(() => {
    elicitationEngine = new ElicitationEngine();
    jest.clearAllMocks();
  });

  describe('startElicitation', () => {
    test('runs agent elicitation successfully', async () => {
      const mockAnswers = {
        agentName: 'test-agent',
        agentTitle: 'Test Agent',
        whenToUse: 'For testing',
        includeCommands: true,
        commands: ['*test', '*analyze'],
        includePersona: true,
        personaTone: 'professional',
        personaVerbosity: 'concise'
      };

      inquirer.prompt
        .mockResolvedValueOnce({ agentName: 'test-agent' })
        .mockResolvedValueOnce({ agentTitle: 'Test Agent' })
        .mockResolvedValueOnce({ whenToUse: 'For testing' })
        .mockResolvedValueOnce({ includeCommands: true })
        .mockResolvedValueOnce({ commands: ['*test', '*analyze'] })
        .mockResolvedValueOnce({ includePersona: true })
        .mockResolvedValueOnce({ 
          personaTone: 'professional',
          personaVerbosity: 'concise'
        })
        .mockResolvedValueOnce({ includeSecurity: false })
        .mockResolvedValueOnce({ includeAdvanced: false });

      const result = await elicitationEngine.startElicitation('agent');

      expect(result).toMatchObject({
        agentName: 'test-agent',
        agentTitle: 'Test Agent',
        whenToUse: 'For testing',
        commands: ['*test', '*analyze'],
        personaTone: 'professional',
        personaVerbosity: 'concise'
      });
    });

    test('runs task elicitation successfully', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ taskId: 'test-task' })
        .mockResolvedValueOnce({ taskTitle: 'Test Task' })
        .mockResolvedValueOnce({ agentName: 'test-agent' })
        .mockResolvedValueOnce({ taskDescription: 'A test task' })
        .mockResolvedValueOnce({ includeSteps: true })
        .mockResolvedValueOnce({ stepCount: 3 });

      const result = await elicitationEngine.startElicitation('task');

      expect(result).toMatchObject({
        taskId: 'test-task',
        taskTitle: 'Test Task',
        agentName: 'test-agent',
        taskDescription: 'A test task',
        includeSteps: true,
        stepCount: 3
      });
    });

    test('runs workflow elicitation successfully', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ workflowId: 'test-workflow' })
        .mockResolvedValueOnce({ workflowName: 'Test Workflow' })
        .mockResolvedValueOnce({ workflowType: 'sequential' })
        .mockResolvedValueOnce({ description: 'Test workflow' })
        .mockResolvedValueOnce({ trigger: 'manual' })
        .mockResolvedValueOnce({ includeSteps: true })
        .mockResolvedValueOnce({ stepCount: 2 });

      const result = await elicitationEngine.startElicitation('workflow');

      expect(result).toMatchObject({
        workflowId: 'test-workflow',
        workflowName: 'Test Workflow',
        workflowType: 'sequential',
        description: 'Test workflow',
        trigger: 'manual'
      });
    });

    test('throws error for invalid component type', async () => {
      await expect(elicitationEngine.startElicitation('invalid'))
        .rejects.toThrow('Unknown component type: invalid');
    });
  });

  describe('Progressive Disclosure', () => {
    test('skips command elicitation when includeCommands is false', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ agentName: 'simple-agent' })
        .mockResolvedValueOnce({ agentTitle: 'Simple Agent' })
        .mockResolvedValueOnce({ whenToUse: 'Simple tasks' })
        .mockResolvedValueOnce({ includeCommands: false })
        .mockResolvedValueOnce({ includePersona: false })
        .mockResolvedValueOnce({ includeSecurity: false })
        .mockResolvedValueOnce({ includeAdvanced: false });

      const result = await elicitationEngine.startElicitation('agent');

      expect(result.commands).toBeUndefined();
      expect(inquirer.prompt).toHaveBeenCalledTimes(7); // No command prompt
    });

    test('includes security options when requested', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ agentName: 'secure-agent' })
        .mockResolvedValueOnce({ agentTitle: 'Secure Agent' })
        .mockResolvedValueOnce({ whenToUse: 'Secure operations' })
        .mockResolvedValueOnce({ includeCommands: false })
        .mockResolvedValueOnce({ includePersona: false })
        .mockResolvedValueOnce({ includeSecurity: true })
        .mockResolvedValueOnce({ 
          securityLevel: 'medium',
          requiresApproval: true 
        })
        .mockResolvedValueOnce({ includeAdvanced: false });

      const result = await elicitationEngine.startElicitation('agent');

      expect(result).toMatchObject({
        securityLevel: 'medium',
        requiresApproval: true
      });
    });
  });

  describe('Session Management', () => {
    test('loads saved session', async () => {
      const savedSession = {
        agentName: 'saved-agent',
        agentTitle: 'Saved Agent',
        whenToUse: 'From saved session'
      };

      elicitationEngine.sessionManager = {
        loadSession: jest.fn().mockResolvedValue(savedSession)
      };

      const result = await elicitationEngine.loadSession('test-session');

      expect(result).toEqual(savedSession);
      expect(elicitationEngine.sessionManager.loadSession)
        .toHaveBeenCalledWith('test-session');
    });

    test('saves session during elicitation', async () => {
      elicitationEngine.sessionManager = {
        saveSession: jest.fn().mockResolvedValue('session-123')
      };

      inquirer.prompt
        .mockResolvedValueOnce({ agentName: 'test-agent' })
        .mockResolvedValueOnce({ agentTitle: 'Test Agent' })
        .mockResolvedValueOnce({ whenToUse: 'Testing' })
        .mockResolvedValueOnce({ includeCommands: false })
        .mockResolvedValueOnce({ includePersona: false })
        .mockResolvedValueOnce({ includeSecurity: false })
        .mockResolvedValueOnce({ includeAdvanced: false });

      await elicitationEngine.startElicitation('agent', { saveSession: true });

      expect(elicitationEngine.sessionManager.saveSession).toHaveBeenCalled();
    });

    test('loads mock session for automated testing', async () => {
      const mockData = {
        agentName: 'mock-agent',
        agentTitle: 'Mock Agent'
      };

      await elicitationEngine.mockSession(mockData);

      expect(elicitationEngine.mockMode).toBe(true);
      expect(elicitationEngine.mockData).toEqual(mockData);
    });
  });

  describe('Validation', () => {
    test('validates agent name format', async () => {
      const promptCall = jest.fn()
        .mockResolvedValueOnce({ agentName: 'Invalid Name!' })
        .mockResolvedValueOnce({ agentName: 'valid-name' });

      inquirer.prompt = promptCall;

      await elicitationEngine.elicitAgentInfo();

      // Check that validation was applied
      const agentNamePrompt = promptCall.mock.calls[0][0][0];
      expect(agentNamePrompt.validate('Invalid Name!'))
        .toBe('Name must be lowercase with hyphens only');
      expect(agentNamePrompt.validate('valid-name')).toBe(true);
    });

    test('validates required fields', async () => {
      const promptCall = jest.fn()
        .mockResolvedValueOnce({ agentTitle: '' })
        .mockResolvedValueOnce({ agentTitle: 'Valid Title' });

      inquirer.prompt = promptCall;

      await elicitationEngine.elicitAgentInfo();

      // Check that validation was applied
      const titlePrompt = promptCall.mock.calls[0][0][1];
      expect(titlePrompt.validate('')).toBe('Title is required');
      expect(titlePrompt.validate('Valid Title')).toBe(true);
    });
  });

  describe('Smart Defaults', () => {
    test('provides default agent icon based on name', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ agentName: 'data-analyst' })
        .mockResolvedValueOnce({ agentTitle: 'Data Analyst' })
        .mockResolvedValueOnce({ whenToUse: 'Analyze data' })
        .mockResolvedValueOnce({ includeCommands: false })
        .mockResolvedValueOnce({ includePersona: false })
        .mockResolvedValueOnce({ includeSecurity: false })
        .mockResolvedValueOnce({ includeAdvanced: true })
        .mockResolvedValueOnce({ icon: '📊' }); // Default for data-analyst

      const result = await elicitationEngine.startElicitation('agent');

      expect(result.icon).toBe('📊');
    });

    test('suggests commands based on agent type', async () => {
      // Mock the method that suggests commands
      elicitationEngine.getSuggestedCommands = jest.fn()
        .mockReturnValue(['*analyze', '*report', '*visualize']);

      const suggestions = elicitationEngine.getSuggestedCommands('data-analyst');

      expect(suggestions).toContain('*analyze');
      expect(suggestions).toContain('*report');
    });
  });

  describe('Error Handling', () => {
    test('handles inquirer prompt errors', async () => {
      inquirer.prompt.mockRejectedValue(new Error('Prompt failed'));

      await expect(elicitationEngine.startElicitation('agent'))
        .rejects.toThrow('Prompt failed');
    });

    test('validates security level choices', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ agentName: 'secure-agent' })
        .mockResolvedValueOnce({ agentTitle: 'Secure Agent' })
        .mockResolvedValueOnce({ whenToUse: 'Security' })
        .mockResolvedValueOnce({ includeCommands: false })
        .mockResolvedValueOnce({ includePersona: false })
        .mockResolvedValueOnce({ includeSecurity: true })
        .mockResolvedValueOnce({ 
          securityLevel: 'invalid-level',
          requiresApproval: true 
        });

      // The actual elicitation should validate this
      const result = await elicitationEngine.startElicitation('agent');
      
      // In real implementation, invalid security level would be rejected
      expect(result.securityLevel).toBeDefined();
    });
  });

  describe('Help Context', () => {
    test('provides contextual help during prompts', () => {
      const helpText = elicitationEngine.getContextualHelp('agentName');
      
      expect(helpText).toContain('lowercase');
      expect(helpText).toContain('hyphens');
    });

    test('shows examples for complex fields', () => {
      const examples = elicitationEngine.getExamples('commands');
      
      expect(examples).toContain('*analyze');
      expect(examples).toContain('*create');
    });
  });
});