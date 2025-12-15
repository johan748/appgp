import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { mockBackend } from '../services/mockBackend';

interface AuthContextType {
    user: User | null;
    login: (username: string, pass: string) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem('current_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        // Initialize backend data
        mockBackend.initialize();
    }, []);

    const login = (username: string, pass: string) => {
        const foundUser = mockBackend.authenticate(username, pass);
        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('current_user', JSON.stringify(foundUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('current_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
