// VehicleHub/VehicleHub/src/pages/public/RegisterPage.jsx
// Sign-up page (/register): creates a Buyer account (name, email, mobile number, password) and
// signs the user in. To sell, use /seller-Register (open to everyone — visitors create their
// login on that form). Admin and Field Inspector accounts are created by the admin.
import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Mail, Phone, Loader2, ArrowRight, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAuthGate } from '../../context/AuthGateContext.jsx';
import { useRegisterMutation } from '../../services/authApiSlice.js';
import { dashboardPathFor } from '../../utils/roleAccess.js';
import { AuthShell, FormError, PasswordInput } from './LoginPage.jsx';

const inputClass =
    'w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#001f3f] focus:bg-white focus:outline-none';

const IconInput = ({ icon: Icon, label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
        <div className="relative">
            <Icon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id={props.name} required className={inputClass} {...props} />
        </div>
    </div>
);

export const RegisterPage = () => {
    const location = useLocation();
    const { isAuthenticated, user, completeAuth } = useAuth();
    const { completeLogin } = useAuthGate();
    const [register, { isLoading }] = useRegisterMutation();
    const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [signingUp, setSigningUp] = useState(false); // stops the 'already signed in' redirect racing the post-login one

    if (isAuthenticated && !signingUp) return <Navigate to={dashboardPathFor(user?.role)} replace />;

    const onChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
            setError('Please fill in all the fields.');
            return;
        }
        if (form.password.length < 8) return setError('Password must be at least 8 characters.');
        if (form.password !== form.confirmPassword) return setError('The two passwords do not match.');
        try {
            setSigningUp(true);
            const res = await register({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                password: form.password,
            }).unwrap();
            const signedIn = completeAuth(res?.data?.user, res?.data?.accessToken);
            await completeLogin(signedIn, location.state || {});
        } catch (err) {
            setSigningUp(false);
            setError(err?.data?.message || (err?.status === 'FETCH_ERROR' ? "Can't reach the server. Please try again." : 'Sign-up failed. Please try again.'));
        }
    };

    return (
        <AuthShell
            title="Create your account"
            subtitle="Browse, save vehicles and send purchase requests."
            footer={
                <div className="mt-5 space-y-2 text-center text-sm text-slate-500">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" state={location.state} className="font-semibold text-[#001f3f] hover:underline">Sign in</Link>
                    </p>
                    <p className="flex items-center justify-center gap-1.5">
                        <Store size={14} className="text-slate-400" /> Want to sell?{' '}
                        <Link to="/seller-Register" className="font-semibold text-[#001f3f] hover:underline">Register as a seller</Link>
                    </p>
                </div>
            }
        >
            <Helmet><title>Create account | VehicleHub</title></Helmet>
            <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
                <FormError message={error} />
                <IconInput icon={User} label="Full name" name="fullName" value={form.fullName} onChange={onChange} placeholder="Your name" autoComplete="name" autoFocus />
                <IconInput icon={Mail} label="Email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" autoComplete="email" />
                <IconInput icon={Phone} label="Mobile number" name="phone" type="tel" value={form.phone} onChange={onChange} placeholder="98765 43210" autoComplete="tel" />
                <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                    <PasswordInput value={form.password} onChange={onChange} placeholder="At least 8 characters" autoComplete="new-password" />
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm password</label>
                    <PasswordInput name="confirmPassword" value={form.confirmPassword} onChange={onChange} placeholder="Type it again" autoComplete="new-password" />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f3f] py-3 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:bg-[#002a55] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Create account <ArrowRight size={15} /></>}
                </button>
            </form>
        </AuthShell>
    );
};