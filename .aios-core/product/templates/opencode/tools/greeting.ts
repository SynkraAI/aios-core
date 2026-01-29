import { tool } from '@opencode-ai/plugin';
import { execSync } from 'child_process';
import path from 'path';

export default tool({
  description: 'Build intelligent greeting using AIOS GreetingBuilder',
  async execute() {
    try {
      const scriptPath = path.join(
        process.cwd(),
        '.aios-core',
        'development',
        'scripts',
        'greeting-builder.js'
      );
      const output = execSync(`node "${scriptPath}"`, { encoding: 'utf8' });
      return output;
    } catch (error) {
      return `Error building greeting: ${error.message}`;
    }
  },
});
