#!/usr/bin/env node

/**
 * Obsidian App Filler Skill
 *
 * Automatically fills Obsidian app notes based on PRD content
 *
 * @version 1.0.0
 * @author AIOS Core
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI colors for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

class ObsidianAppFiller {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Ask user for input
   */
  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Log with color
   */
  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  /**
   * Extract PRD from markdown content
   */
  extractPRD(content) {
    // Find content between the PRD markers
    const prdRegex = /# PRD DO APP\n\(Colocar aqui.*?\)\n```+\n([\s\S]*?)\n```+/;
    const match = content.match(prdRegex);

    if (!match) {
      throw new Error('PRD não encontrado no formato esperado');
    }

    return match[1].trim();
  }

  /**
   * Extract YAML frontmatter
   */
  extractYAML(content) {
    const yamlRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(yamlRegex);

    if (!match) {
      throw new Error('YAML frontmatter não encontrado');
    }

    return match[1];
  }

  /**
   * Parse YAML to object
   */
  parseYAML(yamlString) {
    const lines = yamlString.split('\n');
    const result = {};
    let currentKey = null;

    for (const line of lines) {
      if (line.trim().startsWith('-')) {
        // Array item
        if (currentKey && Array.isArray(result[currentKey])) {
          result[currentKey].push(line.trim().substring(1).trim());
        }
      } else if (line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        currentKey = key.trim();

        if (value === '') {
          // Check if next line is array
          result[currentKey] = [];
        } else {
          result[currentKey] = value;
        }
      }
    }

    return result;
  }

  /**
   * Generate YAML from object
   */
  generateYAML(obj) {
    let yaml = '---\n';

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        yaml += `${key}:\n`;
        for (const item of value) {
          yaml += `  - ${item}\n`;
        }
      } else {
        yaml += `${key}: ${value}\n`;
      }
    }

    yaml += '---';
    return yaml;
  }

  /**
   * Validate file structure
   */
  validateStructure(content) {
    const checks = [
      { regex: /^---/, message: 'YAML frontmatter' },
      { regex: /# PRD DO APP/, message: 'Seção PRD' },
      { regex: /👇 Desta linha para baixo/, message: 'Marcador de seção IA' },
      { regex: /## 💡 Informações sobre o App/, message: 'Seção de informações' },
    ];

    for (const check of checks) {
      if (!check.regex.test(content)) {
        throw new Error(`Estrutura inválida: ${check.message} não encontrado`);
      }
    }

    return true;
  }

  /**
   * Create backup of file
   */
  createBackup(filePath) {
    const backupPath = `${filePath}.backup-${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }

  /**
   * Main execution
   */
  async run() {
    try {
      this.log('\n📝 Obsidian App Filler v1.0.0\n', 'cyan');

      // Ask for file path
      const filePath = await this.prompt('📂 Caminho do arquivo .md: ');

      if (!filePath) {
        this.log('❌ Caminho não fornecido', 'red');
        this.rl.close();
        return;
      }

      // Expand ~ to home directory
      const expandedPath = filePath.replace(/^~/, process.env.HOME);

      // Check if file exists
      if (!fs.existsSync(expandedPath)) {
        this.log(`❌ Arquivo não encontrado: ${expandedPath}`, 'red');
        this.rl.close();
        return;
      }

      this.log('✓ Arquivo encontrado', 'green');

      // Read file
      const content = fs.readFileSync(expandedPath, 'utf-8');

      // Validate structure
      this.validateStructure(content);
      this.log('✓ Estrutura validada', 'green');

      // Extract PRD
      const prd = this.extractPRD(content);
      const wordCount = prd.split(/\s+/).length;
      this.log(`✓ PRD extraído (${wordCount} palavras)`, 'green');

      // Show PRD preview
      this.log('\n📄 Preview do PRD:', 'blue');
      this.log(prd.substring(0, 200) + '...', 'gray');
      this.log('');

      // Ask for confirmation
      const confirm = await this.prompt('Deseja prosseguir com o preenchimento? (s/n): ');

      if (confirm.toLowerCase() !== 's') {
        this.log('❌ Operação cancelada pelo usuário', 'yellow');
        this.rl.close();
        return;
      }

      // Create backup
      const backupPath = this.createBackup(expandedPath);
      this.log(`✓ Backup criado: ${path.basename(backupPath)}`, 'green');

      // Store paths for Claude to use
      const taskData = {
        filePath: expandedPath,
        backupPath,
        prd,
        content,
        timestamp: new Date().toISOString()
      };

      // Save task data to temp file for Claude to read
      const tempPath = path.join(process.cwd(), '.aios', 'tmp', 'app-filler-task.json');
      fs.mkdirSync(path.dirname(tempPath), { recursive: true });
      fs.writeFileSync(tempPath, JSON.stringify(taskData, null, 2));

      this.log('\n✅ Dados preparados para processamento', 'green');
      this.log(`📍 Task data: ${tempPath}`, 'gray');
      this.log('\n🤖 Agora o Claude irá processar o PRD e preencher o arquivo...', 'cyan');
      this.log('📋 PRD extraído e pronto para análise\n', 'blue');

      this.rl.close();

      // Return task data for Claude to process
      return taskData;

    } catch (error) {
      this.log(`\n❌ Erro: ${error.message}`, 'red');
      this.rl.close();
      throw error;
    }
  }
}

// Execute if called directly
if (require.main === module) {
  const filler = new ObsidianAppFiller();
  filler.run().catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = ObsidianAppFiller;
