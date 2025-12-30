import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { realBackend } from '../services/realBackend';
import { mockBackend } from '../services/mockBackend';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize mock data
        mockBackend.initialize();

        // Check for existing session
        const storedUser = localStorage.getItem('current_user');
        const token = localStorage.getItem('auth_token');

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
                // For mock backend, just set as loaded since there's no token expiry
                setIsLoading(false);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('current_user');
                setUser(null);
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            // Try mock backend first (since real backend is not implemented yet)
            const mockUser = mockBackend.authenticate(username, password);
            if (mockUser) {
                setUser(mockUser);
                localStorage.setItem('current_user', JSON.stringify(mockUser));
                return true;
            }
            
            // If mock backend fails, try real backend
            const foundUser = await realBackend.authenticate(username, password);
            if (foundUser) {
                setUser(foundUser);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
