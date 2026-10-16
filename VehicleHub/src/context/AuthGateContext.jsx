// VehicleHub/VehicleHub/src/context/AuthGateContext.jsx
// ============================================================
// "Sign in to continue" for actions that need an account (wishlist, SELL, send request…).
//
// requireAuth(callback, intent):
//   - signed in  -> runs callback(user) straight away
//   - signed out -> opens the /login page and remembers the callback; after a successful
//                   sign-in, completeLogin() brings the user back and runs it
//
// completeLogin(user) is called by the login / register pages. Where it sends the user:
//   1. a pending action      -> back to the page they were on, then the action runs
//   2. intent "SELL"         -> seller area (dashboard if approved, else the registration page)
//   3. a protected page they were sent away from (if their role may open it)
//   4. otherwise             -> their own dashboard (by role)
// ============================================================
import { createContext, useCallback, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { dashboardPathFor, normalizeRole } from '../utils/roleAccess.js';
import { openSellerArea } from '../utils/sellerStatus.js';

const AuthGateContext = createContext(null);

// Which URL prefix each role may open
const ROLE_AREAS = {
    admin: '/admin',
    seller: '/seller',
    dealer: '/dealer',
    buyer: '/buyer',
    inspector: '/field-inspector',
};
const PROTECTED_AREAS = Object.values(ROLE_AREAS);

export const AuthGateProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, completeAuth } = useAuth();

    // Survives the trip to /login and back (this provider sits above all routes)
    const pending = useRef({ callback: null, intent: null, from: null });

    const requireAuth = useCallback((callback, intent = null) => {
        if (isAuthenticated && user) {
            if (typeof callback === 'function') callback(user, intent);
            return;
        }
        const from = location.pathname + location.search;
        pending.current = { callback: typeof callback === 'function' ? callback : null, intent, from };
        navigate('/login', { state: { from, intent } });
    }, [isAuthenticated, user, location.pathname, location.search, navigate]);

    const completeLogin = useCallback(async (signedInUser, { from: stateFrom, intent: stateIntent } = {}) => {
        const { callback, intent: pendingIntent, from: pendingFrom } = pending.current;
        pending.current = { callback: null, intent: null, from: null };
        const from = pendingFrom || stateFrom || null;
        const intent = pendingIntent || stateIntent || null;
        const role = normalizeRole(signedInUser?.role);

        if (callback) {
            navigate(from && from !== '/login' ? from : '/', { replace: true });
            try {
                callback(signedInUser, intent);
            } catch (e) {
                console.error('Pending action failed after sign-in', e);
            }
            return;
        }

        if (intent === 'SELL') {
            await openSellerArea({ navigate, user: signedInUser, completeAuth });
            return;
        }

        // Back to the page they asked for — public pages always, protected ones only for the right role
        const protectedArea = PROTECTED_AREAS.find((p) => from?.startsWith(p));
        if (from && from !== '/login' && from !== '/register' && (!protectedArea || protectedArea === ROLE_AREAS[role])) {
            if (protectedArea) {
                navigate(from, { replace: true });
                return;
            }
        }
        if (from === '/seller-Register') {
            navigate(from, { replace: true });
            return;
        }
        navigate(dashboardPathFor(role), { replace: true });
    }, [navigate, completeAuth]);

    return (
        <AuthGateContext.Provider value={{ requireAuth, completeLogin, user, isAuthenticated }}>
            {children}
        </AuthGateContext.Provider>
    );
};

export const useAuthGate = () => {
    const ctx = useContext(AuthGateContext);
    if (!ctx) throw new Error('useAuthGate must be used within AuthGateProvider');
    return ctx;
};