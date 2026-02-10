// Export all backends for easy switching during development
export { mockBackend } from './mockBackend';
export { mockBackendAsync } from './mockBackendAsync';
export { supabaseBackend } from './supabaseBackend';
export type { IBackendService } from './IBackendService';

// Configuration utility to determine which backend to use
export const getBackendType = () => {
    // Check environment variable or localStorage flag
    const backendType = import.meta.env.VITE_BACKEND_TYPE ||
        localStorage.getItem('backend_type') ||
        'mock'; // Default to mock
    return backendType;
};

/**
 * Helper to get the implementation of the backend dynamically.
 * Note: Components should generally use the useBackend() hook from BackendContext
 */
export const getBackendInstance = async () => {
    const backendType = getBackendType();

    if (backendType === 'supabase') {
        const module = await import('./supabaseBackend');
        return module.supabaseBackend;
    } else {
        const module = await import('./mockBackendAsync');
        return module.mockBackendAsync;
    }
};
