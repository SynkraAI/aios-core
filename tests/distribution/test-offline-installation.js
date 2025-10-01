#!/usr/bin/env node

/**
 * AIOS-FULLSTACK Offline Installation Testing
 * Verifies that the framework can be installed without internet access
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const tar = require('tar');
const crypto = require('crypto');

class OfflineInstallationTester {
  constructor() {
    this.testDir = path.join(__dirname, '..', '..', 'test-offline');
    this.bundleDir = path.join(__dirname, '..', '..', 'offline-bundle');
    this.results = {
      bundleCreation: null,
      offlineInstall: null,
      verification: null,
      errors: []
    };
  }

  async runTests() {
    console.log(chalk.blue('\n📦 AIOS-FULLSTACK Offline Installation Testing\n'));
    
    try {
      // Step 1: Create offline bundle
      console.log(chalk.yellow('Step 1: Creating offline installation bundle...'));
      await this.createOfflineBundle();
      
      // Step 2: Simulate offline environment
      console.log(chalk.yellow('\nStep 2: Simulating offline installation...'));
      await this.testOfflineInstallation();
      
      // Step 3: Verify installation
      console.log(chalk.yellow('\nStep 3: Verifying offline installation...'));
      await this.verifyInstallation();
      
      // Step 4: Test functionality
      console.log(chalk.yellow('\nStep 4: Testing offline functionality...'));
      await this.testOfflineFunctionality();
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error(chalk.red('Test failed:'), error.message);
      this.results.errors.push(error.message);
    } finally {
      // Cleanup
      await this.cleanup();
    }
  }

  async createOfflineBundle() {
    const startTime = Date.now();
    
    try {
      await fs.ensureDir(this.bundleDir);
      
      // 1. Create package manifest
      const manifest = {
        name: 'aios-fullstack-offline',
        version: '4.4.0',
        created: new Date().toISOString(),
        platform: process.platform,
        nodeVersion: process.version,
        contents: []
      };
      
      // 2. Copy main package files
      console.log('  Copying framework files...');
      const filesToBundle = [
        'package.json',
        'package-lock.json',
        'bin',
        'install',
        'aios-core',
        'memory',
        'security',
        'performance',
        'telemetry',
        'tools',
        'docs',
        'scripts',
        '.npmignore'
      ];
      
      for (const file of filesToBundle) {
        const src = path.join(__dirname, '..', '..', file);
        const dest = path.join(this.bundleDir, 'framework', file);
        
        if (await fs.pathExists(src)) {
          await fs.copy(src, dest, {
            filter: (src) => {
              // Exclude node_modules and test files
              return !src.includes('node_modules') && 
                     !src.includes('.git') &&
                     !src.includes('test-');
            }
          });
          manifest.contents.push(file);
        }
      }
      
      // 3. Bundle dependencies
      console.log('  Bundling dependencies...');
      await this.bundleDependencies(manifest);
      
      // 4. Create installation script
      console.log('  Creating offline installer...');
      await this.createOfflineInstaller();
      
      // 5. Create checksum
      const checksum = await this.createChecksum();
      manifest.checksum = checksum;
      
      // 6. Save manifest
      await fs.writeJson(
        path.join(this.bundleDir, 'manifest.json'),
        manifest,
        { spaces: 2 }
      );
      
      // 7. Create archive
      console.log('  Creating archive...');
      await this.createArchive();
      
      this.results.bundleCreation = {
        success: true,
        duration: Date.now() - startTime,
        size: await this.getBundleSize(),
        files: manifest.contents.length
      };
      
      console.log(chalk.green('✅ Offline bundle created successfully'));
      
    } catch (error) {
      this.results.bundleCreation = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  async bundleDependencies(manifest) {
    const depsDir = path.join(this.bundleDir, 'dependencies');
    await fs.ensureDir(depsDir);
    
    // Read package.json to get dependencies
    const pkg = await fs.readJson(path.join(__dirname, '..', '..', 'package.json'));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };
    
    // Critical dependencies that must be bundled
    const criticalDeps = [
      'chalk',
      'inquirer',
      'commander',
      'fs-extra',
      'semver',
      'js-yaml',
      'ora',
      'figlet'
    ];
    
    // Bundle critical dependencies
    for (const dep of criticalDeps) {
      if (allDeps[dep]) {
        console.log(`    Bundling ${dep}...`);
        
        // Create npm pack command to bundle the dependency
        try {
          const packResult = execSync(`npm pack ${dep}@${allDeps[dep]}`, {
            cwd: depsDir,
            encoding: 'utf8'
          }).trim();
          
          manifest.contents.push(`dependency: ${dep}`);
        } catch (error) {
          console.log(chalk.yellow(`    Warning: Could not bundle ${dep}`));
        }
      }
    }
    
    // Create package-lock for offline resolution
    const offlineLock = {
      name: 'aios-fullstack-offline',
      version: '4.4.0',
      lockfileVersion: 2,
      requires: true,
      packages: {},
      dependencies: {}
    };
    
    await fs.writeJson(
      path.join(this.bundleDir, 'offline-lock.json'),
      offlineLock,
      { spaces: 2 }
    );
  }

  async createOfflineInstaller() {
    const installerScript = `#!/usr/bin/env node

/**
 * AIOS-FULLSTACK Offline Installer
 * Installs the framework without internet access
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\\n🚀 AIOS-FULLSTACK Offline Installer\\n');

const targetDir = process.argv[2] || 'aios-project';
const bundleDir = __dirname;

try {
  // 1. Create project directory
  console.log('Creating project directory...');
  fs.mkdirSync(targetDir, { recursive: true });
  
  // 2. Copy framework files
  console.log('Copying framework files...');
  const frameworkSrc = path.join(bundleDir, 'framework');
  copyDirectory(frameworkSrc, targetDir);
  
  // 3. Install bundled dependencies
  console.log('Installing dependencies...');
  const depsDir = path.join(bundleDir, 'dependencies');
  if (fs.existsSync(depsDir)) {
    const deps = fs.readdirSync(depsDir).filter(f => f.endsWith('.tgz'));
    for (const dep of deps) {
      console.log(\`  Installing \${dep}...\`);
      execSync(\`npm install "\${path.join(depsDir, dep)}" --offline --prefer-offline\`, {
        cwd: targetDir,
        stdio: 'inherit'
      });
    }
  }
  
  // 4. Run post-install setup
  console.log('Running post-install setup...');
  const postInstall = path.join(targetDir, 'scripts', 'postinstall.js');
  if (fs.existsSync(postInstall)) {
    execSync(\`node "\${postInstall}"\`, {
      cwd: targetDir,
      stdio: 'inherit'
    });
  }
  
  console.log('\\n✅ AIOS-FULLSTACK installed successfully!');
  console.log(\`\\nNext steps:\`);
  console.log(\`  cd \${targetDir}\`);
  console.log(\`  npm run setup\`);
  
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}

function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}`;

    await fs.writeFile(
      path.join(this.bundleDir, 'install-offline.js'),
      installerScript
    );
    
    await fs.chmod(path.join(this.bundleDir, 'install-offline.js'), '755');
  }

  async createChecksum() {
    const files = await this.getAllFiles(this.bundleDir);
    const hash = crypto.createHash('sha256');
    
    for (const file of files) {
      const content = await fs.readFile(file);
      hash.update(content);
    }
    
    return hash.digest('hex');
  }

  async getAllFiles(dir, files = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await this.getAllFiles(fullPath, files);
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async createArchive() {
    const archivePath = path.join(__dirname, '..', '..', 'aios-fullstack-offline.tar.gz');
    
    await tar.create(
      {
        gzip: true,
        file: archivePath,
        cwd: this.bundleDir
      },
      ['.']
    );
    
    const stats = await fs.stat(archivePath);
    console.log(`  Archive size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }

  async getBundleSize() {
    const files = await this.getAllFiles(this.bundleDir);
    let totalSize = 0;
    
    for (const file of files) {
      const stats = await fs.stat(file);
      totalSize += stats.size;
    }
    
    return totalSize;
  }

  async testOfflineInstallation() {
    const startTime = Date.now();
    
    try {
      await fs.ensureDir(this.testDir);
      
      // Simulate offline environment
      console.log('  Setting up offline environment...');
      const testProjectDir = path.join(this.testDir, 'test-project');
      
      // Run offline installer
      console.log('  Running offline installer...');
      execSync(`node "${path.join(this.bundleDir, 'install-offline.js')}" "${testProjectDir}"`, {
        stdio: 'inherit',
        env: {
          ...process.env,
          npm_config_offline: 'true',
          npm_config_prefer_offline: 'true'
        }
      });
      
      this.results.offlineInstall = {
        success: true,
        duration: Date.now() - startTime,
        projectDir: testProjectDir
      };
      
      console.log(chalk.green('✅ Offline installation completed'));
      
    } catch (error) {
      this.results.offlineInstall = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  async verifyInstallation() {
    const startTime = Date.now();
    const issues = [];
    
    try {
      const projectDir = this.results.offlineInstall.projectDir;
      
      // Check directory structure
      console.log('  Verifying directory structure...');
      const expectedDirs = [
        'aios-core',
        'bin',
        'install',
        'tools',
        'docs'
      ];
      
      for (const dir of expectedDirs) {
        if (!await fs.pathExists(path.join(projectDir, dir))) {
          issues.push(`Missing directory: ${dir}`);
        }
      }
      
      // Check critical files
      console.log('  Verifying critical files...');
      const criticalFiles = [
        'package.json',
        'bin/aios-fullstack.js',
        'install/wizard.js'
      ];
      
      for (const file of criticalFiles) {
        if (!await fs.pathExists(path.join(projectDir, file))) {
          issues.push(`Missing file: ${file}`);
        }
      }
      
      // Verify package.json
      console.log('  Verifying package configuration...');
      const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
      if (pkg.name !== 'aios-fullstack') {
        issues.push('Invalid package name');
      }
      
      this.results.verification = {
        success: issues.length === 0,
        duration: Date.now() - startTime,
        issues
      };
      
      if (issues.length > 0) {
        console.log(chalk.yellow('⚠️  Verification found issues:'));
        issues.forEach(issue => console.log(`    - ${issue}`));
      } else {
        console.log(chalk.green('✅ Installation verified successfully'));
      }
      
    } catch (error) {
      this.results.verification = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  async testOfflineFunctionality() {
    const startTime = Date.now();
    const projectDir = this.results.offlineInstall.projectDir;
    
    try {
      console.log('  Testing basic commands...');
      
      // Test help command
      const helpOutput = execSync('node bin/aios-fullstack.js --help', {
        cwd: projectDir,
        encoding: 'utf8'
      });
      
      if (!helpOutput.includes('AIOS-FULLSTACK')) {
        throw new Error('Help command failed');
      }
      
      // Test info command
      const infoOutput = execSync('node bin/aios-fullstack.js info', {
        cwd: projectDir,
        encoding: 'utf8'
      });
      
      if (!infoOutput.includes('version')) {
        throw new Error('Info command failed');
      }
      
      console.log(chalk.green('✅ Offline functionality verified'));
      
    } catch (error) {
      console.log(chalk.red('❌ Functionality test failed:'), error.message);
      this.results.errors.push(`Functionality: ${error.message}`);
    }
  }

  printResults() {
    console.log(chalk.blue('\n📊 Offline Installation Test Results\n'));
    
    // Bundle creation
    if (this.results.bundleCreation) {
      const bc = this.results.bundleCreation;
      console.log('Bundle Creation:');
      console.log(`  Status: ${bc.success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')}`);
      if (bc.success) {
        console.log(`  Duration: ${bc.duration}ms`);
        console.log(`  Size: ${(bc.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Files: ${bc.files}`);
      } else {
        console.log(`  Error: ${bc.error}`);
      }
    }
    
    // Offline installation
    if (this.results.offlineInstall) {
      const oi = this.results.offlineInstall;
      console.log('\nOffline Installation:');
      console.log(`  Status: ${oi.success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')}`);
      if (oi.success) {
        console.log(`  Duration: ${oi.duration}ms`);
      } else {
        console.log(`  Error: ${oi.error}`);
      }
    }
    
    // Verification
    if (this.results.verification) {
      const v = this.results.verification;
      console.log('\nInstallation Verification:');
      console.log(`  Status: ${v.success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')}`);
      if (v.issues && v.issues.length > 0) {
        console.log('  Issues:');
        v.issues.forEach(issue => console.log(`    - ${issue}`));
      }
    }
    
    // Overall status
    const allPassed = this.results.bundleCreation?.success && 
                     this.results.offlineInstall?.success && 
                     this.results.verification?.success &&
                     this.results.errors.length === 0;
    
    console.log('\n' + '─'.repeat(50));
    console.log(`Overall Result: ${allPassed ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')}`);
    
    if (this.results.errors.length > 0) {
      console.log('\nErrors encountered:');
      this.results.errors.forEach(err => console.log(`  - ${err}`));
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (allPassed) {
      console.log('- Offline installation is working correctly');
      console.log('- Consider reducing bundle size for faster downloads');
      console.log('- Test on different platforms for compatibility');
    } else {
      console.log('- Fix missing dependencies in offline bundle');
      console.log('- Ensure all critical files are included');
      console.log('- Test installer script in isolated environment');
    }
  }

  async cleanup() {
    try {
      await fs.remove(this.testDir);
      await fs.remove(this.bundleDir);
      await fs.remove(path.join(__dirname, '..', '..', 'aios-fullstack-offline.tar.gz'));
      console.log(chalk.gray('\nTest directories cleaned up'));
    } catch (error) {
      console.log(chalk.yellow('\nCould not clean up all test files'));
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new OfflineInstallationTester();
  tester.runTests().catch(console.error);
}

module.exports = OfflineInstallationTester;