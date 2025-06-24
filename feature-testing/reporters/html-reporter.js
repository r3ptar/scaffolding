/**
 * HTML Test Result Reporter
 * Generates beautiful HTML reports with charts and details
 */

class HTMLReporter {
    constructor(options = {}) {
        this.title = options.title || 'Feature Test Report';
        this.theme = options.theme || 'default';
        this.includeCharts = options.includeCharts !== false;
    }
    
    generateReport(results, outputPath) {
        const fs = require('fs');
        const path = require('path');
        
        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const html = this.generateHTML(results);
        fs.writeFileSync(outputPath, html);
        
        return outputPath;
    }
    
    generateHTML(results) {
        const passRate = ((results.summary.passed / results.summary.total) * 100).toFixed(2);
        const duration = (results.summary.duration / 1000).toFixed(2);
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.title} - ${results.feature}</title>
    ${this.getStyles()}
    ${this.includeCharts ? '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>' : ''}
</head>
<body>
    <div class="container">
        <header>
            <h1>${this.title}</h1>
            <div class="meta">
                <span class="feature">Feature: ${results.feature}</span>
                <span class="timestamp">Generated: ${new Date(results.timestamp).toLocaleString()}</span>
            </div>
        </header>
        
        ${this.generateSummarySection(results)}
        ${this.includeCharts ? this.generateChartsSection(results) : ''}
        ${this.generateTestDetailsSection(results)}
        ${this.generateErrorsSection(results)}
        ${this.generatePerformanceSection(results)}
        ${this.generateSystemInfoSection(results)}
    </div>
    
    ${this.includeCharts ? this.generateChartScripts(results) : ''}
</body>
</html>`;
    }
    
    getStyles() {
        return `<style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f7fa;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .meta {
            display: flex;
            justify-content: space-between;
            color: #7f8c8d;
            font-size: 14px;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.2s;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }
        
        .stat-value {
            font-size: 48px;
            font-weight: bold;
            margin: 15px 0;
        }
        
