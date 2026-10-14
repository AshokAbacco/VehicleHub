// import { createContext, useContext, useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthModal } from '../components/auth/AuthModal.jsx';
// import { useAuth } from './AuthContext.jsx';
// import { roleRoutes } from '../utils/roleAccess.js';

// const AuthGateContext = createContext(null);

// export const AuthGateProvider = ({ children }) => {
//     const navigate = useNavigate();
//     const { isAuthenticated, login, completeAuth, user } = useAuth();
//     const [modalOpen, setModalOpen] = useState(false);
//     const [pendingAction, setPendingAction] = useState(null);
//     const [pendingIntent, setPendingIntent] = useState(null);

//     // Call this from any button: requireAuth(() => doTheRealThing(), intent)
//     // If already logged in, runs immediately. If not, opens the modal and
//     // runs the callback automatically once auth completes.
//     const requireAuth = useCallback((onSuccess, intent = null) => {
//         if (isAuthenticated) {
//             onSuccess?.();
//             return;
//         }
//         setPendingAction(onSuccess || null);
//         setPendingIntent(intent || null);
//         setModalOpen(true);
//     }, [isAuthenticated]);

//     const handleAuthComplete = async (userData, intentFromModal = null) => {
//         const nextUser = completeAuth?.(userData) || login?.(userData);
//         setModalOpen(false);
//         const intentUsed = pendingIntent || intentFromModal || null;

//         if (typeof pendingAction === 'function') {
//             try {
//                 pendingAction(nextUser, intentUsed);
//             } catch (e) {
//                 console.error('Pending action failed', e);
//             }
//         } else if (intentUsed === 'SELL') {
//             // If SELL intent and no pendingAction, check seller status and redirect accordingly
//             try {
//                 const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
//                 const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '');
//                 const apiBase = normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;
//                 const token = localStorage.getItem('vehiclehub_token');
//                 if (token) {
//                     const res = await fetch(`${apiBase}/sellers/${nextUser?.id}/seller-status`, {
//                         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
//                     });
//                     if (res.ok) {
//                         const json = await res.json();
//                         if (json?.success && json?.isSellerRegistered) {
//                             navigate('/seller/dashboard');
//                         } else {
//                             navigate('/seller-Register');
//                         }
//                         setPendingAction(null);
//                         setPendingIntent(null);
//                         return;
//                     }
//                 }
//             } catch (err) {
//                 console.error('Error checking seller status on auth complete', err);
//             }
//             // fallback
//             navigate('/seller-Register');
//         } else {
//             const destination = roleRoutes[nextUser?.role?.toLowerCase()] || '/';
//             navigate(destination);
//         }

//         setPendingAction(null);
//         setPendingIntent(null);
//     };

//     const handleClose = () => {
//         setModalOpen(false);
//         setPendingAction(null);
//         setPendingIntent(null);
//     };

//     return (
//         <AuthGateContext.Provider value={{ requireAuth, isAuthenticated, user }}>
//             {children}
//             {modalOpen && (
//                 <AuthModal onClose={handleClose} onComplete={handleAuthComplete} />
//             )}
//         </AuthGateContext.Provider>
//     );
// };

// export const useAuthGate = () => {
//     const ctx = useContext(AuthGateContext);
//     if (!ctx) throw new Error('useAuthGate must be used within AuthGateProvider');
//     return ctx;
// };
import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from '../components/auth/AuthModal.jsx';
import { useAuth } from './AuthContext.jsx';
import { roleRoutes } from '../utils/roleAccess.js';

const AuthGateContext = createContext(null);

export const AuthGateProvider = ({ children }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [pendingCallback, setPendingCallback] = useState(null);
    const [intent, setIntent] = useState(null);

    // Opens the modal and remembers what to run once auth completes.
    // This function NEVER calls navigate() itself — routing only happens
    // inside the caller's callback, after the modal has actually finished.
    const requireAuth = useCallback((callback, actionIntent = null) => {
        setPendingCallback(() => callback);
        setIntent(actionIntent);
        setModalOpen(true);
    }, []);

    const navigate = useNavigate();
    const { completeAuth, user, isAuthenticated } = useAuth();

    const handleComplete = async (user, completedIntent) => {
        setModalOpen(false);
        const cb = pendingCallback;
        setPendingCallback(null);
        setIntent(null);

        if (typeof cb === 'function') {
            // Caller will handle navigation
            try {
                cb(user, completedIntent);
            } catch (e) {
                console.error('Pending callback failed', e);
            }
            return;
        }

        // No pending callback: perform sensible default navigation
        // If SELL intent, check seller status and route accordingly
        if (completedIntent === 'SELL') {
            try {
                const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '');
                const apiBase = normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;
                const token = localStorage.getItem('vehiclehub_token');
                if (token && user?.id) {
                    const res = await fetch(`${apiBase}/sellers/${user.id}/seller-status`, {
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    });
                    if (res.ok) {
                        const json = await res.json();
                        if (json?.success && json?.isSellerRegistered) {
                            navigate('/seller/dashboard');
                            return;
                        }
                    }
                }
            } catch (err) {
                console.error('Error checking seller status on auth complete', err);
            }
            navigate('/seller-Register');
            return;
        }

        // Default: navigate based on role or home.
        // New buyer users created during email login stay on the home page,
        // but existing buyer users are sent to the buyer dashboard.
        const normalizedRole = String(user?.role || user?.userRole || 'buyer').toLowerCase().replace(/-/g, '_');
        if (normalizedRole === 'buyer' && user?.isNewUser) {
            navigate('/');
            return;
        }
        const destination = roleRoutes[normalizedRole] || '/';
        navigate(destination);
    };

    const handleClose = () => {
        // User dismissed the modal without finishing — do nothing else.
        // No route change, no partial redirect.
        setModalOpen(false);
        setPendingCallback(null);
        setIntent(null);
    };

    return (
        <AuthGateContext.Provider value={{ requireAuth, user, isAuthenticated }}>
            {children}
            {modalOpen && (
                <AuthModal
                    intent={intent}
                    onClose={handleClose}
                    onComplete={handleComplete}
                />
            )}
        </AuthGateContext.Provider>
    );
};

export const useAuthGate = () => {
    const ctx = useContext(AuthGateContext);
    if (!ctx) throw new Error('useAuthGate must be used within AuthGateProvider');
    return ctx;
};