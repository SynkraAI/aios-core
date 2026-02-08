const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Load the greeting builder
const GreetingBuilder = require('./.aios-core/development/scripts/greeting-builder.js');

// Load the SM agent definition
const smAgentPath = './.aios-core/development/agents/sm.md';
const smContent = fs.readFileSync(smAgentPath, 'utf-8');

// Extract YAML block from the markdown
const yamlMatch = smContent.match(/```yaml\n([\s\S]*?)\n```/);
if (!yamlMatch) {
  console.error('Could not find YAML block in SM agent definition');
  process.exit(1);
}

const agentDefinition = yaml.load(yamlMatch[1]);

// Create greeting builder instance
const builder = new GreetingBuilder();

// Build greeting - handle async
(async () => {
  try {
    const greeting = await builder.buildGreeting(agentDefinition, []);
    console.log('=== SM Agent Greeting ===\n');
    console.log(greeting);
    console.log('\n=== End Greeting ===');
  } catch (error) {
    console.error('Error building greeting:', error);
    process.exit(1);
  }
})();
