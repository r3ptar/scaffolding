/**
 * Performance Feature Test Template
 * 
 * Copy this template for performance and load testing of features.
 * Replace FEATURE_NAME with your actual feature name throughout.
 */

const autocannon = require('autocannon');
const { performance } = require('perf_hooks');
const { createTestClient } = require('../../../test-utils/client');

describe('FEATURE_NAME Performance Tests', () => {
    let client;
    const results = {
        responseTimes: [],
        throughput: [],
        errors: [],
        memoryUsage: []
    };
    
    beforeAll(async () => {
        client = createTestClient({
            baseURL: 'http://localhost:3000',
            headers: {
                'Authorization': 'Basic bGxtdXNlcjp0aGVjb29raWVqYXI=',
                'OpenAI-Authorization': 'Bearer billding'
            }
        });
        
        // Warm up the system
        await warmupSystem();
    });
    
    afterAll(async () => {
        // Generate performance report
        generatePerformanceReport(results);
    });
    
    describe('Response Time Tests', () => {
        it('should respond within acceptable time for single requests', async () => {
            const iterations = 100;
            const times = [];
            
            for (let i = 0; i < iterations; i++) {
                const start = performance.now();
                await client.get('/v1/FEATURE_NAME');
                const end = performance.now();
                times.push(end - start);
            }
            
            const avgTime = times.reduce((a, b) => a + b) / times.length;
            const maxTime = Math.max(...times);
            const minTime = Math.min(...times);
            
            results.responseTimes.push({
                test: 'single_request',
                avg: avgTime,
                max: maxTime,
                min: minTime
            });
            
            expect(avgTime).toBeLessThan(200); // Average under 200ms
            expect(maxTime).toBeLessThan(1000); // Max under 1 second
        });
        
        it('should maintain performance with complex queries', async () => {
            const complexQuery = {
                filters: {
                    status: 'active',
                    category: ['A', 'B', 'C'],
                    dateRange: {
                        start: '2025-01-01',
                        end: '2025-12-31'
                    }
                },
                sort: { field: 'created_at', order: 'desc' },
                pagination: { page: 1, limit: 50 },
                include: ['relations', 'metadata']
            };
            
            const times = [];
            
            for (let i = 0; i < 50; i++) {
                const start = performance.now();
                await client.get('/v1/FEATURE_NAME', { params: complexQuery });
                const end = performance.now();
                times.push(end - start);
            }
            
            const avgTime = times.reduce((a, b) => a + b) / times.length;
            
            results.responseTimes.push({
                test: 'complex_query',
                avg: avgTime
            });
            
            expect(avgTime).toBeLessThan(500); // Complex queries under 500ms
        });
    });
    
    describe('Throughput Tests', () => {
        it('should handle target requests per second', async () => {
            const instance = autocannon({
                url: 'http://localhost:3000/v1/FEATURE_NAME',
                headers: {
                    'Authorization': 'Basic bGxtdXNlcjp0aGVjb29raWVqYXI=',
                    'OpenAI-Authorization': 'Bearer billding'
                },
                connections: 10,
                pipelining: 1,
                duration: 10 // 10 seconds
            });
            
            return new Promise((resolve, reject) => {
                autocannon.track(instance, { renderProgressBar: false });
                
                instance.on('done', (result) => {
                    results.throughput.push({
                        test: 'standard_load',
                        requestsPerSec: result.requests.average,
                        latency: result.latency.average,
                        errors: result.errors
                    });
                    
                    expect(result.requests.average).toBeGreaterThan(100); // At least 100 req/s
                    expect(result.errors).toBe(0); // No errors under normal load
                    resolve();
                });
                
                instance.on('error', reject);
            });
        });
        
        it('should handle burst traffic', async () => {
            const instance = autocannon({
                url: 'http://localhost:3000/v1/FEATURE_NAME',
                headers: {
                    'Authorization': 'Basic bGxtdXNlcjp0aGVjb29raWVqYXI=',
                    'OpenAI-Authorization': 'Bearer billding'
                },
                connections: 100, // High concurrent connections
                pipelining: 10,
                duration: 5,
                bailout: 1000 // Stop if latency exceeds 1 second
            });
            
            return new Promise((resolve, reject) => {
                autocannon.track(instance, { renderProgressBar: false });
                
                instance.on('done', (result) => {
                    results.throughput.push({
                        test: 'burst_traffic',
                        requestsPerSec: result.requests.average,
                        latency: result.latency.average,
                        errors: result.errors,
                        timeouts: result.timeouts
                    });
                    
                    expect(result.latency.p99).toBeLessThan(2000); // 99th percentile under 2s
                    expect(result.errors).toBeLessThan(result.requests.total * 0.01); // Less than 1% errors
                    resolve();
                });
                
                instance.on('error', reject);
            });
        });
    });
    
    describe('Resource Usage Tests', () => {
        it('should not leak memory under sustained load', async () => {
            const initialMemory = process.memoryUsage();
            const memorySnapshots = [];
            
            // Run sustained load for 1 minute
            const startTime = Date.now();
            const duration = 60000; // 1 minute
            
            while (Date.now() - startTime < duration) {
                // Make concurrent requests
                const promises = Array(10).fill(null).map(() => 
                    client.get('/v1/FEATURE_NAME')
                );
                await Promise.all(promises);
                
                // Take memory snapshot every 10 seconds
                if ((Date.now() - startTime) % 10000 < 100) {
                    memorySnapshots.push(process.memoryUsage());
                }
            }
            
            const finalMemory = process.memoryUsage();
            
            // Calculate memory growth
            const heapGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
            const heapGrowthPercent = (heapGrowth / initialMemory.heapUsed) * 100;
            
            results.memoryUsage.push({
                test: 'sustained_load',
                initialHeap: initialMemory.heapUsed,
                finalHeap: finalMemory.heapUsed,
                growthPercent: heapGrowthPercent,
                snapshots: memorySnapshots.length
            });
            
            expect(heapGrowthPercent).toBeLessThan(50); // Less than 50% growth
        });
        
        it('should handle database connection pooling efficiently', async () => {
            // Monitor database connections
            const connectionStats = [];
            
            // Create load that requires many DB queries
            const loadPromises = [];
            for (let i = 0; i < 5; i++) {
                loadPromises.push(
                    (async () => {
                        for (let j = 0; j < 100; j++) {
                            await client.get(`/v1/FEATURE_NAME/${j}`);
                        }
                    })()
                );
            }
            
            // Check connection pool stats periodically
            const statsInterval = setInterval(async () => {
                const stats = await getConnectionPoolStats();
                connectionStats.push(stats);
            }, 1000);
            
            await Promise.all(loadPromises);
            clearInterval(statsInterval);
            
            // Analyze connection usage
            const maxConnections = Math.max(...connectionStats.map(s => s.active));
            const avgConnections = connectionStats.reduce((sum, s) => sum + s.active, 0) / connectionStats.length;
            
            expect(maxConnections).toBeLessThan(50); // Pool should limit connections
            expect(avgConnections).toBeGreaterThan(5); // Pool should reuse connections
        });
    });
    
    describe('Scalability Tests', () => {
        it('should scale linearly with data size', async () => {
            const dataSizes = [10, 100, 1000, 10000];
            const results = [];
            
            for (const size of dataSizes) {
                // Seed data
                await seedTestData(size);
                
                // Measure performance
                const times = [];
                for (let i = 0; i < 10; i++) {
                    const start = performance.now();
                    await client.get('/v1/FEATURE_NAME?limit=50');
                    const end = performance.now();
                    times.push(end - start);
                }
                
                const avgTime = times.reduce((a, b) => a + b) / times.length;
                results.push({ size, avgTime });
                
                // Cleanup
                await cleanupTestData();
            }
            
            // Check that performance doesn't degrade exponentially
            for (let i = 1; i < results.length; i++) {
                const sizeRatio = results[i].size / results[i-1].size;
                const timeRatio = results[i].avgTime / results[i-1].avgTime;
                
                // Time should not increase more than 2x for 10x data increase
                expect(timeRatio).toBeLessThan(Math.log10(sizeRatio) * 2);
            }
        });
    });
    
    describe('Caching Performance', () => {
        it('should utilize cache effectively', async () => {
            const endpoint = '/v1/FEATURE_NAME/cached-resource';
            
            // First request (cache miss)
            const firstStart = performance.now();
            const firstResponse = await client.get(endpoint);
            const firstTime = performance.now() - firstStart;
            
            // Subsequent requests (cache hits)
            const cachedTimes = [];
            for (let i = 0; i < 50; i++) {
                const start = performance.now();
                await client.get(endpoint);
                cachedTimes.push(performance.now() - start);
            }
            
            const avgCachedTime = cachedTimes.reduce((a, b) => a + b) / cachedTimes.length;
            
            // Cached requests should be significantly faster
            expect(avgCachedTime).toBeLessThan(firstTime * 0.1); // 90% faster
            
            // Verify cache headers
            expect(firstResponse.headers['x-cache-status']).toBe('MISS');
            const cachedResponse = await client.get(endpoint);
            expect(cachedResponse.headers['x-cache-status']).toBe('HIT');
        });
    });
});

