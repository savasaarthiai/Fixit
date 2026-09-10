import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('fixit_token');
        const savedUser = localStorage.getItem('fixit_user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('fixit_token');
                localStorage.removeItem('fixit_user');
            }
        }
        setLoading(false);
    }, []);

    const loginUser = (token, userData) => {
        localStorage.setItem('fixit_token', token);
        localStorage.setItem('fixit_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('fixit_token');
        localStorage.removeItem('fixit_user');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const res = await getMe();
            const userData = res.data.user;
            localStorage.setItem('fixit_user', JSON.stringify(userData));
            setUser(userData);
        } catch {
            logout();
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logout, refreshUser, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
