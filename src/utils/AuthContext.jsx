import React, { createContext, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const navigate = useNavigate();

    const login = useCallback((userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        navigate('/inicio');
    }, [navigate]);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    }, [navigate]);

    const value = { user, login, logout };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};