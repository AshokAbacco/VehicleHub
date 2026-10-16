// VehicleHub/VehicleHub/src/pages/public/LoginPage.jsx
// Sign-in page (/login): email or mobile number + password. (OTP sign-in has been removed.)
// After signing in, everyone goes to their own dashboard (Admin, Seller, Dealer, Buyer,
// Field Inspector) — or back to the page / action that asked them to sign in.
import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Store, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAuthGate } from '../../context/AuthGateContext.jsx';
import { useLoginMutation } from '../../services/authApiSlice.js';
import { dashboardPathFor } from '../../utils/roleAccess.js';

const inputClass =
    'w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#001f3f] focus:bg-white focus:outline-none';

export const AuthShell = ({ title, subtitle, children, footer }) => (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-4 py-10 text-slate-900">
        <div className="w-full max-w-md">
            <Link to="/" className="mx-auto mb-6 flex w-fit items-center gap-2 text-lg font-extrabold text-[#001f3f]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#001f3f] text-white"><ShieldCheck size={18} /></span>
                VehicleHub
            </Link>
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70 sm:p-9">
                <h1 className="text-center text-2xl font-extrabold text-slate-900">{title}</h1>
                {subtitle && <p className="mx-auto mt-2 max-w-sm text-center text-sm text-slate-500">{subtitle}</p>}
                {children}
            </div>
            {footer}
        </div>
    </div>
);

export const FormError = ({ message }) =>
    message ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> <span>{message}</span>
        </div>
    ) : null;

export const PasswordInput = ({ value, onChange, name = 'password', placeholder = 'Password', autoComplete = 'current-password' }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
                type={show ? 'text' : 'password'}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required
                className={`${inputClass} pr-11`}
            />
            <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-700"
                aria-label={show ? 'Hide password' : 'Show password'}
            >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
};

export const LoginPage = () => {
    const location = useLocation();
    const { isAuthenticated, user, completeAuth } = useAuth();
    const { completeLogin } = useAuthGate();
    const [login, { isLoading }] = useLoginMutation();
    const [form, setForm] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [signingIn, setSigningIn] = useState(false); // stops the 'already signed in' redirect racing the post-login one

    // Opened while already signed in -> straight to their dashboard
    if (isAuthenticated && !signingIn) return <Navigate to={dashboardPathFor(user?.role)} replace />;

    const onChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.identifier.trim() || !form.password) {
            setError('Enter your email or mobile number and your password.');
            return;
        }
        try {
            setSigningIn(true);
            const res = await login({ identifier: form.identifier.trim(), password: form.password }).unwrap();
            const signedIn = completeAuth(res?.data?.user, res?.data?.accessToken);
            await completeLogin(signedIn, location.state || {});
        } catch (err) {
            setSigningIn(false);
            setError(err?.data?.message || (err?.status === 'FETCH_ERROR' ? "Can't reach the server. Please try again." : 'Sign-in failed. Please try again.'));
        }
    };

    return (
        <AuthShell
            title="Sign in to VehicleHub"
            subtitle="Use your email or mobile number and password."
            footer={
                <div className="mt-5 space-y-2 text-center text-sm text-slate-500">
                    <p>
                        New to VehicleHub?{' '}
                        <Link to="/register" state={location.state} className="font-semibold text-[#001f3f] hover:underline">Create an account</Link>
                    </p>
                    <p className="flex items-center justify-center gap-1.5">
                        <Store size={14} className="text-slate-400" /> Want to sell?{' '}
                        <Link to="/seller-Register" className="font-semibold text-[#001f3f] hover:underline">Register as a seller</Link>
                    </p>
                </div>
            }
        >
            <Helmet><title>Sign in | VehicleHub</title></Helmet>
            <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
                <FormError message={error} />
                <div>
                    <label htmlFor="identifier" className="mb-1.5 block text-sm font-semibold text-slate-700">Email or mobile number</label>
                    <div className="relative">
                        <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            id="identifier"
                            name="identifier"
                            value={form.identifier}
                            onChange={onChange}
                            placeholder="you@example.com or 98765 43210"
                            autoComplete="username"
                            autoFocus
                            required
                            className={inputClass}
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                    <PasswordInput value={form.password} onChange={onChange} />
                    <p className="mt-1.5 text-right text-xs text-slate-400">Forgot your password? Contact the VehicleHub admin.</p>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f3f] py-3 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:bg-[#002a55] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Sign in <ArrowRight size={15} /></>}
                </button>
            </form>
        </AuthShell>
    );
};