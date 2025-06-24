/**
 * Integration Feature Test Template
 * 
 * Copy this template for end-to-end feature testing across systems.
 * Replace FEATURE_NAME with your actual feature name throughout.
 */

const { chromium } = require('playwright');
const { createTestClient } = require('../../../test-utils/client');
const { setupTestDatabase, teardownTestDatabase } = require('../../../test-utils/database');
const { waitForCondition } = require('../../../test-utils/helpers');

describe('FEATURE_NAME Integration Tests', () => {
    let browser;
    let page;
    let apiClient;
    let testUser;
    let testData;
    
    beforeAll(async () => {
        // Setup test database
        await setupTestDatabase();
        
        // Launch browser
        browser = await chromium.launch({
            headless: process.env.HEADLESS !== 'false'
        });
        
        // Create API client
        apiClient = createTestClient({
            baseURL: 'http://localhost:3000',
            headers: {
                'Authorization': 'Basic bGxtdXNlcjp0aGVjb29raWVqYXI=',
                'OpenAI-Authorization': 'Bearer billding'
            }
        });
        
        // Create test user
        testUser = await createTestUser();
    });
    
    afterAll(async () => {
        // Cleanup
        await browser.close();
        await teardownTestDatabase();
    });
    
    beforeEach(async () => {
        // Create new page for each test
        page = await browser.newPage();
        
        // Login as test user
        await loginUser(page, testUser);
        
        // Reset test data
        testData = await setupTestData();
    });
    
    afterEach(async () => {
        // Clean up test data
        await cleanupTestData(testData);
        
        // Close page
        await page.close();
    });
    
    describe('Complete User Flow', () => {
        it('should allow user to complete full feature workflow', async () => {
            // Step 1: Navigate to feature
            await page.goto('http://localhost:3001/FEATURE_NAME');
            await page.waitForSelector('[data-testid="feature-loaded"]');
            
            // Step 2: Create new item via UI
            await page.click('[data-testid="create-new-button"]');
            await page.fill('[data-testid="item-name-input"]', 'Integration Test Item');
            await page.fill('[data-testid="item-description"]', 'Created via integration test');
            await page.click('[data-testid="submit-button"]');
            
            // Step 3: Verify item appears in list
            await page.waitForSelector('text="Integration Test Item"');
            
            // Step 4: Verify item in database via API
            const response = await apiClient.get('/v1/FEATURE_NAME');
            const createdItem = response.data.find(item => 
                item.name === 'Integration Test Item'
            );
            expect(createdItem).toBeDefined();
            expect(createdItem.description).toBe('Created via integration test');
            
            // Step 5: Edit item
            await page.click(`[data-testid="edit-item-${createdItem.id}"]`);
            await page.fill('[data-testid="item-name-input"]', 'Updated Test Item');
            await page.click('[data-testid="save-button"]');
            
            // Step 6: Verify update reflected everywhere
            await page.waitForSelector('text="Updated Test Item"');
            
            const updatedResponse = await apiClient.get(`/v1/FEATURE_NAME/${createdItem.id}`);
            expect(updatedResponse.data.name).toBe('Updated Test Item');
            
            // Step 7: Delete item
            await page.click(`[data-testid="delete-item-${createdItem.id}"]`);
            await page.click('[data-testid="confirm-delete"]');
            
            // Step 8: Verify deletion
            await page.waitForSelector('text="Item deleted successfully"');
            await expect(page.locator('text="Updated Test Item"')).toHaveCount(0);
            
            const deletedResponse = await apiClient.get(`/v1/FEATURE_NAME/${createdItem.id}`);
            expect(deletedResponse.status).toBe(404);
        });
    });
    
    describe('Cross-System Interactions', () => {
        it('should sync data between frontend and backend', async () => {
            // Create item via API
            const apiItem = await apiClient.post('/v1/FEATURE_NAME', {
                name: 'API Created Item',
                status: 'active'
            });
            
            // Navigate to frontend
            await page.goto('http://localhost:3001/FEATURE_NAME');
            
            // Verify item appears in UI
            await page.waitForSelector('text="API Created Item"');
            
            // Update item in UI
            await page.click(`[data-testid="toggle-status-${apiItem.data.id}"]`);
            
            // Verify update in backend
            await waitForCondition(async () => {
                const response = await apiClient.get(`/v1/FEATURE_NAME/${apiItem.data.id}`);
                return response.data.status === 'inactive';
            }, 5000);
        });
        
        it('should handle real-time updates', async () => {
            // Open two browser tabs
            const page2 = await browser.newPage();
            await loginUser(page2, testUser);
            
            // Navigate both to feature
            await page.goto('http://localhost:3001/FEATURE_NAME');
            await page2.goto('http://localhost:3001/FEATURE_NAME');
            
            // Create item in first tab
            await page.click('[data-testid="create-new-button"]');
            await page.fill('[data-testid="item-name-input"]', 'Real-time Test');
            await page.click('[data-testid="submit-button"]');
            
            // Verify it appears in second tab
            await page2.waitForSelector('text="Real-time Test"', { timeout: 5000 });
            
            await page2.close();
        });
    });
    
    describe('Error Handling', () => {
        it('should handle backend errors gracefully', async () => {
            // Simulate backend error
            await apiClient.interceptors.response.use(null, () => {
                return Promise.reject(new Error('Backend unavailable'));
            });
            
            await page.goto('http://localhost:3001/FEATURE_NAME');
            
            // Should show error message
            await page.waitForSelector('text="Unable to load data"');
            await page.waitForSelector('[data-testid="retry-button"]');
            
            // Restore backend
            apiClient.interceptors.response.clear();
            
            // Retry should work
            await page.click('[data-testid="retry-button"]');
            await page.waitForSelector('[data-testid="feature-loaded"]');
        });
        
        it('should handle network interruptions', async () => {
            await page.goto('http://localhost:3001/FEATURE_NAME');
            await page.waitForSelector('[data-testid="feature-loaded"]');
            
            // Simulate offline
            await page.context().setOffline(true);
            
            // Try to create item
            await page.click('[data-testid="create-new-button"]');
            await page.fill('[data-testid="item-name-input"]', 'Offline Test');
            await page.click('[data-testid="submit-button"]');
            
            // Should show offline message
            await page.waitForSelector('text="You are offline"');
            
            // Go back online
            await page.context().setOffline(false);
            
            // Should auto-retry or allow manual retry
            await page.waitForSelector('text="Item created successfully"', { timeout: 10000 });
        });
    });
    
    describe('Performance Under Load', () => {
        it('should handle multiple concurrent users', async () => {
            const pages = [];
            
            // Create 10 concurrent sessions
            for (let i = 0; i < 10; i++) {
                const newPage = await browser.newPage();
                await loginUser(newPage, await createTestUser());
                pages.push(newPage);
            }
            
            // All users navigate to feature
            await Promise.all(pages.map(p => 
                p.goto('http://localhost:3001/FEATURE_NAME')
            ));
            
            // All users create items simultaneously
            const createPromises = pages.map(async (p, index) => {
                await p.click('[data-testid="create-new-button"]');
                await p.fill('[data-testid="item-name-input"]', `Concurrent Item ${index}`);
                await p.click('[data-testid="submit-button"]');
                await p.waitForSelector('text="Item created successfully"');
            });
            
            await Promise.all(createPromises);
            
            // Verify all items created
            const response = await apiClient.get('/v1/FEATURE_NAME');
            const concurrentItems = response.data.filter(item => 
                item.name.startsWith('Concurrent Item')
            );
            expect(concurrentItems.length).toBe(10);
            
            // Cleanup
            await Promise.all(pages.map(p => p.close()));
        });
        
        it('should maintain performance with large datasets', async () => {
            // Create 1000 items
            const bulkItems = Array.from({ length: 1000 }, (_, i) => ({
                name: `Bulk Item ${i}`,
                category: i % 10
            }));
            
            await apiClient.post('/v1/FEATURE_NAME/bulk', { items: bulkItems });
            
            // Measure page load time
            const startTime = Date.now();
            await page.goto('http://localhost:3001/FEATURE_NAME');
            await page.waitForSelector('[data-testid="feature-loaded"]');
            const loadTime = Date.now() - startTime;
            
            expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
            
            // Test filtering performance
            const filterStartTime = Date.now();
            await page.selectOption('[data-testid="category-filter"]', '5');
            await page.waitForSelector('[data-testid="filter-complete"]');
            const filterTime = Date.now() - filterStartTime;
            
            expect(filterTime).toBeLessThan(500); // Filtering should be fast
        });
    });
    
    describe('Data Integrity', () => {
        it('should maintain consistency across operations', async () => {
            // Create parent item
            const parentResponse = await apiClient.post('/v1/FEATURE_NAME', {
                name: 'Parent Item',
                type: 'parent'
            });
            const parentId = parentResponse.data.id;
            
            // Create child items
            const childPromises = Array.from({ length: 5 }, (_, i) => 
                apiClient.post('/v1/FEATURE_NAME', {
                    name: `Child Item ${i}`,
                    type: 'child',
                    parentId
                })
            );
            await Promise.all(childPromises);
            
            // Navigate to UI and delete parent
            await page.goto('http://localhost:3001/FEATURE_NAME');
            await page.click(`[data-testid="delete-item-${parentId}"]`);
            await page.click('[data-testid="confirm-cascade-delete"]');
            
            // Verify all children also deleted
            await page.waitForSelector('text="6 items deleted"');
            
            // Verify in database
            const remainingItems = await apiClient.get('/v1/FEATURE_NAME');
            const relatedItems = remainingItems.data.filter(item => 
                item.id === parentId || item.parentId === parentId
            );
            expect(relatedItems.length).toBe(0);
        });
    });
});

// Helper functions
async function createTestUser() {
    // Implementation depends on your auth system
    return {
        id: `test-user-${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'testPassword123'
    };
}

async function loginUser(page, user) {
    await page.goto('http://localhost:3001/login');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForSelector('[data-testid="user-menu"]');
}

async function setupTestData() {
    // Create necessary test data
    return {
        // Add test data creation
    };
}

async function cleanupTestData(data) {
    // Clean up test data
    // Implementation depends on your data structure
}