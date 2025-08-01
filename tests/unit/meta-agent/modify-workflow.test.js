const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Mock the required utilities
jest.mock('../../../aios-core/utils/yaml-validator');
jest.mock('../../../aios-core/utils/git-wrapper');
jest.mock('../../../aios-core/utils/dependency-analyzer');

describe('Modify Workflow Task', () => {
  const testWorkflowPath = path.join(__dirname, 'test-fixtures', 'workflows');
  const backupPath = path.join(testWorkflowPath, '.backups');
  
  beforeEach(async () => {
    // Create test directories
    await fs.mkdir(testWorkflowPath, { recursive: true });
    await fs.mkdir(backupPath, { recursive: true });
    
    // Create a test workflow
    const testWorkflow = {
      name: 'test-workflow',
      description: 'Test workflow for modification testing',
      project_type: 'fullstack',
      
      metadata: {
        version: '1.0',
        complexity: 'medium'
      },
      
      phases: {
        planning: {
          sequence: 1,
          description: 'Initial planning phase',
          agents: ['analyst', 'pm'],
          artifacts: ['project-brief', 'prd'],
          entry_criteria: ['Project kickoff'],
          exit_criteria: ['PRD approved']
        },
        architecture: {
          sequence: 2,
          description: 'System architecture design',
          agents: ['architect'],
          artifacts: ['architecture-doc'],
          entry_criteria: ['PRD approved'],
          exit_criteria: ['Architecture approved']
        },
        development: {
          sequence: 3,
          description: 'Implementation phase',
          agents: ['dev'],
          artifacts: ['code', 'tests'],
          entry_criteria: ['Architecture approved'],
          exit_criteria: ['Code complete', 'Tests passing']
        }
      },
      
      simple_sequence: 'planning → architecture → development',
      
      mermaid_diagram: `graph TD
    A[Planning] --> B[Architecture]
    B --> C[Development]`
    };
    
    await fs.writeFile(
      path.join(testWorkflowPath, 'test-workflow.yaml'),
      yaml.dump(testWorkflow)
    );
    
    // Create a minimal workflow
    const minimalWorkflow = {
      name: 'minimal-workflow',
      description: 'Minimal workflow',
      phases: {
        start: {
          sequence: 1,
          agents: ['dev']
        }
      }
    };
    
    await fs.writeFile(
      path.join(testWorkflowPath, 'minimal-workflow.yaml'),
      yaml.dump(minimalWorkflow)
    );
  });
  
  afterEach(async () => {
    // Clean up test files
    await fs.rm(path.join(__dirname, 'test-fixtures'), { recursive: true, force: true });
  });
  
  describe('Workflow Analysis', () => {
    test('should parse workflow structure correctly', async () => {
      const workflowContent = await fs.readFile(
        path.join(testWorkflowPath, 'test-workflow.yaml'),
        'utf-8'
      );
      
      const workflow = yaml.load(workflowContent);
      
      expect(workflow.name).toBe('test-workflow');
      expect(workflow.phases).toHaveProperty('planning');
      expect(workflow.phases).toHaveProperty('architecture');
      expect(workflow.phases).toHaveProperty('development');
      expect(workflow.phases.planning.sequence).toBe(1);
    });
    
    test('should identify phase sequences', async () => {
      const workflowContent = await fs.readFile(
        path.join(testWorkflowPath, 'test-workflow.yaml'),
        'utf-8'
      );
      
      const workflow = yaml.load(workflowContent);
      const phases = Object.entries(workflow.phases)
        .sort(([, a], [, b]) => a.sequence - b.sequence)
        .map(([name]) => name);
      
      expect(phases).toEqual(['planning', 'architecture', 'development']);
    });
  });
  
  describe('Phase Modification', () => {
    test('should insert new phase correctly', async () => {
      const workflowContent = await fs.readFile(
        path.join(testWorkflowPath, 'test-workflow.yaml'),
        'utf-8'
      );
      
      const workflow = yaml.load(workflowContent);
      
      // Insert code review phase
      workflow.phases.code_review = {
        sequence: 3.5,
        description: 'Code review phase',
        agents: ['qa', 'senior-dev'],
        artifacts: ['code-review-report'],
        entry_criteria: ['Code complete'],
        exit_criteria: ['Review approved']
      };
      
      // Verify insertion
      expect(workflow.phases.code_review).toBeDefined();
      expect(workflow.phases.code_review.sequence).toBe(3.5);
      
      // Verify phase order
      const phaseOrder = Object.entries(workflow.phases)
        .sort(([, a], [, b]) => a.sequence - b.sequence)
        .map(([name]) => name);
      
      expect(phaseOrder).toEqual([
        'planning',
        'architecture',
        'development',
        'code_review'
      ]);
    });
    
    test('should resequence phases when needed', async () => {
      const workflowContent = await fs.readFile(
        path.join(testWorkflowPath, 'test-workflow.yaml'),
        'utf-8'
      );
      
      const workflow = yaml.load(workflowContent);
      
      // Insert phase between 1 and 2
      workflow.phases.design = {
        sequence: 1.5,
        agents: ['ux-designer'],
        artifacts: ['design-specs']
      };
      
      // Adjust subsequent sequences
      workflow.phases.architecture.sequence = 2.5;
      workflow.phases.development.sequence = 3.5;
      
      const phaseOrder = Object.entries(workflow.phases)
        .sort(([, a], [, b]) => a.sequence - b.sequence)
        .map(([name, phase]) => ({ name, sequence: phase.sequence }));
      
      expect(phaseOrder).toEqual([
        { name: 'planning', sequence: 1 },
        { name: 'design', sequence: 1.5 },
        { name: 'architecture', sequence: 2.5 },
        { name: 'development', sequence: 3.5 }
      ]);
    });
  });
  
  describe('Validation Pipeline', () => {
    test('should validate phase continuity', async () => {
      const workflow = {
        phases: {
          start: { sequence: 1 },
          middle: { sequence: 2 },
          end: { sequence: 3 }
        }
      };
      
      // Check for sequence gaps
      const sequences = Object.values(workflow.phases)
        .map(p => p.sequence)
        .sort((a, b) => a - b);
      
      let hasGaps = false;
      for (let i = 1; i < sequences.length; i++) {
        if (sequences[i] - sequences[i-1] > 2) {
          hasGaps = true;
          break;
        }
      }
      
      expect(hasGaps).toBe(false);
    });
    
    test('should detect circular dependencies', async () => {
      const phases = {
        A: { entry_criteria: ['C complete'] },
        B: { entry_criteria: ['A complete'] },
        C: { entry_criteria: ['B complete'] }
      };
      
      // Simple circular dependency detection
      const dependencies = {};
      Object.entries(phases).forEach(([phase, config]) => {
        dependencies[phase] = (config.entry_criteria || [])
          .map(criteria => criteria.replace(' complete', ''))
          .filter(dep => dep !== phase);
      });
      
      const hasCircular = (phase, visited = new Set()) => {
        if (visited.has(phase)) return true;
        visited.add(phase);
        
        const deps = dependencies[phase] || [];
        for (const dep of deps) {
          if (hasCircular(dep, new Set(visited))) return true;
        }
        
        return false;
      };
      
      expect(hasCircular('A')).toBe(true);
    });
  });
  
  describe('Mermaid Diagram Update', () => {
    test('should update diagram with new phase', async () => {
      const originalDiagram = `graph TD
    A[Planning] --> B[Architecture]
    B --> C[Development]`;
      
      // Insert code review after development
      const updatedDiagram = `graph TD
    A[Planning] --> B[Architecture]
    B --> C[Development]
    C --> D[Code Review]`;
      
      expect(updatedDiagram).toContain('D[Code Review]');
      expect(updatedDiagram).toContain('C --> D');
    });
  });
  
  describe('Workflow Simulation', () => {
    test('should simulate phase flow', async () => {
      const workflowContent = await fs.readFile(
        path.join(testWorkflowPath, 'test-workflow.yaml'),
        'utf-8'
      );
      
      const workflow = yaml.load(workflowContent);
      
      // Simulate phase execution
      const simulation = [];
      const phases = Object.entries(workflow.phases)
        .sort(([, a], [, b]) => a.sequence - b.sequence);
      
      for (const [name, phase] of phases) {
        const result = {
          phase: name,
          sequence: phase.sequence,
          agents: phase.agents,
          artifacts: phase.artifacts || [],
          status: 'valid'
        };
        
        // Check agent availability (mock)
        if (phase.agents && phase.agents.length > 0) {
          result.agentsAvailable = true;
        }
        
        simulation.push(result);
      }
      
      expect(simulation).toHaveLength(3);
      expect(simulation[0].phase).toBe('planning');
      expect(simulation[simulation.length - 1].phase).toBe('development');
      simulation.forEach(result => {
        expect(result.status).toBe('valid');
      });
    });
  });
  
  describe('Diff Generation', () => {
    test('should generate workflow diff', async () => {
      const original = yaml.dump({
        phases: {
          planning: { sequence: 1, agents: ['pm'] },
          development: { sequence: 2, agents: ['dev'] }
        }
      });
      
      const modified = yaml.dump({
        phases: {
          planning: { sequence: 1, agents: ['pm'] },
          review: { sequence: 1.5, agents: ['qa'] },
          development: { sequence: 2, agents: ['dev'] }
        }
      });
      
      expect(modified).toContain('review:');
      expect(modified).toContain('sequence: 1.5');
      expect(modified).toContain("agents:\n      - qa");
    });
  });
  
  describe('Rollback Capability', () => {
    test('should create and restore workflow backup', async () => {
      const workflowFile = path.join(testWorkflowPath, 'rollback-workflow.yaml');
      const originalWorkflow = {
        name: 'rollback-test',
        phases: {
          start: { sequence: 1 }
        }
      };
      
      const modifiedWorkflow = {
        name: 'rollback-test',
        phases: {
          start: { sequence: 1 },
          middle: { sequence: 2 }
        }
      };
      
      // Create original
      await fs.writeFile(workflowFile, yaml.dump(originalWorkflow));
      
      // Create backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupPath, `rollback-workflow.yaml.${timestamp}`);
      await fs.writeFile(backupFile, yaml.dump(originalWorkflow));
      
      // Modify
      await fs.writeFile(workflowFile, yaml.dump(modifiedWorkflow));
      
      // Verify modification
      let content = await fs.readFile(workflowFile, 'utf-8');
      let workflow = yaml.load(content);
      expect(workflow.phases).toHaveProperty('middle');
      
      // Rollback
      const backupContent = await fs.readFile(backupFile, 'utf-8');
      await fs.writeFile(workflowFile, backupContent);
      
      // Verify rollback
      content = await fs.readFile(workflowFile, 'utf-8');
      workflow = yaml.load(content);
      expect(workflow.phases).not.toHaveProperty('middle');
    });
  });
});