/**
 * JSON Test Result Reporter
 * Formats test results into structured JSON for processing
 */

class JSONReporter {
    constructor(options = {}) {
        this.results = {
            feature: options.feature || 'unknown',
            timestamp: new Date().toISOString(),
            environment: options.environment || 'development',
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                skipped: 0,
                duration: 0
            },
            tests: [],
            performance: {
                avgResponseTime: 0,
                maxResponseTime: 0,
                minResponseTime: 0,
                throughput: 0
            },
            errors: [],
            warnings: []
        };
        this.startTime = Date.now();
    }
    
    addTest(test) {
        this.results.tests.push({
            name: test.name,
            suite: test.suite,
            status: test.status, // passed, failed, skipped
            duration: test.duration,
            error: test.error || null,
            retries: test.retries || 0,
            timestamp: new Date().toISOString()
        });
        
        // Update summary
        this.results.summary.total++;
        this.results.summary[test.status]++;
    }
    
    addPerformanceMetric(metric) {
        if (metric.responseTime) {
            // Update response time metrics
            const times = this.results.tests
                .filter(t => t.responseTime)
                .map(t => t.responseTime);
            times.push(metric.responseTime);
            
            this.results.performance.avgResponseTime = 
                times.reduce((a, b) => a + b, 0) / times.length;
            this.results.performance.maxResponseTime = Math.max(...times);
            this.results.performance.minResponseTime = Math.min(...times);
        }
        
        if (metric.throughput) {
            this.results.performance.throughput = metric.throughput;
        }
    }
    
    addError(error) {
        this.results.errors.push({
            message: error.message,
            stack: error.stack,
            test: error.test,
            timestamp: new Date().toISOString()
        });
    }
    
    addWarning(warning) {
        this.results.warnings.push({
            message: warning.message,
            test: warning.test,
            type: warning.type,
            timestamp: new Date().toISOString()
        });
    }
    
    finalize() {
        this.results.summary.duration = Date.now() - this.startTime;
        this.results.summary.passRate = 
            (this.results.summary.passed / this.results.summary.total) * 100;
        
        // Add system info
        this.results.system = {
            platform: process.platform,
            nodeVersion: process.version,
            memory: process.memoryUsage(),
            cpuUsage: process.cpuUsage()
        };
        
        return this.results;
    }
    
    generateReport(outputPath) {
        const report = this.finalize();
        const fs = require('fs');
        const path = require('path');
        
        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write report
        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
        
        return report;
    }
    
    // Console output with color
    printSummary() {
        const colors = {
            reset: '\x1b[0m',
            green: '\x1b[32m',
            red: '\x1b[31m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            cyan: '\x1b[36m'
        };
        
        console.log(`\n${colors.cyan}=== Test Results Summary ===${colors.reset}`);
        console.log(`Feature: ${this.results.feature}`);
        console.log(`Environment: ${this.results.environment}`);
        console.log(`Total Tests: ${this.results.summary.total}`);
        console.log(`${colors.green}✓ Passed: ${this.results.summary.passed}${colors.reset}`);
        console.log(`${colors.red}✗ Failed: ${this.results.summary.failed}${colors.reset}`);
        console.log(`${colors.yellow}⚠ Skipped: ${this.results.summary.skipped}${colors.reset}`);
        console.log(`Pass Rate: ${this.results.summary.passRate.toFixed(2)}%`);
        console.log(`Duration: ${(this.results.summary.duration / 1000).toFixed(2)}s`);
        
        if (this.results.performance.avgResponseTime > 0) {
            console.log(`\n${colors.blue}Performance Metrics:${colors.reset}`);
            console.log(`Avg Response Time: ${this.results.performance.avgResponseTime.toFixed(2)}ms`);
            console.log(`Max Response Time: ${this.results.performance.maxResponseTime.toFixed(2)}ms`);
            console.log(`Min Response Time: ${this.results.performance.minResponseTime.toFixed(2)}ms`);
        }
        
        if (this.results.errors.length > 0) {
            console.log(`\n${colors.red}Errors:${colors.reset}`);
            this.results.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.test}: ${error.message}`);
            });
        }
        
        if (this.results.warnings.length > 0) {
            console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
            this.results.warnings.forEach((warning, index) => {
                console.log(`${index + 1}. ${warning.test}: ${warning.message}`);
            });
        }
    }
}

module.exports = JSONReporter;