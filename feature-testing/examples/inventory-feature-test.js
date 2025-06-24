/**
 * Example: Inventory Feature Test
 * 
 * This demonstrates how to use the feature testing templates
 * for testing the inventory system functionality.
 */

const request = require('supertest');
const { createTestClient } = require('../../../../test-utils/client');

describe('Inventory API Tests', () => {
    let client;
    let testCharacterId;
    let testItems;
    
    beforeAll(async () => {
        // Initialize test client with auth
        client = createTestClient({
            baseURL: 'http://localhost:3000',
            headers: {
                'Authorization': 'Basic bGxtdXNlcjp0aGVjb29raWVqYXI=',
                'OpenAI-Authorization': 'Bearer billding'
            }
        });
        
        // Create test character
        const charResponse = await client.post('/v1/characters', {
            name: 'Test Inventory Character',
            archetype: 'wizard'
        });
        testCharacterId = charResponse.data.id;
        
        // Setup test items
        testItems = [
            { id: 'sword-001', name: 'Iron Sword', type: 'weapon', rarity: 'common' },
            { id: 'potion-001', name: 'Health Potion', type: 'consumable', quantity: 5 }
        ];
    });
    
    afterAll(async () => {
        // Cleanup test character
        if (testCharacterId) {
            await client.delete(`/v1/characters/${testCharacterId}`);
        }
    });
    
    describe('GET /v1/characters/:id/inventory', () => {
        it('should return character inventory', async () => {
            const response = await client.get(`/v1/characters/${testCharacterId}/inventory`);
            
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('items');
            expect(response.data).toHaveProperty('capacity');
            expect(response.data).toHaveProperty('used');
            expect(Array.isArray(response.data.items)).toBe(true);
        });
        
        it('should return 404 for non-existent character', async () => {
            const response = await client.get('/v1/characters/non-existent/inventory');
            
            expect(response.status).toBe(404);
            expect(response.data).toHaveProperty('error');
        });
    });
    
    describe('POST /v1/characters/:id/inventory/items', () => {
        it('should add item to inventory', async () => {
            const response = await client.post(
                `/v1/characters/${testCharacterId}/inventory/items`,
                testItems[0]
            );
            
            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty('id');
            expect(response.data.name).toBe(testItems[0].name);
            expect(response.data.equipped).toBe(false);
        });
        
        it('should stack consumable items', async () => {
            // Add first potion
            await client.post(
                `/v1/characters/${testCharacterId}/inventory/items`,
                testItems[1]
            );
            
            // Add more potions
            const response = await client.post(
                `/v1/characters/${testCharacterId}/inventory/items`,
                { ...testItems[1], quantity: 3 }
            );
            
            expect(response.status).toBe(200);
            expect(response.data.quantity).toBe(8); // 5 + 3
        });
        
        it('should reject when inventory is full', async () => {
            // Fill inventory to capacity
            const fillPromises = Array(100).fill(null).map((_, i) => 
                client.post(`/v1/characters/${testCharacterId}/inventory/items`, {
                    id: `item-${i}`,
                    name: `Test Item ${i}`,
                    type: 'misc'
                })
            );
            
            await Promise.allSettled(fillPromises);
            
            // Try to add one more
            const response = await client.post(
                `/v1/characters/${testCharacterId}/inventory/items`,
                { id: 'overflow-item', name: 'Overflow Item', type: 'misc' }
            );
            
            expect(response.status).toBe(400);
            expect(response.data.error).toContain('inventory full');
        });
    });
    
    describe('PUT /v1/characters/:id/inventory/items/:itemId/equip', () => {
        let weaponId;
        
        beforeEach(async () => {
            // Add a weapon to inventory
            const response = await client.post(
                `/v1/characters/${testCharacterId}/inventory/items`,
                { name: 'Test Sword', type: 'weapon', slot: 'main_hand' }
            );
            weaponId = response.data.id;
        });
        
        it('should equip item', async () => {
            const response = await client.put(
                `/v1/characters/${testCharacterId}/inventory/items/${weaponId}/equip`
            );
            
            expect(response.status).toBe(200);
            expect(response.data.equipped).toBe(true);
            expect(response.data.slot).toBe('main_hand');
        });
        
        it('should unequip previously equipped item in same slot', async () => {
            // Equip first weapon
            await client.put(
                `/v1/characters/${testCharacterId}/inventory/items/${weaponId}/equip`
            );
            
            // Add and equip second weapon
            const secondWeaponResponse = await client.post(
                `/v1/characters/${testCharacterId}/inventory/items`,
                { name: 'Better Sword', type: 'weapon', slot: 'main_hand' }
            );
            
            await client.put(
                `/v1/characters/${testCharacterId}/inventory/items/${secondWeaponResponse.data.id}/equip`
            );
            
            // Check first weapon is unequipped
            const inventoryResponse = await client.get(
                `/v1/characters/${testCharacterId}/inventory`
            );
            
            const firstWeapon = inventoryResponse.data.items.find(i => i.id === weaponId);
            expect(firstWeapon.equipped).toBe(false);
        });
    });
    
    describe('DELETE /v1/characters/:id/inventory/items/:itemId', () => {
        it('should remove item from inventory', async () => {
            // Add item
            const addResponse = await client.post(
                `/v1/characters/${testCharacterId}/inventory/items`,
                { name: 'Item to Delete', type: 'misc' }
            );
            const itemId = addResponse.data.id;
            
            // Delete item
            const deleteResponse = await client.delete(
                `/v1/characters/${testCharacterId}/inventory/items/${itemId}`
            );
            
            expect(deleteResponse.status).toBe(204);
            
            // Verify deletion
            const inventoryResponse = await client.get(
                `/v1/characters/${testCharacterId}/inventory`
            );
            
            const deletedItem = inventoryResponse.data.items.find(i => i.id === itemId);
            expect(deletedItem).toBeUndefined();
        });
    });
    
    describe('Performance', () => {
        it('should handle large inventory efficiently', async () => {
            const start = Date.now();
            
            // Get inventory with many items
            const response = await client.get(
                `/v1/characters/${testCharacterId}/inventory`
            );
            
            const duration = Date.now() - start;
            
            expect(response.status).toBe(200);
            expect(duration).toBeLessThan(500); // Should respond within 500ms
        });
        
        it('should handle concurrent item additions', async () => {
            const concurrentAdds = Array(20).fill(null).map((_, i) => 
                client.post(`/v1/characters/${testCharacterId}/inventory/items`, {
                    id: `concurrent-${i}`,
                    name: `Concurrent Item ${i}`,
                    type: 'misc'
                })
            );
            
            const results = await Promise.allSettled(concurrentAdds);
            const successful = results.filter(r => r.status === 'fulfilled');
            
            expect(successful.length).toBeGreaterThan(0);
            
            // Verify inventory integrity
            const inventoryResponse = await client.get(
                `/v1/characters/${testCharacterId}/inventory`
            );
            
            expect(inventoryResponse.data.items.length).toBeLessThanOrEqual(
                inventoryResponse.data.capacity
            );
        });
    });
});