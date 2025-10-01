#!/usr/bin/env node

/**
 * Performance Benchmark Suite for AIOS-FullStack
 * Comprehensive performance testing across all components
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const chalk = require('chalk');
const os = require('os');

class PerformanceBenchmarks {
    constructor() {
        this.rootDir = path.resolve(__dirname, '..', '..');
        this.results = [];
        this.systemInfo = {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            cpuCount: os.cpus().length,
            totalMemory: os.totalmem(),
            freeMemory: os.freemem()
        };
    }

    log(message, type = 'info') {
        const prefix = {
            info: chalk.blue('ℹ'),
            success: chalk.green('✅'),
            error: chalk.red('❌'),
            warning: chalk.yellow('⚠'),
            benchmark: chalk.magenta('📊')
        }[type];
        console.log(`${prefix} ${message}`);
    }

    async measurePerformance(name, fn, iterations = 1000) {
        // Warm up
        for (let i = 0; i < Math.min(100, iterations / 10); i++) {
            await fn();
        }

        // Collect garbage before measuring
        if (global.gc) {
            global.gc();
        }

        const times = [];
        const startMemory = process.memoryUsage();

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            await fn();
            const end = performance.now();
            times.push(end - start);
        }

        const endMemory = process.memoryUsage();
        
        // Calculate statistics
        times.sort((a, b) => a - b);
        const min = times[0];
        const max = times[times.length - 1];
        const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
        const median = times[Math.floor(times.length / 2)];
        const p95 = times[Math.floor(times.length * 0.95)];
        const p99 = times[Math.floor(times.length * 0.99)];

        const memoryDelta = {
            rss: endMemory.rss - startMemory.rss,
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            external: endMemory.external - startMemory.external
        };

        const result = {
            name,
            iterations,
            timing: { min, max, avg, median, p95, p99 },
            memory: memoryDelta,
            throughput: 1000 / avg // operations per second
        };

        this.results.push(result);
        return result;
    }

    async benchmarkFilesystemOperations() {
        this.log('🔧 Benchmarking filesystem operations');

        const testDir = path.join(this.rootDir, 'tests', 'tmp');
        await fs.promises.mkdir(testDir, { recursive: true });

        // File write performance
        await this.measurePerformance('file-write-small', async () => {
            const testFile = path.join(testDir, `test-${Math.random()}.txt`);
            await fs.promises.writeFile(testFile, 'test content');
            await fs.promises.unlink(testFile);
        }, 500);

        // File read performance
        const permanentFile = path.join(testDir, 'permanent-test.txt');
        await fs.promises.writeFile(permanentFile, 'test content for reading');
        
        await this.measurePerformance('file-read-small', async () => {
            await fs.promises.readFile(permanentFile, 'utf8');
        }, 1000);

        // Large file operations
        const largeContent = 'x'.repeat(10000); // 10KB
        await this.measurePerformance('file-write-large', async () => {
            const testFile = path.join(testDir, `large-${Math.random()}.txt`);
            await fs.promises.writeFile(testFile, largeContent);
            await fs.promises.unlink(testFile);
        }, 100);

        await fs.promises.unlink(permanentFile);
        await fs.promises.rmdir(testDir);
    }

    async benchmarkMemoryOperations() {
        this.log('🧠 Benchmarking memory operations');

        // Array operations
        await this.measurePerformance('array-creation', () => {
            const arr = new Array(1000).fill(0).map((_, i) => i);
            return arr;
        }, 1000);

        await this.measurePerformance('array-search', () => {
            const arr = new Array(1000).fill(0).map((_, i) => i);
            return arr.find(x => x === 500);
        }, 1000);

        // Object operations
        await this.measurePerformance('object-creation', () => {
            const obj = {};
            for (let i = 0; i < 100; i++) {
                obj[`key${i}`] = `value${i}`;
            }
            return obj;
        }, 1000);

        // Map operations
        await this.measurePerformance('map-operations', () => {
            const map = new Map();
            for (let i = 0; i < 100; i++) {
                map.set(`key${i}`, `value${i}`);
            }
            return map.get('key50');
        }, 1000);

        // Set operations
        await this.measurePerformance('set-operations', () => {
            const set = new Set();
            for (let i = 0; i < 100; i++) {
                set.add(i);
            }
            return set.has(50);
        }, 1000);
    }

    async benchmarkStringOperations() {
        this.log('📝 Benchmarking string operations');

        const testStrings = [
            'short',
            'this is a medium length string for testing',
            'this is a very long string that contains a lot of text and should be used for testing the performance of various string operations including concatenation, searching, and manipulation'.repeat(10)
        ];

        for (let i = 0; i < testStrings.length; i++) {
            const str = testStrings[i];
            const size = i === 0 ? 'small' : i === 1 ? 'medium' : 'large';

            await this.measurePerformance(`string-concat-${size}`, () => {
                return str + str + str;
            }, 1000);

            await this.measurePerformance(`string-replace-${size}`, () => {
                return str.replace(/the/g, 'THE');
            }, 1000);

            await this.measurePerformance(`string-split-${size}`, () => {
                return str.split(' ');
            }, 1000);
        }
    }

    async benchmarkJSONOperations() {
        this.log('📄 Benchmarking JSON operations');

        const testObjects = [
            { name: 'test', id: 1 },
            { 
                name: 'test', 
                id: 1, 
                data: new Array(100).fill(0).map((_, i) => ({ id: i, value: `item${i}` }))
            },
            {
                name: 'test',
                id: 1,
                data: new Array(1000).fill(0).map((_, i) => ({
                    id: i,
                    value: `item${i}`,
                    nested: {
                        prop1: `prop${i}`,
                        prop2: i * 2,
                        array: new Array(10).fill(i)
                    }
                }))
            }
        ];

        for (let i = 0; i < testObjects.length; i++) {
            const obj = testObjects[i];
            const size = i === 0 ? 'small' : i === 1 ? 'medium' : 'large';

            await this.measurePerformance(`json-stringify-${size}`, () => {
                return JSON.stringify(obj);
            }, 500);

            const jsonString = JSON.stringify(obj);
            await this.measurePerformance(`json-parse-${size}`, () => {
                return JSON.parse(jsonString);
            }, 500);
        }
    }

    async benchmarkSecurityOperations() {
        this.log('🔒 Benchmarking security operations');

        // Test sanitization performance if available
        const sanitizerPath = path.join(this.rootDir, 'security', 'sanitizer.js');
        if (fs.existsSync(sanitizerPath)) {
            try {
                const SanitizerClass = require(sanitizerPath);
                const sanitizer = new SanitizerClass();

                const testInputs = [
                    'clean input',
                    '<script>alert("xss")</script>',
                    '../../../etc/passwd',
                    'rm -rf /',
                    '"><script>alert(1)</script><!--'
                ];

                for (const input of testInputs) {
                    if (typeof sanitizer.sanitizeString === 'function') {
                        await this.measurePerformance('security-sanitize', () => {
                            return sanitizer.sanitizeString(input);
                        }, 500);
                    }
                    break; // Only test once for performance
                }
            } catch (error) {
                this.log(`Security benchmark skipped: ${error.message}`, 'warning');
            }
        }

        // Test basic crypto operations
        const crypto = require('crypto');
        
        await this.measurePerformance('crypto-hash-md5', () => {
            return crypto.createHash('md5').update('test data').digest('hex');
        }, 1000);

        await this.measurePerformance('crypto-hash-sha256', () => {
            return crypto.createHash('sha256').update('test data').digest('hex');
        }, 1000);

        await this.measurePerformance('crypto-random', () => {
            return crypto.randomBytes(32);
        }, 1000);
    }

    async benchmarkPerformanceMonitoring() {
        this.log('📊 Benchmarking performance monitoring');

        // Test performance hooks overhead
        await this.measurePerformance('perf-hooks-now', () => {
            return performance.now();
        }, 10000);

        await this.measurePerformance('process-hrtime', () => {
            return process.hrtime.bigint();
        }, 10000);

        await this.measurePerformance('date-now', () => {
            return Date.now();
        }, 10000);

        // Test memory usage monitoring
        await this.measurePerformance('memory-usage', () => {
            return process.memoryUsage();
        }, 1000);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTime(ms) {
        if (ms < 1) return `${(ms * 1000).toFixed(2)}µs`;
        if (ms < 1000) return `${ms.toFixed(2)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    }

    generateReport() {
        this.log('\n📊 Performance Benchmark Report');
        
        // Sort results by average time
        const sortedResults = [...this.results].sort((a, b) => a.timing.avg - b.timing.avg);
        
        this.log('\n🏆 Top Performers (fastest average):', 'benchmark');
        sortedResults.slice(0, 5).forEach((result, index) => {
            this.log(`   ${index + 1}. ${result.name}: ${this.formatTime(result.timing.avg)} avg`, 'success');
        });

        this.log('\n🐌 Slowest Operations:', 'benchmark');
        sortedResults.slice(-5).reverse().forEach((result, index) => {
            this.log(`   ${index + 1}. ${result.name}: ${this.formatTime(result.timing.avg)} avg`, 'warning');
        });

        this.log('\n📈 Detailed Results:', 'benchmark');
        this.results.forEach(result => {
            this.log(`\n${result.name} (${result.iterations} iterations):`);
            this.log(`   Min: ${this.formatTime(result.timing.min)}`);
            this.log(`   Avg: ${this.formatTime(result.timing.avg)}`);
            this.log(`   Max: ${this.formatTime(result.timing.max)}`);
            this.log(`   P95: ${this.formatTime(result.timing.p95)}`);
            this.log(`   P99: ${this.formatTime(result.timing.p99)}`);
            this.log(`   Throughput: ${result.throughput.toFixed(0)} ops/sec`);
            
            if (Math.abs(result.memory.heapUsed) > 1024) {
                this.log(`   Memory: ${this.formatBytes(result.memory.heapUsed)}`);
            }
        });

        // Generate summary statistics
        const totalOperations = this.results.reduce((sum, r) => sum + r.iterations, 0);
        const avgThroughput = this.results.reduce((sum, r) => sum + r.throughput, 0) / this.results.length;
        
        this.log('\n📋 Summary:', 'benchmark');
        this.log(`   Total benchmarks: ${this.results.length}`);
        this.log(`   Total operations: ${totalOperations.toLocaleString()}`);
        this.log(`   Average throughput: ${avgThroughput.toFixed(0)} ops/sec`);
        this.log(`   System: ${this.systemInfo.platform} ${this.systemInfo.arch}`);
        this.log(`   CPUs: ${this.systemInfo.cpuCount}`);
        this.log(`   Memory: ${this.formatBytes(this.systemInfo.totalMemory)} total`);

        // Save detailed report
        const report = {
            summary: {
                totalBenchmarks: this.results.length,
                totalOperations,
                avgThroughput,
                timestamp: new Date().toISOString()
            },
            systemInfo: this.systemInfo,
            results: this.results
        };

        const reportPath = path.join(this.rootDir, 'tests', 'performance', 'benchmark-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.log(`\n📝 Detailed report saved to: ${reportPath}`);

        return report;
    }

    async runAllBenchmarks() {
        this.log('🚀 Starting Performance Benchmark Suite');
        this.log(`System: ${this.systemInfo.platform} ${this.systemInfo.arch}, Node.js ${this.systemInfo.nodeVersion}`);
        
        try {
            await this.benchmarkMemoryOperations();
            await this.benchmarkStringOperations();
            await this.benchmarkJSONOperations();
            await this.benchmarkFilesystemOperations();
            await this.benchmarkSecurityOperations();
            await this.benchmarkPerformanceMonitoring();
            
            const report = this.generateReport();
            
            this.log('\n🎉 Performance benchmarking completed!', 'success');
            
            return report;
            
        } catch (error) {
            this.log(`Performance benchmarking failed: ${error.message}`, 'error');
            throw error;
        }
    }
}

// CLI interface
async function main() {
    // Enable garbage collection for more accurate memory measurements
    if (global.gc) {
        console.log(chalk.green('✅ Garbage collection enabled for accurate memory measurements'));
    } else {
        console.log(chalk.yellow('⚠ Run with --expose-gc for more accurate memory measurements'));
    }

    const benchmarks = new PerformanceBenchmarks();
    
    try {
        await benchmarks.runAllBenchmarks();
        process.exit(0);
    } catch (error) {
        console.error(chalk.red(`❌ Performance benchmarking failed: ${error.message}`));
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = PerformanceBenchmarks;