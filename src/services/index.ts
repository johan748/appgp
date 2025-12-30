// Export both backends for easy switching during development
export { mockBackend } from './mockBackend';
export { realBackend } from './realBackend';

// Export API functions for direct use
export * from './api';

// Configuration to determine which backend to use
export const useRealBackend = () => {
    // Check environment variable or localStorage flag
    const useReal = process.env.VITE_USE_REAL_BACKEND === 'true' || 
                   localStorage.getItem('use_real_backend') === 'true';
    return useReal;
};

// Default export - can be switched based on configuration
export const backend = () => {
    const useReal = useRealBackend();
    if (useReal) {
        return import('./realBackend').then(module => module.realBackend);
    } else {
        return import('./mockBackend').then(module => module.mockBackend);
    }
};