// Helper functions
async function warmupSystem() {
    // Make initial requests to warm up the system
    const warmupRequests = Array(10).fill(null).map(() => 
        client.get('/v1/FEATURE_NAME').catch(() => {})
    );
    await Promise.all(warmupRequests);
    
    // Wait for system to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));
}

function generatePerformanceReport(results) {
    const report = {
        timestamp: new Date().toISOString(),
        feature: 'FEATURE_NAME',
        summary: {
            responseTime: {
                average: calculateAverage(results.responseTimes.map(r => r.avg)),
                recommendations: []
            },
            throughput: {
                average: calculateAverage(results.throughput.map(r => r.requestsPerSec)),
                recommendations: []
            },
            memory: {
                maxGrowth: Math.max(...results.memoryUsage.map(r => r.growthPercent)),
                recommendations: []
            }
        },
        details: results
    };
    
    // Add recommendations based on results
    if (report.summary.responseTime.average > 300) {
        report.summary.responseTime.recommendations.push(
            'Consider adding caching or optimizing database queries'
        );
    }
    
    if (report.summary.throughput.average < 100) {
        report.summary.throughput.recommendations.push(
            'Consider horizontal scaling or connection pooling optimization'
        );
    }
    
    if (report.summary.memory.maxGrowth > 30) {
        report.summary.memory.recommendations.push(
            'Investigate potential memory leaks or implement object pooling'
        );
    }
    
    console.log('\n=== Performance Test Report ===');
    console.log(JSON.stringify(report, null, 2));
    
    // Save report to file
    require('fs').writeFileSync(
        `performance-report-FEATURE_NAME-${Date.now()}.json`,
        JSON.stringify(report, null, 2)
    );
}

function calculateAverage(numbers) {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

async function getConnectionPoolStats() {
    // Implementation depends on your database driver
    // This is a placeholder
    return {
        active: Math.floor(Math.random() * 20) + 5,
        idle: Math.floor(Math.random() * 10),
        total: 30
    };
}

async function seedTestData(size) {
    // Implementation depends on your data model
    const items = Array.from({ length: size }, (_, i) => ({
        name: `Test Item ${i}`,
        data: 'x'.repeat(1000) // 1KB per item
    }));
    
    await client.post('/v1/FEATURE_NAME/bulk', { items });
}

async function cleanupTestData() {
    await client.delete('/v1/FEATURE_NAME/test-data');
}