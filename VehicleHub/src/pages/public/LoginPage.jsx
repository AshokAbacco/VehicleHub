// VehicleHub/VehicleHub/src/pages/public/LoginPage.jsx
// Real sign-in page (/login and /register). It opens the same phone / email OTP popup as the
// navbar. A new phone number or email creates a Buyer account; Sellers and Dealers are approved
// by the admin, and Admin / Field Inspector accounts are created by the admin.
import { useEffect, useRef } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Smartphone, Mail, ArrowRight, Store, ShoppingBag, ClipboardCheck, LayoutDashboard, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAuthGate } from '../../context/AuthGateContext.jsx';
import { dashboardPathFor, normalizeRole } from '../../utils/roleAccess.js';

const ROLES = [
    { icon: ShoppingBag, title: 'Buyers', text: 'Browse, save and send purchase requests.' },
    { icon: Store, title: 'Sellers', text: 'Individuals listing one vehicle, after admin approval.' },
    { icon: Building2, title: 'Dealers', text: 'Shops managing many vehicles, after admin approval.' },
    { icon: ClipboardCheck, title: 'Field Inspectors', text: 'Verify vehicles on site.' },
    { icon: LayoutDashboard, title: 'Admin', text: 'Run the marketplace.' },
];

export const LoginPage = ({ mode = 'login' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const { requireAuth } = useAuthGate();
    const openedOnce = useRef(false);
    const from = location.state?.from;

    // Where to go after signing in: the page that asked for it (if this role may open it), else the role's dashboard
    const destinationFor = (u) => {
        const home = dashboardPathFor(u?.role);
        const role = normalizeRole(u?.role);
        const area = { admin: '/admin', seller: '/seller', dealer: '/dealer', buyer: '/buyer', inspector: '/field-inspector' }[role];
        const protectedArea = ['/admin', '/seller', '/dealer', '/buyer', '/field-inspector'].find((p) => from?.startsWith(p));
        if (from && (!protectedArea || protectedArea === area)) return from;
        return home;
    };

    const openSignIn = () => requireAuth((signedIn) => navigate(destinationFor(signedIn), { replace: true }));

    // Open the sign-in popup straight away
    useEffect(() => {
        if (!isAuthenticated && !openedOnce.current) {
            openedOnce.current = true;
            openSignIn();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    if (isAuthenticated) return <Navigate to={destinationFor(user)} replace />;

    const isRegister = mode === 'register';

    return (
        <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-4 py-12 text-slate-900">
            <Helmet><title>{isRegister ? 'Create account' : 'Sign in'} | VehicleHub</title></Helmet>
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-xl shadow-slate-200/70 backdrop-blur sm:p-9">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f2ff] text-[#001f3f] ring-8 ring-[#e6f2ff]/50">
                    <ShieldCheck size={26} />
                </div>
                <h1 className="mt-5 text-center text-2xl font-extrabold text-slate-900">
                    {isRegister ? 'Create your VehicleHub account' : 'Sign in to VehicleHub'}
                </h1>
                <p className="mx-auto mt-2 max-w-sm text-center text-sm text-slate-500">
                    {isRegister
                        ? 'Verify your mobile number or email with a one-time code — your buyer account is created automatically.'
                        : 'Use your mobile number or email. We send a one-time code — no password needed.'}
                </p>

                <button
                    onClick={openSignIn}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f3f] py-3 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:-translate-y-0.5 hover:bg-[#002a55]"
                >
                    <Smartphone size={16} /> Continue with phone or <Mail size={16} /> email <ArrowRight size={15} />
                </button>

                <div className="mt-7 grid grid-cols-2 gap-2.5">
                    {ROLES.map((r) => {
                        const Icon = r.icon;
                        return (
                            <div key={r.title} className="rounded-xl border border-slate-100 bg-slate-50 p-3 last:col-span-2">
                                <p className="flex items-center gap-1.5 text-xs font-bold text-slate-800"><Icon size={13} className="text-[#001f3f]" /> {r.title}</p>
                                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{r.text}</p>
                            </div>
                        );
                    })}
                </div>

                <p className="mt-6 text-center text-xs text-slate-400">
                    Want to sell? Sign in, then use <span className="font-semibold text-slate-600">SELL</span> to apply.{' '}
                    <Link to="/" className="font-semibold text-[#001f3f] hover:underline">Back to home</Link>
                </p>
            </div>
        </div>
    );
};