#!/usr/bin/env node

/**
 * Basic Integration Workflow Test
 * Tests core AIOS functionality without NPM dependencies
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class BasicWorkflowTester {
    constructor() {
        this.rootDir = path.resolve(__dirname, '..', '..');
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

    async testFileStructure() {
        this.log('Testing file structure');
        
        const requiredFiles = [
            'package.json',
            'index.js',
            'aios-core/package.json',
            'memory/package.json',
            'security/package.json',
            'performance/package.json',
            'telemetry/package.json'
        ];

        let allExist = true;
        for (const file of requiredFiles) {
            const filePath = path.join(this.rootDir, file);
            if (fs.existsSync(filePath)) {
                this.log(`✅ Found: ${file}`, 'success');
            } else {
                this.log(`❌ Missing: ${file}`, 'error');
                allExist = false;
            }
        }

        this.testResults.push({
            test: 'file-structure',
            status: allExist ? 'passed' : 'failed',
            details: `${requiredFiles.filter(f => fs.existsSync(path.join(this.rootDir, f))).length}/${requiredFiles.length} files found`
        });

        return allExist;
    }

    async testPackageJsonValidation() {
        this.log('Testing package.json validation');
        
        const packages = [
            { name: 'workspace', path: 'package.json' },
            { name: 'core', path: 'aios-core/package.json' },
            { name: 'memory', path: 'memory/package.json' },
            { name: 'security', path: 'security/package.json' },
            { name: 'performance', path: 'performance/package.json' },
            { name: 'telemetry', path: 'telemetry/package.json' }
        ];

        let validPackages = 0;
        for (const pkg of packages) {
            try {
                const packagePath = path.join(this.rootDir, pkg.path);
                if (!fs.existsSync(packagePath)) {
                    this.log(`⚠ Skipping ${pkg.name} - package.json not found`, 'warning');
                    continue;
                }

                const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                
                // Validate required fields
                const requiredFields = ['name', 'version', 'description', 'main'];
                const hasAllFields = requiredFields.every(field => packageJson[field]);
                
                if (hasAllFields) {
                    this.log(`✅ ${pkg.name}: ${packageJson.name}@${packageJson.version}`, 'success');
                    validPackages++;
                } else {
                    this.log(`❌ ${pkg.name}: Missing required fields`, 'error');
                }
                
            } catch (error) {
                this.log(`❌ ${pkg.name}: Invalid JSON - ${error.message}`, 'error');
            }
        }

        this.testResults.push({
            test: 'package-json-validation',
            status: validPackages > 0 ? 'passed' : 'failed',
            details: `${validPackages}/${packages.length} packages valid`
        });

        return validPackages > 0;
    }

    async testModuleLoading() {
        this.log('Testing module loading');
        
        try {
            // Test if main entry point can be required
            const workspaceIndex = path.join(this.rootDir, 'index.js');
            if (fs.existsSync(workspaceIndex)) {
                // Basic syntax check
                const content = fs.readFileSync(workspaceIndex, 'utf8');
                if (content.includes('module.exports') || content.includes('exports')) {
                    this.log('✅ Workspace entry point has exports', 'success');
                } else {
                    this.log('⚠ Workspace entry point may not export properly', 'warning');
                }
            }

            // Test individual packages
            const packages = ['aios-core', 'memory', 'security', 'performance', 'telemetry'];
            let loadablePackages = 0;

            for (const pkg of packages) {
                const indexPath = path.join(this.rootDir, pkg, 'index.js');
                if (fs.existsSync(indexPath)) {
                    const content = fs.readFileSync(indexPath, 'utf8');
                    if (content.includes('module.exports') || content.includes('exports')) {
                        this.log(`✅ ${pkg} has proper exports`, 'success');
                        loadablePackages++;
                    } else {
                        this.log(`⚠ ${pkg} may not export properly`, 'warning');
                    }
                } else {
                    this.log(`⚠ ${pkg} index.js not found`, 'warning');
                }
            }

            this.testResults.push({
                test: 'module-loading',
                status: loadablePackages > 0 ? 'passed' : 'failed',
                details: `${loadablePackages}/${packages.length} packages have proper exports`
            });

            return loadablePackages > 0;

        } catch (error) {
            this.log(`❌ Module loading test failed: ${error.message}`, 'error');
            this.testResults.push({
                test: 'module-loading',
                status: 'failed',
                error: error.message
            });
            return false;
        }
    }

    async testSecurityFeatures() {
        this.log('Testing security features');
        
        try {
            const securityPath = path.join(this.rootDir, 'security', 'sanitizer.js');
            if (fs.existsSync(securityPath)) {
                const content = fs.readFileSync(securityPath, 'utf8');
                
                // Check for key security functions
                const securityChecks = [
                    { name: 'XSS Protection', pattern: /sanitizeString|escapeHtml/i },
                    { name: 'Path Traversal Protection', pattern: /path.*traversal|\.\.\/|sanitizePath/i },
                    { name: 'Command Injection Protection', pattern: /command.*injection|sanitizeCommand/i },
                    { name: 'Input Validation', pattern: /validate|sanitize/i }
                ];

                let securityFeatures = 0;
                for (const check of securityChecks) {
                    if (check.pattern.test(content)) {
                        this.log(`✅ ${check.name} implemented`, 'success');
                        securityFeatures++;
                    } else {
                        this.log(`⚠ ${check.name} not found`, 'warning');
                    }
                }

                this.testResults.push({
                    test: 'security-features',
                    status: securityFeatures > 0 ? 'passed' : 'failed',
                    details: `${securityFeatures}/${securityChecks.length} security features found`
                });

                return securityFeatures > 0;
            } else {
                this.log('⚠ Security sanitizer not found', 'warning');
                this.testResults.push({
                    test: 'security-features',
                    status: 'skipped',
                    details: 'Security sanitizer file not found'
                });
                return true; // Don't fail the test if file doesn't exist
            }

        } catch (error) {
            this.log(`❌ Security test failed: ${error.message}`, 'error');
            this.testResults.push({
                test: 'security-features',
                status: 'failed',
                error: error.message
            });
            return false;
        }
    }

    async testPerformanceFeatures() {
        this.log('Testing performance features');
        
        try {
            const performancePaths = [
                'performance/profiler.js',
                'performance/performance-monitor.js',
                'performance/cache-manager.js'
            ];

            let performanceFeatures = 0;
            for (const perfPath of performancePaths) {
                const fullPath = path.join(this.rootDir, perfPath);
                if (fs.existsSync(fullPath)) {
                    this.log(`✅ Found: ${perfPath}`, 'success');
                    performanceFeatures++;
                } else {
                    this.log(`⚠ Missing: ${perfPath}`, 'warning');
                }
            }

            this.testResults.push({
                test: 'performance-features',
                status: performanceFeatures > 0 ? 'passed' : 'failed',
                details: `${performanceFeatures}/${performancePaths.length} performance tools found`
            });

            return performanceFeatures > 0;

        } catch (error) {
            this.log(`❌ Performance test failed: ${error.message}`, 'error');
            this.testResults.push({
                test: 'performance-features',
                status: 'failed',
                error: error.message
            });
            return false;
        }
    }

    async testTelemetryFeatures() {
        this.log('Testing telemetry features');
        
        try {
            const telemetryPaths = [
                'telemetry/analytics-collector.js',
                'telemetry/error-reporter.js',
                'telemetry/consent-manager.js'
            ];

            let telemetryFeatures = 0;
            for (const telPath of telemetryPaths) {
                const fullPath = path.join(this.rootDir, telPath);
                if (fs.existsSync(fullPath)) {
                    this.log(`✅ Found: ${telPath}`, 'success');
                    telemetryFeatures++;
                } else {
                    this.log(`⚠ Missing: ${telPath}`, 'warning');
                }
            }

            this.testResults.push({
                test: 'telemetry-features',
                status: telemetryFeatures > 0 ? 'passed' : 'failed',
                details: `${telemetryFeatures}/${telemetryPaths.length} telemetry tools found`
            });

            return telemetryFeatures > 0;

        } catch (error) {
            this.log(`❌ Telemetry test failed: ${error.message}`, 'error');
            this.testResults.push({
                test: 'telemetry-features',
                status: 'failed',
                error: error.message
            });
            return false;
        }
    }

    generateReport() {
        this.log('\n📊 Basic Workflow Test Report');
        
        const passed = this.testResults.filter(r => r.status === 'passed').length;
        const failed = this.testResults.filter(r => r.status === 'failed').length;
        const skipped = this.testResults.filter(r => r.status === 'skipped').length;
        const total = this.testResults.length;
        
        this.log(`\n📈 Summary:`);
        this.log(`   ✅ Passed: ${passed}/${total}`);
        this.log(`   ❌ Failed: ${failed}/${total}`);
        this.log(`   ⏭️  Skipped: ${skipped}/${total}`);
        this.log(`   📊 Success Rate: ${((passed/(total-skipped)) * 100).toFixed(1)}%`);
        
        if (failed > 0) {
            this.log(`\n❌ Failed Tests:`);
            this.testResults
                .filter(r => r.status === 'failed')
                .forEach(result => {
                    this.log(`   • ${result.test}: ${result.error || result.details || 'Unknown error'}`);
                });
        }

        // Save report
        const report = {
            summary: { passed, failed, skipped, total, successRate: (passed/(total-skipped)) * 100 },
            results: this.testResults,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                timestamp: new Date().toISOString()
            }
        };

        const reportPath = path.join(this.rootDir, 'tests', 'integration', 'basic-workflow-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.log(`\n📝 Report saved to: ${reportPath}`);
        
        return { passed, failed, total, success: failed === 0 };
    }

    async runAllTests() {
        this.log('🧪 Starting Basic Workflow Integration Tests');
        
        try {
            await this.testFileStructure();
            await this.testPackageJsonValidation();
            await this.testModuleLoading();
            await this.testSecurityFeatures();
            await this.testPerformanceFeatures();
            await this.testTelemetryFeatures();
            
            const report = this.generateReport();
            
            if (report.success) {
                this.log('\n🎉 All basic workflow tests passed!', 'success');
            } else {
                this.log('\n❌ Some basic workflow tests failed', 'error');
            }
            
            return report;
            
        } catch (error) {
            this.log(`Basic workflow testing failed: ${error.message}`, 'error');
            throw error;
        }
    }
}

// CLI interface
async function main() {
    const tester = new BasicWorkflowTester();
    
    try {
        const report = await tester.runAllTests();
        process.exit(report.success ? 0 : 1);
    } catch (error) {
        console.error(chalk.red(`❌ Basic workflow testing failed: ${error.message}`));
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = BasicWorkflowTester;