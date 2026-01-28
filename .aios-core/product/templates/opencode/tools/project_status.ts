import { tool } from '@opencode-ai/plugin';
import { execSync } from 'child_process';
import path from 'path';

export default tool({
  description: 'Load current project status and active stories',
  async execute() {
    try {
      const scriptPath = path.join(
        process.cwd(),
        '.aios-core',
        'infrastructure',
        'scripts',
        'project-status-loader.js'
      );
      const output = execSync(`node "${scriptPath}"`, { encoding: 'utf8' });
      return output;
    } catch (error) {
      return `Error loading project status: ${error.message}`;
    }
  },
});
