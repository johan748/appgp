/// <reference types="vite/client" />
import React, { createContext, useContext, useEffect, useState } from 'react';
import { IBackendService } from '../services/IBackendService';
import { mockBackendAsync } from '../services/mockBackendAsync';
import { supabaseBackend } from '../services/supabaseBackend';
import { User } from '../types';

interface BackendContextType {
    backend: IBackendService;
    backendType: 'mock' | 'supabase' | 'real';
    isLoading: boolean;
    authLoading: boolean; // Specific loading state for auth checks
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export const BackendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [backend, setBackend] = useState<IBackendService>(mockBackendAsync);
    const [backendType, setBackendType] = useState<'mock' | 'supabase' | 'real'>('mock');
    const [isLoading, setIsLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const initBackend = async () => {
            const configuredType = import.meta.env.VITE_BACKEND_TYPE ||
                localStorage.getItem('backend_type') ||
                'mock';

            setBackendType(configuredType as any);

            let service: IBackendService;
            switch (configuredType) {
                case 'supabase':
                    service = supabaseBackend as unknown as IBackendService;
                    break;
                case 'mock':
                default:
                    service = mockBackendAsync;
                    break;
            }

            service.initialize();
            setBackend(service);
            setIsLoading(false);
            setAuthLoading(false);
        };

        initBackend();
    }, []);

    return (
        <BackendContext.Provider value={{ backend, backendType, isLoading, authLoading }}>
            {children}
        </BackendContext.Provider>
    );
};

export const useBackend = () => {
    const context = useContext(BackendContext);
    if (!context) {
        throw new Error('useBackend must be used within a BackendProvider');
    }
    return context;
};
