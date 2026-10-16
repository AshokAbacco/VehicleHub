// VehicleHub/VehicleHub/src/context/AuthContext.jsx
// Session = { user, token } in localStorage. Users sign in with phone / email OTP (AuthModal).
// On page load the session is checked against GET /api/auth/me so the role stays in sync
// (e.g. an admin approves a seller application, or deactivates an account).
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { dashboardPathFor, normalizeRole } from '../utils/roleAccess.js';

const normalizeUser = (nextUser) => {
    if (!nextUser) return null;
    const normalizedRole = normalizeRole(nextUser.role || nextUser.userRole || 'BUYER');
    return {
        ...nextUser,
        password: undefined,
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
        const token = window.localStorage.getItem('vehiclehub_token');
        // A saved user without a token is an old demo session — it can't call the API
        if (saved && !token) {
            window.localStorage.removeItem('vehiclehub_user');
            return null;
        }
        return saved ? normalizeUser(JSON.parse(saved)) : null;
    } catch {
        return null;
    }
};

const apiBase = () => {
    const raw = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
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

    const logout = useCallback(() => {
        persistSession(null);
    }, [persistSession]);

    const completeAuth = useCallback((userData, token) => {
        if (!userData) return null;
        return persistSession(userData, token);
    }, [persistSession]);

    // Re-read the account from the server (role, name, phone…)
    const refreshUser = useCallback(async () => {
        const token = window.localStorage.getItem('vehiclehub_token');
        if (!token) return null;
        try {
            const res = await fetch(`${apiBase()}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.status === 401) {
                // Token no longer valid (signed out elsewhere, account deactivated…)
                persistSession(null);
                return null;
            }
            if (!res.ok) return null;
            const json = await res.json();
            const fresh = json?.data?.user;
            if (!fresh) return null;
            const stored = getStoredUser() || {};
            return persistSession({ ...stored, ...fresh, name: fresh.fullName || stored.name }, token);
        } catch {
            return null; // server unreachable — keep the current session
        }
    }, [persistSession]);

    // Sync once when the app loads
    useEffect(() => {
        if (user) refreshUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = useMemo(() => ({
        user,
        logout,
        completeAuth,
        refreshUser,
        isAuthenticated: Boolean(user),
        getDashboardPath: () => dashboardPathFor(user?.role || user?.userRole),
    }), [user, logout, completeAuth, refreshUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);