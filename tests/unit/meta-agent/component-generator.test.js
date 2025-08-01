/**
 * Unit tests for Component Generator
 * @module component-generator.test
 */

const ComponentGenerator = require('../../../aios-core/utils/component-generator');
const TemplateEngine = require('../../../aios-core/utils/template-engine');
const ElicitationEngine = require('../../../aios-core/utils/elicitation-engine');
const SecurityChecker = require('../../../aios-core/utils/security-checker');
const ComponentMetadata = require('../../../aios-core/utils/component-metadata');
const TransactionManager = require('../../../aios-core/utils/transaction-manager');
const fs = require('fs-extra');
const path = require('path');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('../../../aios-core/utils/template-engine');
jest.mock('../../../aios-core/utils/elicitation-engine');
jest.mock('../../../aios-core/utils/security-checker');
jest.mock('../../../aios-core/utils/component-metadata');
jest.mock('../../../aios-core/utils/transaction-manager');
jest.mock('../../../aios-core/utils/component-preview');
jest.mock('../../../aios-core/utils/manifest-preview');

describe('ComponentGenerator', () => {
  let componentGenerator;
  let mockTemplateEngine;
  let mockElicitationEngine;
  let mockSecurityChecker;
  let mockComponentMetadata;
  let mockTransactionManager;

  beforeEach(() => {
    // Create mock instances
    mockTemplateEngine = {
      process: jest.fn().mockReturnValue('Processed template content')
    };
    
    mockElicitationEngine = {
      startElicitation: jest.fn().mockResolvedValue({
        agentName: 'test-agent',
        agentTitle: 'Test Agent',
        whenToUse: 'For testing'
      })
    };
    
    mockSecurityChecker = {
      checkCode: jest.fn().mockResolvedValue({ safe: true })
    };
    
    mockComponentMetadata = {
      recordComponent: jest.fn().mockResolvedValue(true)
    };
    
    mockTransactionManager = {
      beginTransaction: jest.fn().mockResolvedValue('txn-123'),
      recordOperation: jest.fn().mockResolvedValue(true),
      commitTransaction: jest.fn().mockResolvedValue(true),
      rollbackTransaction: jest.fn().mockResolvedValue(true)
    };

    // Set up constructor mocks
    TemplateEngine.mockImplementation(() => mockTemplateEngine);
    ElicitationEngine.mockImplementation(() => mockElicitationEngine);
    SecurityChecker.mockImplementation(() => mockSecurityChecker);
    ComponentMetadata.mockImplementation(() => mockComponentMetadata);
    TransactionManager.mockImplementation(() => mockTransactionManager);

    // Mock fs methods
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue('Template content {{VARIABLE}}');
    fs.ensureDir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();

    componentGenerator = new ComponentGenerator({ rootPath: '/test/root' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateComponent', () => {
    test('generates agent component successfully', async () => {
      const result = await componentGenerator.generateComponent('agent');

      expect(mockElicitationEngine.startElicitation).toHaveBeenCalledWith('agent', {});
      expect(mockTemplateEngine.process).toHaveBeenCalled();
      expect(mockSecurityChecker.checkCode).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(result).toMatchObject({
        success: true,
        type: 'agent',
        name: 'test-agent',
        path: expect.stringContaining('test-agent.md')
      });
    });

    test('generates task component successfully', async () => {
      mockElicitationEngine.startElicitation.mockResolvedValue({
        taskId: 'test-task',
        taskTitle: 'Test Task',
        agentName: 'test-agent'
      });

      const result = await componentGenerator.generateComponent('task');

      expect(result).toMatchObject({
        success: true,
        type: 'task',
        name: 'test-task',
        path: expect.stringContaining('test-task.md')
      });
    });

    test('generates workflow component successfully', async () => {
      mockElicitationEngine.startElicitation.mockResolvedValue({
        workflowId: 'test-workflow',
        workflowName: 'Test Workflow'
      });

      const result = await componentGenerator.generateComponent('workflow');

      expect(result).toMatchObject({
        success: true,
        type: 'workflow',
        name: 'test-workflow',
        path: expect.stringContaining('test-workflow.yaml')
      });
    });

    test('handles invalid component type', async () => {
      await expect(componentGenerator.generateComponent('invalid'))
        .rejects.toThrow('Unknown component type: invalid');
    });
  });

  describe('Security Validation', () => {
    test('blocks unsafe code generation', async () => {
      mockSecurityChecker.checkCode.mockResolvedValue({
        safe: false,
        issues: ['Potential code injection detected']
      });

      await expect(componentGenerator.generateComponent('agent'))
        .rejects.toThrow('Security check failed');
    });

    test('passes security validation for safe content', async () => {
      mockSecurityChecker.checkCode.mockResolvedValue({ safe: true });

      const result = await componentGenerator.generateComponent('agent');

      expect(result.success).toBe(true);
      expect(mockSecurityChecker.checkCode).toHaveBeenCalled();
    });
  });

  describe('Transaction Support', () => {
    test('creates transaction when transactionId not provided', async () => {
      const result = await componentGenerator.generateComponent('agent');

      expect(mockTransactionManager.beginTransaction).toHaveBeenCalled();
      expect(mockTransactionManager.recordOperation).toHaveBeenCalled();
      expect(mockTransactionManager.commitTransaction).toHaveBeenCalledWith('txn-123');
    });

    test('uses existing transaction when provided', async () => {
      const result = await componentGenerator.generateComponent('agent', {
        transactionId: 'existing-txn'
      });

      expect(mockTransactionManager.beginTransaction).not.toHaveBeenCalled();
      expect(mockTransactionManager.recordOperation).toHaveBeenCalledWith(
        'existing-txn',
        expect.any(Object)
      );
      expect(mockTransactionManager.commitTransaction).not.toHaveBeenCalled();
    });

    test('rolls back transaction on failure', async () => {
      fs.writeFile.mockRejectedValue(new Error('Write failed'));

      await expect(componentGenerator.generateComponent('agent'))
        .rejects.toThrow('Write failed');

      expect(mockTransactionManager.rollbackTransaction).toHaveBeenCalledWith('txn-123');
    });
  });

  describe('Preview Functionality', () => {
    test('shows preview when skipPreview is false', async () => {
      const ComponentPreview = require('../../../aios-core/utils/component-preview');
      const mockPreview = {
        previewComponent: jest.fn().mockResolvedValue({ confirmed: true })
      };
      ComponentPreview.mockImplementation(() => mockPreview);

      await componentGenerator.generateComponent('agent', { skipPreview: false });

      expect(mockPreview.previewComponent).toHaveBeenCalled();
    });

    test('skips preview when skipPreview is true', async () => {
      const ComponentPreview = require('../../../aios-core/utils/component-preview');
      const mockPreview = {
        previewComponent: jest.fn()
      };
      ComponentPreview.mockImplementation(() => mockPreview);

      await componentGenerator.generateComponent('agent', { skipPreview: true });

      expect(mockPreview.previewComponent).not.toHaveBeenCalled();
    });

    test('cancels generation when preview is rejected', async () => {
      const ComponentPreview = require('../../../aios-core/utils/component-preview');
      const mockPreview = {
        previewComponent: jest.fn().mockResolvedValue({ confirmed: false })
      };
      ComponentPreview.mockImplementation(() => mockPreview);

      const result = await componentGenerator.generateComponent('agent', { skipPreview: false });

      expect(result).toMatchObject({
        success: false,
        error: 'Component creation cancelled'
      });
    });
  });

  describe('Metadata Recording', () => {
    test('records component metadata after creation', async () => {
      await componentGenerator.generateComponent('agent');

      expect(mockComponentMetadata.recordComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'agent',
          name: 'test-agent',
          path: expect.any(String),
          metadata: expect.objectContaining({
            createdAt: expect.any(String),
            createdBy: expect.any(String)
          })
        })
      );
    });

    test('includes transaction ID in metadata', async () => {
      await componentGenerator.generateComponent('agent', {
        transactionId: 'test-txn'
      });

      expect(mockComponentMetadata.recordComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            transactionId: 'test-txn'
          })
        })
      );
    });
  });

  describe('Template Processing', () => {
    test('loads correct template for component type', async () => {
      await componentGenerator.generateComponent('agent');

      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('agent-template.yaml'),
        'utf8'
      );
    });

    test('processes template with elicitation variables', async () => {
      mockElicitationEngine.startElicitation.mockResolvedValue({
        agentName: 'custom-agent',
        agentTitle: 'Custom Agent',
        commands: ['*test', '*analyze']
      });

      await componentGenerator.generateComponent('agent');

      expect(mockTemplateEngine.process).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          AGENT_NAME: 'custom-agent',
          AGENT_TITLE: 'Custom Agent',
          EACH_COMMANDS: expect.any(Array)
        })
      );
    });
  });

  describe('File Operations', () => {
    test('creates agent file in correct location', async () => {
      await componentGenerator.generateComponent('agent');

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(path.join('agents', 'test-agent.md')),
        expect.any(String),
        'utf8'
      );
    });

    test('creates task file in correct location', async () => {
      mockElicitationEngine.startElicitation.mockResolvedValue({
        taskId: 'custom-task',
        taskTitle: 'Custom Task',
        agentName: 'test-agent'
      });

      await componentGenerator.generateComponent('task');

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(path.join('tasks', 'custom-task.md')),
        expect.any(String),
        'utf8'
      );
    });

    test('ensures directory exists before writing', async () => {
      await componentGenerator.generateComponent('agent');

      expect(fs.ensureDir).toHaveBeenCalledBefore(fs.writeFile);
    });
  });

  describe('Error Handling', () => {
    test('handles template not found error', async () => {
      fs.pathExists.mockResolvedValue(false);

      await expect(componentGenerator.generateComponent('agent'))
        .rejects.toThrow('Template not found');
    });

    test('handles elicitation cancellation', async () => {
      mockElicitationEngine.startElicitation.mockResolvedValue(null);

      const result = await componentGenerator.generateComponent('agent');

      expect(result).toMatchObject({
        success: false,
        error: 'Elicitation cancelled'
      });
    });

    test('handles file write errors with rollback', async () => {
      fs.writeFile.mockRejectedValue(new Error('Permission denied'));

      await expect(componentGenerator.generateComponent('agent'))
        .rejects.toThrow('Permission denied');

      expect(mockTransactionManager.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('Manifest Updates', () => {
    test('updates manifest when skipManifest is false', async () => {
      const ManifestPreview = require('../../../aios-core/utils/manifest-preview');
      const mockManifestPreview = {
        updateManifest: jest.fn().mockResolvedValue(true)
      };
      ManifestPreview.mockImplementation(() => mockManifestPreview);

      await componentGenerator.generateComponent('agent', { skipManifest: false });

      expect(mockManifestPreview.updateManifest).toHaveBeenCalled();
    });

    test('skips manifest update when skipManifest is true', async () => {
      const ManifestPreview = require('../../../aios-core/utils/manifest-preview');
      const mockManifestPreview = {
        updateManifest: jest.fn()
      };
      ManifestPreview.mockImplementation(() => mockManifestPreview);

      await componentGenerator.generateComponent('agent', { skipManifest: true });

      expect(mockManifestPreview.updateManifest).not.toHaveBeenCalled();
    });
  });
});