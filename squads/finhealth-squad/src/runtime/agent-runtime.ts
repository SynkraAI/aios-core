/**
 * Agent Runtime
 * FinHealth Squad - Execution Engine
 *
 * Loads agent definitions and executes tasks using OpenAI
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { config } from 'dotenv';

// Load environment variables
config();

// Types
export interface AgentDefinition {
  name: string;
  role: string;
  capabilities: string[];
  commands: AgentCommand[];
  context?: string;
}

export interface AgentCommand {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface TaskInput {
  taskName: string;
  agentId: string;
  parameters: Record<string, any>;
  context?: Record<string, any>;
}

export interface TaskResult {
  success: boolean;
  output: any;
  errors?: string[];
  metadata?: Record<string, any>;
}

export interface RuntimeConfig {
  squadPath: string;
  openaiApiKey?: string;
  model?: string;
  verbose?: boolean;
}

/**
 * Agent Runtime Class
 * Manages agent loading and task execution
 */
export class AgentRuntime {
  private agents: Map<string, AgentDefinition> = new Map();
  private openai: OpenAI;
  private config: RuntimeConfig;
  private model: string;

  constructor(config: RuntimeConfig) {
    this.config = config;
    this.model = config.model || 'gpt-4o-mini';

    const apiKey = config.openaiApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not provided. Set OPENAI_API_KEY environment variable.');
    }

    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Initialize runtime - load all agents
   */
  async initialize(): Promise<void> {
    const agentsPath = path.join(this.config.squadPath, 'agents');

    if (!fs.existsSync(agentsPath)) {
      throw new Error(`Agents directory not found: ${agentsPath}`);
    }

    const agentFiles = fs.readdirSync(agentsPath).filter(f => f.endsWith('.md'));

    for (const file of agentFiles) {
      const agentId = file.replace('.md', '');
      const agent = await this.loadAgent(path.join(agentsPath, file));
      this.agents.set(agentId, agent);

      if (this.config.verbose) {
        console.log(`[Runtime] Loaded agent: ${agentId}`);
      }
    }

    console.log(`[Runtime] Initialized with ${this.agents.size} agents`);
  }

  /**
   * Load agent definition from markdown file
   */
  private async loadAgent(filePath: string): Promise<AgentDefinition> {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract YAML front matter if present
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let metadata: Record<string, any> = {};

    if (yamlMatch) {
      try {
        metadata = yaml.load(yamlMatch[1]) as Record<string, any>;
      } catch (e) {
        // No valid YAML front matter
      }
    }

    // Parse agent definition from markdown
    const nameMatch = content.match(/^#\s+(.+)/m);
    const roleMatch = content.match(/##\s+Role[:\s]*\n([\s\S]*?)(?=\n##|$)/i);
    const capabilitiesMatch = content.match(/##\s+Capabilities[:\s]*\n([\s\S]*?)(?=\n##|$)/i);
    const commandsMatch = content.match(/##\s+Commands[:\s]*\n([\s\S]*?)(?=\n##|$)/i);

    // Extract capabilities from bullet list
    const capabilities: string[] = [];
    if (capabilitiesMatch) {
      const capLines = capabilitiesMatch[1].match(/[-*]\s+(.+)/g);
      if (capLines) {
        capabilities.push(...capLines.map(l => l.replace(/^[-*]\s+/, '').trim()));
      }
    }

    // Extract commands
    const commands: AgentCommand[] = [];
    if (commandsMatch) {
      const cmdMatches = commandsMatch[1].matchAll(/###\s+`?\*?(\w+[-\w]*)`?\s*\n([\s\S]*?)(?=\n###|$)/g);
      for (const match of cmdMatches) {
        commands.push({
          name: match[1],
          description: match[2].trim().split('\n')[0],
        });
      }
    }

    return {
      name: metadata.name || nameMatch?.[1] || path.basename(filePath, '.md'),
      role: metadata.role || roleMatch?.[1]?.trim() || 'AI Agent',
      capabilities,
      commands,
      context: content,
    };
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): AgentDefinition | undefined {
    // Normalize agent ID (remove @ prefix if present)
    const normalizedId = agentId.replace(/^@/, '');
    return this.agents.get(normalizedId);
  }

  /**
   * List all loaded agents
   */
  listAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Execute a task with specified agent
   */
  async executeTask(input: TaskInput): Promise<TaskResult> {
    const agent = this.getAgent(input.agentId);

    if (!agent) {
      return {
        success: false,
        output: null,
        errors: [`Agent not found: ${input.agentId}`],
      };
    }

    const startTime = Date.now();

    if (this.config.verbose) {
      console.log(`[Runtime] Executing task: ${input.taskName} with agent: ${input.agentId}`);
    }

    try {
      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(agent, input);

      // Build user prompt
      const userPrompt = this.buildUserPrompt(input);

      // Call OpenAI
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        return {
          success: false,
          output: null,
          errors: ['No response from OpenAI'],
        };
      }

      // Parse response
      const result = JSON.parse(content);

      return {
        success: result.success !== false,
        output: result,
        metadata: {
          agent: input.agentId,
          task: input.taskName,
          model: this.model,
          duration: Date.now() - startTime,
          tokensUsed: response.usage?.total_tokens,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        output: null,
        errors: [error.message],
        metadata: {
          agent: input.agentId,
          task: input.taskName,
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Build system prompt for agent
   */
  private buildSystemPrompt(agent: AgentDefinition, input: TaskInput): string {
    let prompt = `You are ${agent.name}, a specialized AI agent in the FinHealth Squad.

## Role
${agent.role}

## Capabilities
${agent.capabilities.map(c => `- ${c}`).join('\n')}

## Instructions
1. You are executing the task: ${input.taskName}
2. Analyze the input data carefully
3. Apply your specialized knowledge
4. Return a JSON response with your analysis and results

## Response Format
Always respond with valid JSON containing:
- success: boolean indicating if the task completed successfully
- data: the main output data
- analysis: your analysis and reasoning
- recommendations: any recommendations or next steps
- warnings: any warnings or issues found
- errors: any errors encountered (empty array if none)
`;

    // Add context if available
    if (input.context) {
      prompt += `\n## Context\n${JSON.stringify(input.context, null, 2)}\n`;
    }

    return prompt;
  }

  /**
   * Build user prompt for task
   */
  private buildUserPrompt(input: TaskInput): string {
    return `Execute task: ${input.taskName}

Input Parameters:
${JSON.stringify(input.parameters, null, 2)}

Please analyze the input and provide your response in JSON format.`;
  }
}

/**
 * Create and initialize agent runtime
 */
export async function createRuntime(config: RuntimeConfig): Promise<AgentRuntime> {
  const runtime = new AgentRuntime(config);
  await runtime.initialize();
  return runtime;
}

export default AgentRuntime;
