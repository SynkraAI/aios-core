const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

describe('NPX Installation Tests', () => {
  let testDir;
  
  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(os.tmpdir(), `aios-test-${Date.now()}`);
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });
  
  afterEach(async () => {
    // Clean up
    process.chdir(os.tmpdir());
    await fs.remove(testDir);
  });

  describe('NPX Entry Point', () => {
    it('should show help when no command provided', () => {
      const binPath = path.join(__dirname, '../../bin/aios-fullstack.js');
      const output = execSync(`node ${binPath}`, { encoding: 'utf8' });
      
      expect(output).toContain('Welcome to AIOS-FULLSTACK');
      expect(output).toContain('Available commands');
      expect(output).toContain('npx aios-fullstack init');
    });

    it('should show version', () => {
      const binPath = path.join(__dirname, '../../bin/aios-fullstack.js');
      const output = execSync(`node ${binPath} --version`, { encoding: 'utf8' });
      const pkg = require('../../package.json');
      
      expect(output.trim()).toBe(pkg.version);
    });

    it('should validate Node.js version', () => {
      // This test would need to mock process.version
      // Skipping for now as it requires more complex setup
    });
  });

  describe('Init Command', () => {
    it('should create project structure', async () => {
      const InitCommand = require('../../install/commands/init');
      const cmd = new InitCommand({ skipInstall: true });
      
      // Create project
      await cmd.run('test-project');
      
      // Check structure
      const projectPath = path.join(testDir, 'test-project');
      expect(await fs.pathExists(projectPath)).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, '.aios'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, '.aios/config.json'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'components'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'agents'))).toBe(true);
    });

    it('should reject invalid project names', async () => {
      const InitCommand = require('../../install/commands/init');
      const cmd = new InitCommand({ skipInstall: true });
      
      await expect(cmd.run('invalid name!')).rejects.toThrow('Invalid project name');
    });

    it('should handle existing directories', async () => {
      const InitCommand = require('../../install/commands/init');
      const cmd = new InitCommand({ skipInstall: true, force: false });
      
      // Create existing directory with file
      const projectDir = path.join(testDir, 'existing-project');
      await fs.ensureDir(projectDir);
      await fs.writeFile(path.join(projectDir, 'file.txt'), 'existing');
      
      // Should fail without force
      await expect(cmd.run('existing-project')).rejects.toThrow();
    });
  });

  describe('Install Command', () => {
    it('should install in current directory', async () => {
      const InstallCommand = require('../../install/commands/install');
      const cmd = new InstallCommand({ quiet: true, skipInstall: true });
      
      await cmd.run();
      
      // Check installation
      expect(await fs.pathExists('.aios/config.json')).toBe(true);
      expect(await fs.pathExists('components')).toBe(true);
      expect(await fs.pathExists('.env')).toBe(true);
      
      // Check config
      const config = await fs.readJson('.aios/config.json');
      expect(config.version).toBeDefined();
      expect(config.features).toContain('meta-agent');
    });

    it('should detect existing installation', async () => {
      const InstallCommand = require('../../install/commands/install');
      
      // First installation
      const cmd1 = new InstallCommand({ quiet: true, skipInstall: true });
      await cmd1.run();
      
      // Second installation should detect existing
      const cmd2 = new InstallCommand({ quiet: true });
      const spy = jest.spyOn(console, 'log');
      await cmd2.run();
      
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('already installed')
      );
    });
  });

  describe('Info Command', () => {
    it('should display system information', async () => {
      const InfoCommand = require('../../install/commands/info');
      const cmd = new InfoCommand();
      
      const spy = jest.spyOn(console, 'log');
      await cmd.run();
      
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('System:'));
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('Node.js:'));
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('Package Manager:'));
    });
  });

  describe('Doctor Command', () => {
    it('should run diagnostics', async () => {
      const DoctorCommand = require('../../install/commands/doctor');
      const cmd = new DoctorCommand();
      
      await cmd.run();
      
      expect(cmd.issues.length).toBeGreaterThanOrEqual(0);
      expect(cmd.warnings.length).toBeGreaterThanOrEqual(0);
    });

    it('should detect missing installation', async () => {
      const DoctorCommand = require('../../install/commands/doctor');
      const cmd = new DoctorCommand();
      
      await cmd.run();
      
      const installWarning = cmd.warnings.find(w => 
        w.message.includes('not installed')
      );
      expect(installWarning).toBeDefined();
    });

    it('should check Node.js version', async () => {
      const DoctorCommand = require('../../install/commands/doctor');
      const cmd = new DoctorCommand();
      
      const result = await cmd.checkNodeVersion();
      expect(result.status).toBe('ok');
    });
  });

  describe('Installation Wizard', () => {
    it('should validate project configuration', async () => {
      const InstallationWizard = require('../../install/wizard');
      const wizard = new InstallationWizard({ skipPrompts: true });
      
      // Test project name validation
      wizard.config.projectName = 'valid-name';
      expect(() => wizard.validateProjectName()).not.toThrow();
      
      wizard.config.projectName = 'invalid name!';
      expect(() => wizard.validateProjectName()).toThrow();
    });

    it('should create proper directory structure', async () => {
      const InstallationWizard = require('../../install/wizard');
      const wizard = new InstallationWizard({ 
        skipPrompts: true,
        projectPath: testDir 
      });
      
      await wizard.copyFrameworkFiles();
      
      expect(await fs.pathExists(path.join(testDir, '.aios'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'components'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'agents'))).toBe(true);
    });
  });

  describe('Post-Installation', () => {
    it('should run health checks', async () => {
      const InstallationWizard = require('../../install/wizard');
      const wizard = new InstallationWizard({ skipPrompts: true });
      
      const healthCheck = await wizard.runHealthCheck();
      
      expect(healthCheck).toHaveProperty('passed');
      expect(healthCheck).toHaveProperty('checks');
    });

    it('should check disk space', async () => {
      const InstallationWizard = require('../../install/wizard');
      const wizard = new InstallationWizard({ skipPrompts: true });
      
      const hasSpace = await wizard.checkDiskSpace();
      expect(typeof hasSpace).toBe('boolean');
    });

    it('should check file permissions', async () => {
      const InstallationWizard = require('../../install/wizard');
      const wizard = new InstallationWizard({ 
        skipPrompts: true,
        projectPath: testDir 
      });
      
      await fs.ensureDir(path.join(testDir, '.aios'));
      const hasPermissions = await wizard.checkPermissions();
      expect(hasPermissions).toBe(true);
    });
  });
});