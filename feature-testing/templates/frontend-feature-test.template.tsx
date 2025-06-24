/**
 * Frontend Feature Test Template
 * 
 * Copy this template and customize for your feature's UI testing needs.
 * Replace FEATURE_NAME with your actual feature name throughout.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Import your component
import { FEATURE_NAME } from '../components/FEATURE_NAME';

// Mock API calls
vi.mock('../api/FEATURE_NAME', () => ({
    fetchFeatureData: vi.fn(),
    updateFeatureData: vi.fn(),
    deleteFeatureItem: vi.fn()
}));

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        }
    });
    
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </QueryClientProvider>
    );
};

describe('FEATURE_NAME Frontend Tests', () => {
    const user = userEvent.setup();
    
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
    });
    
    afterEach(() => {
        // Cleanup after each test
        vi.resetAllMocks();
    });
    
    describe('Component Rendering', () => {
        it('should render without errors', () => {
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            expect(screen.getByTestId('feature-container')).toBeInTheDocument();
        });
        
        it('should display loading state initially', () => {
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            expect(screen.getByText(/loading/i)).toBeInTheDocument();
        });
        
        it('should display data when loaded', async () => {
            const mockData = [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }
            ];
            
            vi.mocked(fetchFeatureData).mockResolvedValueOnce(mockData);
            
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            await waitFor(() => {
                expect(screen.getByText('Item 1')).toBeInTheDocument();
                expect(screen.getByText('Item 2')).toBeInTheDocument();
            });
        });
        
        it('should display error state on fetch failure', async () => {
            vi.mocked(fetchFeatureData).mockRejectedValueOnce(
                new Error('Failed to fetch')
            );
            
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            await waitFor(() => {
                expect(screen.getByText(/error/i)).toBeInTheDocument();
                expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
            });
        });
    });
    
    describe('User Interactions', () => {
        it('should handle item click', async () => {
            const mockData = [{ id: 1, name: 'Clickable Item' }];
            vi.mocked(fetchFeatureData).mockResolvedValueOnce(mockData);
            
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            await waitFor(() => {
                expect(screen.getByText('Clickable Item')).toBeInTheDocument();
            });
            
            await user.click(screen.getByText('Clickable Item'));
            
            // Verify expected behavior after click
            expect(screen.getByTestId('item-details')).toBeInTheDocument();
        });
        
        it('should handle form submission', async () => {
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            // Fill form
            const nameInput = screen.getByLabelText(/name/i);
            await user.type(nameInput, 'New Item');
            
            // Submit form
            const submitButton = screen.getByRole('button', { name: /submit/i });
            await user.click(submitButton);
            
            // Verify API call
            expect(vi.mocked(updateFeatureData)).toHaveBeenCalledWith({
                name: 'New Item'
            });
            
            // Verify UI update
            await waitFor(() => {
                expect(screen.getByText('New Item')).toBeInTheDocument();
            });
        });
        
        it('should validate form inputs', async () => {
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            // Try to submit empty form
            const submitButton = screen.getByRole('button', { name: /submit/i });
            await user.click(submitButton);
            
            // Verify validation errors
            expect(screen.getByText(/required/i)).toBeInTheDocument();
            expect(vi.mocked(updateFeatureData)).not.toHaveBeenCalled();
        });
        
        it('should handle delete action', async () => {
            const mockData = [{ id: 1, name: 'Item to Delete' }];
            vi.mocked(fetchFeatureData).mockResolvedValueOnce(mockData);
            vi.mocked(deleteFeatureItem).mockResolvedValueOnce({ success: true });
            
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            await waitFor(() => {
                expect(screen.getByText('Item to Delete')).toBeInTheDocument();
            });
            
            // Click delete button
            const deleteButton = screen.getByRole('button', { name: /delete/i });
            await user.click(deleteButton);
            
            // Confirm deletion
            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            await user.click(confirmButton);
            
            // Verify API call
            expect(vi.mocked(deleteFeatureItem)).toHaveBeenCalledWith(1);
            
            // Verify item removed from UI
            await waitFor(() => {
                expect(screen.queryByText('Item to Delete')).not.toBeInTheDocument();
            });
        });
    });
    
    describe('Responsive Design', () => {
        it('should adapt to mobile viewport', () => {
            // Set mobile viewport
            window.innerWidth = 375;
            window.dispatchEvent(new Event('resize'));
            
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            // Verify mobile-specific elements
            expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
            expect(screen.queryByTestId('desktop-sidebar')).not.toBeInTheDocument();
        });
        
        it('should adapt to desktop viewport', () => {
            // Set desktop viewport
            window.innerWidth = 1920;
            window.dispatchEvent(new Event('resize'));
            
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            // Verify desktop-specific elements
            expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
            expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
        });
    });
    
    describe('Accessibility', () => {
        it('should have proper ARIA labels', () => {
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'FEATURE_NAME');
            expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Feature navigation');
        });
        
        it('should be keyboard navigable', async () => {
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            // Tab through interactive elements
            await user.tab();
            expect(screen.getByRole('button', { name: /first/i })).toHaveFocus();
            
            await user.tab();
            expect(screen.getByRole('button', { name: /second/i })).toHaveFocus();
            
            // Activate with Enter key
            await user.keyboard('{Enter}');
            expect(screen.getByTestId('activated-element')).toBeInTheDocument();
        });
        
        it('should announce changes to screen readers', async () => {
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            // Trigger an action that updates content
            await user.click(screen.getByRole('button', { name: /update/i }));
            
            // Verify live region announcement
            const liveRegion = screen.getByRole('status');
            expect(liveRegion).toHaveTextContent(/updated successfully/i);
        });
    });
    
    describe('Performance', () => {
        it('should render efficiently with many items', async () => {
            const manyItems = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                name: `Item ${i}`
            }));
            
            vi.mocked(fetchFeatureData).mockResolvedValueOnce(manyItems);
            
            const startTime = performance.now();
            
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            await waitFor(() => {
                expect(screen.getByText('Item 0')).toBeInTheDocument();
            });
            
            const renderTime = performance.now() - startTime;
            expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
        });
        
        it('should implement virtualization for long lists', async () => {
            const manyItems = Array.from({ length: 10000 }, (_, i) => ({
                id: i,
                name: `Item ${i}`
            }));
            
            vi.mocked(fetchFeatureData).mockResolvedValueOnce(manyItems);
            
            render(
                <TestWrapper>
                    <FEATURE_NAME />
                </TestWrapper>
            );
            
            await waitFor(() => {
                // Only visible items should be in DOM
                const renderedItems = screen.getAllByTestId(/item-/);
                expect(renderedItems.length).toBeLessThan(50); // Virtualized
            });
        });
    });
    
    describe('Error Boundaries', () => {
        it('should catch and display component errors', () => {
            const ThrowError = () => {
                throw new Error('Test error');
            };
            
            render(
                <TestWrapper>
                    <FEATURE_NAME>
                        <ThrowError />
                    </FEATURE_NAME>
                </TestWrapper>
            );
            
            expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
        });
    });
});