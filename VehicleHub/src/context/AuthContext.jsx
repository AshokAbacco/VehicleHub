import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { initialUsers } from '../data/mockData.js';
import { roleRoutes } from '../utils/roleAccess.js';

const normalizeUser = (nextUser) => {
    if (!nextUser) return null;
    const role = nextUser.role || nextUser.userRole || 'BUYER';
    const normalizedRole = String(role).toLowerCase().replace(/-/g, '_');
    return {
        ...nextUser,
        name: nextUser.name || nextUser.fullName || nextUser.firstName || 'User',
        role: normalizedRole,
        userRole: normalizedRole,
    };
};

const AuthContext = createContext(null);

const getStoredUser = () => {
    if (typeof window === 'undefined') return null;
    try {
        const saved = window.localStorage.getItem('vehiclehub_user');
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser);

    const persistSession = useCallback((nextUser, token) => {
        if (typeof window === 'undefined') return;
        if (nextUser) {
            const normalizedUser = normalizeUser(nextUser);
            window.localStorage.setItem('vehiclehub_user', JSON.stringify(normalizedUser));
            if (token) {
                window.localStorage.setItem('vehiclehub_token', token);
            }
            setUser(normalizedUser);
            return normalizedUser;
        }

        window.localStorage.removeItem('vehiclehub_user');
        window.localStorage.removeItem('vehiclehub_token');
        setUser(null);
        return null;
    }, []);

    const login = useCallback((email, password) => {
        const found = initialUsers.find((entry) => entry.email === email && entry.password === password);
        if (found) {
            return persistSession(found);
        }
        return null;
    }, [persistSession]);

    const logout = useCallback(() => {
        persistSession(null);
    }, [persistSession]);

    const completeAuth = useCallback((userData, token) => {
        if (!userData) return null;
        return persistSession(userData, token);
    }, [persistSession]);

    const value = useMemo(() => ({
        user,
        login,
        logout,
        completeAuth,
        isAuthenticated: Boolean(user),
        getDashboardPath: () => {
            const role = (user?.role || user?.userRole || 'buyer').toLowerCase();
            if (role === 'seller') return '/seller/dashboard';
            return roleRoutes[role] || '/buyer/dashboard';
        },
    }), [user, login, logout, completeAuth]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
