#!/usr/bin/env node

/**
 * Distribution Testing - Package Installation Tests
 * Tests that all AIOS-FullStack packages can be installed and used correctly
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync, spawn } = require('child_process');
const chalk = require('chalk');
const os = require('os');

class DistributionTester {
    constructor() {
        this.testDir = path.join(os.tmpdir(), `aios-test-${Date.now()}`);
        this.packages = [
            '@aios-fullstack/workspace',
            '@aios-fullstack/core',
            '@aios-fullstack/memory',
            '@aios-fullstack/security',
            '@aios-fullstack/performance',
            '@aios-fullstack/telemetry'
        ];
        this.testResults = [];
    }

    log(message, type = 'info') {
        const prefix = {
            info: chalk.blue('ℹ'),
            success: chalk.green('✅'),
            error: chalk.red('❌'),
            warning: chalk.yellow('⚠')
        }[type];
        console.log(`${prefix} ${message}`);
    }

    async setupTestEnvironment() {
        this.log('Setting up test environment');
        
        await fs.ensureDir(this.testDir);
        process.chdir(this.testDir);

        // Create package.json for test project
        const testPackageJson = {
            name: 'aios-distribution-test',
            version: '1.0.0',
            description: 'Test installation of AIOS-FullStack packages',
            main: 'index.js',
            scripts: {
                test: 'node test.js'
            },
            engines: {
                node: '>=20.0.0'
            }
        };

        await fs.writeJson('package.json', testPackageJson, { spaces: 2 });
        this.log(`✅ Test environment created at: ${this.testDir}`, 'success');
    }

    async testLocalInstallation() {
        this.log('Testing local package installation');
        
        const sourceDir = path.resolve(__dirname, '..', '..'); // Go back to project root
        
        // Test workspace package
        try {
            // Pack the workspace package
            const workspaceDir = sourceDir;
            execSync('npm pack', { cwd: workspaceDir });
            
            const tarballFiles = fs.readdirSync(workspaceDir).filter(f => f.endsWith('.tgz'));
            if (tarballFiles.length === 0) {
                throw new Error('No tarball created');
            }
            
            const tarballPath = path.join(workspaceDir, tarballFiles[0]);
            
            // Install from tarball
            this.log('Installing workspace package from tarball');
            execSync(`npm install "${tarballPath}"`, { stdio: 'inherit' });
            
            // Test basic import
            const testCode = `
                const workspace = require('@aios-fullstack/workspace');
                console.log('✅ Workspace package loaded successfully');
                
                if (workspace.AIOS) {
                    const aios = new workspace.AIOS();
                    const health = aios.healthCheck();
                    console.log('✅ Health check passed:', JSON.stringify(health, null, 2));
                } else {
                    throw new Error('AIOS class not found');
                }
            `;
            
            await fs.writeFile('test-workspace.js', testCode);
            execSync('node test-workspace.js', { stdio: 'inherit' });
            
            this.testResults.push({
                package: '@aios-fullstack/workspace',
                test: 'local-installation',
                status: 'passed',
                method: 'tarball'
            });
            
            // Clean up tarball
            await fs.remove(tarballPath);
            
        } catch (error) {
            this.log(`Failed to test workspace installation: ${error.message}`, 'error');
            this.testResults.push({
                package: '@aios-fullstack/workspace',
                test: 'local-installation',
                status: 'failed',
                error: error.message
            });
        }
    }

    async testIndividualPackages() {
        this.log('Testing individual package installations');
        
        const sourceDir = path.resolve(__dirname, '..', '..');
        const packageDirs = {
            '@aios-fullstack/core': 'aios-core',
            '@aios-fullstack/memory': 'memory',
            '@aios-fullstack/security': 'security',
            '@aios-fullstack/performance': 'performance',
            '@aios-fullstack/telemetry': 'telemetry'
        };

        for (const [packageName, dirName] of Object.entries(packageDirs)) {
            try {
                this.log(`Testing ${packageName}`);
                
                const packageDir = path.join(sourceDir, dirName);
                if (!fs.existsSync(packageDir)) {
                    this.log(`Skipping ${packageName} - directory not found`, 'warning');
                    continue;
                }

                // Pack individual package
                execSync('npm pack', { cwd: packageDir });
                
                const tarballFiles = fs.readdirSync(packageDir).filter(f => f.endsWith('.tgz'));
                if (tarballFiles.length === 0) {
                    throw new Error('No tarball created');
                }
                
                const tarballPath = path.join(packageDir, tarballFiles[0]);
                
                // Install from tarball
                execSync(`npm install "${tarballPath}"`, { stdio: 'pipe' });
                
                // Test basic import
                const testCode = `
                    try {
                        const pkg = require('${packageName}');
                        console.log('✅ Package ${packageName} loaded successfully');
                        console.log('Available exports:', Object.keys(pkg));
                    } catch (error) {
                        console.error('❌ Failed to load ${packageName}:', error.message);
                        process.exit(1);
                    }
                `;
                
                await fs.writeFile(`test-${dirName}.js`, testCode);
                execSync(`node test-${dirName}.js`, { stdio: 'inherit' });
                
                this.testResults.push({
                    package: packageName,
                    test: 'individual-installation',
                    status: 'passed',
                    method: 'tarball'
                });
                
                // Clean up tarball
                await fs.remove(tarballPath);
                
            } catch (error) {
                this.log(`Failed to test ${packageName}: ${error.message}`, 'error');
                this.testResults.push({
                    package: packageName,
                    test: 'individual-installation',
                    status: 'failed',
                    error: error.message
                });
            }
        }
    }

    async testIntegrationScenarios() {
        this.log('Testing integration scenarios');
        
        try {
            // Test scenario: Create basic AIOS instance
            const scenarioCode = `
                const { AIOS } = require('@aios-fullstack/workspace');
                
                async function testBasicIntegration() {
                    console.log('🧪 Testing basic AIOS integration');
                    
                    const aios = new AIOS({
                        security: { sanitizeInputs: true },
                        performance: { enableProfiling: false },
                        telemetry: { enabled: false }
                    });
                    
                    console.log('✅ AIOS instance created');
                    
                    // Test health check
                    const health = aios.healthCheck();
                    console.log('✅ Health check result:', JSON.stringify(health, null, 2));
                    
                    // Test initialization
                    await aios.initialize();
                    console.log('✅ AIOS initialized successfully');
                    
                    console.log('🎉 Basic integration test passed!');
                }
                
                testBasicIntegration().catch(error => {
                    console.error('❌ Integration test failed:', error.message);
                    process.exit(1);
                });
            `;
            
            await fs.writeFile('test-integration.js', scenarioCode);
            execSync('node test-integration.js', { stdio: 'inherit' });
            
            this.testResults.push({
                package: 'integration',
                test: 'basic-aios-workflow',
                status: 'passed'
            });
            
        } catch (error) {
            this.log(`Integration test failed: ${error.message}`, 'error');
            this.testResults.push({
                package: 'integration',
                test: 'basic-aios-workflow',
                status: 'failed',
                error: error.message
            });
        }
    }

    async testNodeVersionCompatibility() {
        this.log('Testing Node.js version compatibility');
        
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
        
        if (majorVersion >= 20) {
            this.log(`✅ Node.js ${nodeVersion} is supported`, 'success');
            this.testResults.push({
                package: 'compatibility',
                test: 'node-version',
                status: 'passed',
                version: nodeVersion
            });
        } else {
            this.log(`❌ Node.js ${nodeVersion} is not supported (requires >=20.0.0)`, 'error');
            this.testResults.push({
                package: 'compatibility',
                test: 'node-version',
                status: 'failed',
                version: nodeVersion,
                required: '>=20.0.0'
            });
        }
    }

    async testPlatformCompatibility() {
        this.log('Testing platform compatibility');
        
        const platform = process.platform;
        const arch = process.arch;
        
        this.log(`Testing on ${platform} ${arch}`);
        
        // Test basic file operations
        try {
            await fs.writeFile('platform-test.tmp', 'test');
            await fs.readFile('platform-test.tmp', 'utf8');
            await fs.remove('platform-test.tmp');
            
            this.testResults.push({
                package: 'compatibility',
                test: 'platform-support',
                status: 'passed',
                platform,
                arch
            });
            
        } catch (error) {
            this.testResults.push({
                package: 'compatibility',
                test: 'platform-support',
                status: 'failed',
                platform,
                arch,
                error: error.message
            });
        }
    }

    generateReport() {
        this.log('\n📊 Distribution Test Report');
        
        const passed = this.testResults.filter(r => r.status === 'passed').length;
        const failed = this.testResults.filter(r => r.status === 'failed').length;
        const total = this.testResults.length;
        
        this.log(`\n📈 Summary:`);
        this.log(`   ✅ Passed: ${passed}/${total}`);
        this.log(`   ❌ Failed: ${failed}/${total}`);
        this.log(`   📊 Success Rate: ${((passed/total) * 100).toFixed(1)}%`);
        
        if (failed > 0) {
            this.log(`\n❌ Failed Tests:`);
            this.testResults
                .filter(r => r.status === 'failed')
                .forEach(result => {
                    this.log(`   • ${result.package} - ${result.test}: ${result.error || 'Unknown error'}`);
                });
        }
        
        // Save detailed report
        const reportPath = path.join(this.testDir, 'distribution-test-report.json');
        fs.writeJsonSync(reportPath, {
            summary: { passed, failed, total, successRate: (passed/total) * 100 },
            results: this.testResults,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                testDir: this.testDir,
                timestamp: new Date().toISOString()
            }
        }, { spaces: 2 });
        
        this.log(`\n📝 Detailed report saved to: ${reportPath}`);
        
        return { passed, failed, total, success: failed === 0 };
    }

    async cleanup() {
        this.log('Cleaning up test environment');
        try {
            await fs.remove(this.testDir);
            this.log('✅ Cleanup completed', 'success');
        } catch (error) {
            this.log(`Warning: Cleanup failed: ${error.message}`, 'warning');
        }
    }

    async runAllTests() {
        try {
            await this.setupTestEnvironment();
            await this.testNodeVersionCompatibility();
            await this.testPlatformCompatibility();
            await this.testLocalInstallation();
            await this.testIndividualPackages();
            await this.testIntegrationScenarios();
            
            const report = this.generateReport();
            
            if (report.success) {
                this.log('\n🎉 All distribution tests passed!', 'success');
            } else {
                this.log('\n❌ Some distribution tests failed', 'error');
            }
            
            return report;
            
        } catch (error) {
            this.log(`Distribution testing failed: ${error.message}`, 'error');
            throw error;
        } finally {
            // Don't auto-cleanup so results can be inspected
            this.log(`\n🔍 Test artifacts available at: ${this.testDir}`);
            this.log('Run cleanup manually if needed');
        }
    }
}

// CLI interface
async function main() {
    const tester = new DistributionTester();
    
    try {
        const report = await tester.runAllTests();
        process.exit(report.success ? 0 : 1);
    } catch (error) {
        console.error(chalk.red(`❌ Distribution testing failed: ${error.message}`));
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = DistributionTester;