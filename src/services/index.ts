// Export all backends for easy switching during development
export { mockBackend } from './mockBackend';
export { realBackend } from './realBackend';
export { supabaseBackend } from './supabaseBackend';

// Export API functions for direct use
export * from './api';

// Configuration to determine which backend to use
export const getBackendType = () => {
    // Check environment variable or localStorage flag
    const backendType = import.meta.env.VITE_BACKEND_TYPE ||
                       localStorage.getItem('backend_type') ||
                       'mock'; // Default to mock
    return backendType;
};

// Default export - can be switched based on configuration
export const backend = async () => {
    const backendType = getBackendType();

    switch (backendType) {
        case 'real':
            const realModule = await import('./realBackend');
            return realModule.realBackend;
        case 'supabase':
            const supabaseModule = await import('./supabaseBackend');
            return supabaseModule.supabaseBackend;
        case 'mock':
        default:
            const mockModule = await import('./mockBackend');
            return mockModule.mockBackend;
    }
};