        .stat-label {
            color: #7f8c8d;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .passed { color: #27ae60; }
        .failed { color: #e74c3c; }
        .skipped { color: #f39c12; }
        .total { color: #3498db; }
        
        .section {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        h2 {
            color: #2c3e50;
            margin-bottom: 20px;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 10px;
        }
        
        .charts {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        th, td {
            text-align: left;
            padding: 15px;
            border-bottom: 1px solid #ecf0f1;
        }
        
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 1px;
        }
        
        tr:hover {
            background: #f8f9fa;
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-passed {
            background: #d4edda;
            color: #155724;
        }
        
        .status-failed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-skipped {
            background: #fff3cd;
            color: #856404;
        }
        
        .error-box {
            background: #fee;
            border-left: 4px solid #e74c3c;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        
        .warning-box {
            background: #fffbf0;
            border-left: 4px solid #f39c12;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        
        .code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }
        
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .metric-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .metric-label {
            color: #7f8c8d;
            font-size: 12px;
            margin-top: 5px;
        }
        
        @media (max-width: 768px) {
            .charts {
                grid-template-columns: 1fr;
            }
            
            .meta {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>`;
    }
    
    generateSummarySection(results) {
        const passRate = ((results.summary.passed / results.summary.total) * 100).toFixed(2);
        const duration = (results.summary.duration / 1000).toFixed(2);
        
        return `
        <div class="summary">
            <div class="stat-card">
                <div class="stat-label">Total Tests</div>
                <div class="stat-value total">${results.summary.total}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Passed</div>
                <div class="stat-value passed">${results.summary.passed}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Failed</div>
                <div class="stat-value failed">${results.summary.failed}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Skipped</div>
                <div class="stat-value skipped">${results.summary.skipped}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Pass Rate</div>
                <div class="stat-value ${passRate >= 80 ? 'passed' : 'failed'}">${passRate}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Duration</div>
                <div class="stat-value total">${duration}s</div>
            </div>
        </div>`;
    }
    
    generateChartsSection(results) {
        return `
        <div class="charts">
            <div class="chart-container">
                <h3>Test Status Distribution</h3>
                <canvas id="statusChart"></canvas>
            </div>
            <div class="chart-container">
                <h3>Test Duration Distribution</h3>
                <canvas id="durationChart"></canvas>
            </div>
        </div>`;
    }
    
    generateTestDetailsSection(results) {
        const testRows = results.tests.map(test => `
            <tr>
                <td>${test.suite}</td>
                <td>${test.name}</td>
                <td><span class="status-badge status-${test.status}">${test.status}</span></td>
                <td>${test.duration ? test.duration + 'ms' : '-'}</td>
                <td>${test.retries || 0}</td>
            </tr>
        `).join('');
        
        return `
        <div class="section">
            <h2>Test Details</h2>
            <table>
                <thead>
                    <tr>
                        <th>Suite</th>
                        <th>Test</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Retries</th>
                    </tr>
                </thead>
                <tbody>
                    ${testRows}
                </tbody>
            </table>
        </div>`;
    }
    
    generateErrorsSection(results) {
        if (results.errors.length === 0 && results.warnings.length === 0) {
            return '';
        }
        
        const errors = results.errors.map(error => `
            <div class="error-box">
                <strong>${error.test}:</strong> ${error.message}
                ${error.stack ? `<pre class="code">${error.stack}</pre>` : ''}
            </div>
        `).join('');
        
        const warnings = results.warnings.map(warning => `
            <div class="warning-box">
                <strong>${warning.test}:</strong> ${warning.message}
            </div>
        `).join('');
        
        return `
        <div class="section">
            <h2>Errors & Warnings</h2>
            ${errors}
            ${warnings}
        </div>`;
    }
    
    generatePerformanceSection(results) {
        if (!results.performance || results.performance.avgResponseTime === 0) {
            return '';
        }
        
        return `
        <div class="section">
            <h2>Performance Metrics</h2>
            <div class="metric-grid">
                <div class="metric-box">
                    <div class="metric-value">${results.performance.avgResponseTime.toFixed(2)}ms</div>
                    <div class="metric-label">Average Response Time</div>
                </div>
                <div class="metric-box">
                    <div class="metric-value">${results.performance.maxResponseTime.toFixed(2)}ms</div>
                    <div class="metric-label">Max Response Time</div>
                </div>
                <div class="metric-box">
                    <div class="metric-value">${results.performance.minResponseTime.toFixed(2)}ms</div>
                    <div class="metric-label">Min Response Time</div>
                </div>
                ${results.performance.throughput ? `
                <div class="metric-box">
                    <div class="metric-value">${results.performance.throughput}</div>
                    <div class="metric-label">Requests/Second</div>
                </div>` : ''}
            </div>
        </div>`;
    }
    
    generateSystemInfoSection(results) {
        if (!results.system) {
            return '';
        }
        
        return `
        <div class="section">
            <h2>System Information</h2>
            <div class="metric-grid">
                <div class="metric-box">
                    <div class="metric-value">${results.system.platform}</div>
                    <div class="metric-label">Platform</div>
                </div>
                <div class="metric-box">
                    <div class="metric-value">${results.system.nodeVersion}</div>
                    <div class="metric-label">Node Version</div>
                </div>
                <div class="metric-box">
                    <div class="metric-value">${(results.system.memory.heapUsed / 1024 / 1024).toFixed(2)}MB</div>
                    <div class="metric-label">Memory Used</div>
                </div>
            </div>
        </div>`;
    }
    
    generateChartScripts(results) {
        return `
        <script>
            // Status Chart
            const statusCtx = document.getElementById('statusChart').getContext('2d');
            new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Passed', 'Failed', 'Skipped'],
                    datasets: [{
                        data: [${results.summary.passed}, ${results.summary.failed}, ${results.summary.skipped}],
                        backgroundColor: ['#27ae60', '#e74c3c', '#f39c12'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            
            // Duration Chart
            const durations = ${JSON.stringify(results.tests.map(t => t.duration || 0).filter(d => d > 0))};
            const durationCtx = document.getElementById('durationChart').getContext('2d');
            new Chart(durationCtx, {
                type: 'bar',
                data: {
                    labels: ['0-100ms', '100-500ms', '500-1000ms', '1000ms+'],
                    datasets: [{
                        label: 'Number of Tests',
                        data: [
                            durations.filter(d => d <= 100).length,
                            durations.filter(d => d > 100 && d <= 500).length,
                            durations.filter(d => d > 500 && d <= 1000).length,
                            durations.filter(d => d > 1000).length
                        ],
                        backgroundColor: '#3498db'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        </script>`;
    }
}

module.exports = HTMLReporter;