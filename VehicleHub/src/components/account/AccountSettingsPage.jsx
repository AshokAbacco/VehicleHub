// VehicleHub/VehicleHub/src/components/account/AccountSettingsPage.jsx
// Settings — the same page for every login (Admin, Seller, Dealer, Buyer, Field Inspector):
//   - profile details (name, email, mobile number, address) with Edit
//   - Change password -> the Forgot Password page (a code is emailed; no password form here)
// Data: GET / PATCH /api/auth/account. Sellers' and Dealers' address is the one on their
// Business Profile, so both pages always show the same address.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import {
    Settings, User, Mail, Phone, MapPin, Pencil, X, Save, Loader2, KeyRound, ShieldCheck, Calendar, Store, ArrowRight,
} from 'lucide-react';
import { useGetAccountQuery, useUpdateAccountMutation } from '../../services/authApiSlice.js';
import { useAuth } from '../../context/AuthContext.jsx';

const ROLE_LABEL = { ADMIN: 'Admin', SELLER: 'Seller', DEALER: 'Dealer', BUYER: 'Buyer', INSPECTOR: 'Field Inspector' };
const STATES = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
    'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const inputCls = (err) =>
    `w-full rounded-xl border-2 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none ${err ? 'border-red-300' : 'border-slate-200 focus:border-[#001f3f]'}`;
const since = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—');
const maskEmail = (e = '') => {
    const [n, d] = e.split('@');
    return d ? `${n.slice(0, 2)}${'*'.repeat(Math.max(3, n.length - 2))}@${d}` : e;
};
const toForm = (a) => ({
    fullName: a?.fullName || '',
    email: a?.email || '',
    phone: (a?.phone || '').replace(/^\+91/, ''),
    address: a?.address || '',
    city: a?.city || '',
    state: a?.state || '',
    pincode: a?.pincode || '',
});

const Row = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Icon size={15} /></span>
        <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">{label}</p>
            <p className={`break-words text-sm font-semibold ${value ? 'text-slate-800' : 'font-normal italic text-slate-400'}`}>{value || 'Not added'}</p>
        </div>
    </div>
);

const Field = ({ label, error, children, className = '' }) => (
    <label className={`block ${className}`}>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
        {children}
        {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
);

/** businessProfilePath: Sellers/Dealers' Business Profile page (shown as a link). */
export const AccountSettingsPage = ({ businessProfilePath }) => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const { data, isLoading, isError, refetch } = useGetAccountQuery();
    const [save, { isLoading: saving }] = useUpdateAccountMutation();
    const account = data?.data;

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(toForm(null));
    const [errors, setErrors] = useState({});

    const startEdit = () => { setForm(toForm(account)); setErrors({}); setEditing(true); };
    const cancel = () => { setEditing(false); setErrors({}); };
    const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

    const check = () => {
        const e = {};
        if (form.fullName.trim().length < 2) e.fullName = 'Enter your full name.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'Enter a valid email address.';
        if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, ''))) e.phone = 'Enter a valid 10-digit mobile number.';
        if (form.pincode.trim() && !/^[1-9]\d{5}$/.test(form.pincode.trim())) e.pincode = 'Enter a valid 6-digit PIN code.';
        return e;
    };

    const onSave = async (ev) => {
        ev.preventDefault();
        const e = check();
        setErrors(e);
        if (Object.keys(e).length) return;
        const emailChanged = form.email.trim().toLowerCase() !== (account?.email || '').toLowerCase();
        if (emailChanged && !window.confirm(`Change your email to ${form.email.trim()}? Sign-in codes and account emails will go to the new address.`)) return;
        try {
            const res = await save({
                ...form,
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, ''),
            }).unwrap();
            toast.success(res?.message || 'Saved');
            setEditing(false);
            refreshUser?.(); // name / email in the header
        } catch (err) {
            if (err?.data?.errors) setErrors(err.data.errors);
            toast.error(err?.status === 'FETCH_ERROR' ? "Can't reach the server. Please try again." : err?.data?.message || 'Could not save your details');
        }
    };

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" /></div>;
    if (isError || !account) {
        return (
            <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 text-sm text-red-600">
                Couldn't load your settings.
                <button type="button" onClick={refetch} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold">Try again</button>
            </div>
        );
    }

    const fullAddress = [account.address, account.city, account.state, account.pincode].filter(Boolean).join(', ');
    const initials = (account.fullName || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="space-y-6">
            <Helmet><title>Settings | MotorDesk</title></Helmet>
            <div className="animate-fadeInUp">
                <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><Settings size={22} className="text-[#001f3f]" /> Settings</h1>
                <p className="text-sm text-slate-500">Your profile details and account security.</p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                {/* Profile */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
                        <div className="flex min-w-0 items-center gap-4">
                            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#001f3f] text-lg font-bold text-white">{initials}</span>
                            <div className="min-w-0">
                                <p className="truncate text-lg font-extrabold text-slate-900">{account.fullName}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="rounded-full bg-[#e6f2ff] px-2.5 py-0.5 font-semibold text-[#001f3f]">{ROLE_LABEL[account.role] || account.role}</span>
                                    <span className="flex items-center gap-1 text-slate-500"><Calendar size={12} /> Member since {since(account.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        {!editing && (
                            <button type="button" onClick={startEdit} className="flex items-center gap-1.5 rounded-xl border-2 border-[#001f3f] px-4 py-2 text-sm font-bold text-[#001f3f] transition hover:bg-[#e6f2ff]">
                                <Pencil size={14} /> Edit profile
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <form onSubmit={onSave} noValidate className="space-y-5 p-5 sm:p-6">
                            <div>
                                <p className="mb-3 text-sm font-bold text-slate-900">Personal details</p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Full name" error={errors.fullName} className="sm:col-span-2">
                                        <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} autoComplete="name" className={inputCls(errors.fullName)} />
                                    </Field>
                                    <Field label="Email" error={errors.email}>
                                        <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" className={inputCls(errors.email)} />
                                    </Field>
                                    <Field label="Mobile number" error={errors.phone}>
                                        <div className="flex">
                                            <span className="flex items-center rounded-l-xl border-2 border-r-0 border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-500">+91</span>
                                            <input inputMode="numeric" value={form.phone} onChange={(e) => set('phone', e.target.value.replace(/[^\d\s]/g, '').slice(0, 12))} autoComplete="tel-national" className={`${inputCls(errors.phone)} rounded-l-none`} />
                                        </div>
                                    </Field>
                                </div>
                            </div>
                            <div>
                                <p className="mb-3 text-sm font-bold text-slate-900">Address</p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Street address" error={errors.address} className="sm:col-span-2">
                                        <textarea rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="House / building, street, area" autoComplete="street-address" className={`${inputCls(errors.address)} resize-none`} />
                                    </Field>
                                    <Field label="City" error={errors.city}>
                                        <input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="e.g. Bengaluru" autoComplete="address-level2" className={inputCls(errors.city)} />
                                    </Field>
                                    <Field label="State" error={errors.state}>
                                        <select value={form.state} onChange={(e) => set('state', e.target.value)} className={inputCls(errors.state)}>
                                            <option value="">Select state</option>
                                            {form.state && !STATES.includes(form.state) && <option value={form.state}>{form.state}</option>}
                                            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="PIN code" error={errors.pincode}>
                                        <input inputMode="numeric" value={form.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6 digits" autoComplete="postal-code" className={inputCls(errors.pincode)} />
                                    </Field>
                                </div>
                                {account.business && <p className="mt-2 text-xs text-slate-500">This is also the address on your Business Profile.</p>}
                            </div>
                            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                                <button type="button" onClick={cancel} className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                                    <X size={15} /> Cancel
                                </button>
                                <button type="submit" disabled={saving} className="flex items-center justify-center gap-1.5 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#002a55] disabled:opacity-60">
                                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid divide-y divide-slate-100 px-5 sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0 sm:px-6 sm:py-2">
                            <Row icon={User} label="Full name" value={account.fullName} />
                            <Row icon={Mail} label="Email" value={account.email} />
                            <Row icon={Phone} label="Mobile number" value={account.phone} />
                            <Row icon={MapPin} label="Address" value={fullAddress} />
                        </div>
                    )}
                </section>

                <div className="space-y-6">
                    {/* Security */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]"><ShieldCheck size={16} /></span>
                            <h2 className="text-base font-bold text-slate-900">Password & security</h2>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">
                            To change your password we'll email a 6-digit code to <strong className="text-slate-800">{maskEmail(account.email)}</strong>, then you choose a new password.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/forgot-password', { state: { identifier: account.email } })}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f3f] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#002a55]"
                        >
                            <KeyRound size={15} /> Change password
                        </button>
                    </section>

                    {/* Sellers / Dealers: business details live on Business Profile */}
                    {account.business && businessProfilePath && (
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><Store size={16} /></span>
                                <h2 className="text-base font-bold text-slate-900">Business details</h2>
                            </div>
                            <p className="mt-3 text-sm text-slate-600">
                                {account.business.businessName ? <><strong className="text-slate-800">{account.business.businessName}</strong> — shop</> : 'Shop'} name, GST, WhatsApp, bank and documents are on your Business Profile.
                            </p>
                            <Link to={businessProfilePath} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#001f3f] hover:underline">
                                Open Business Profile <ArrowRight size={14} />
                            </Link>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};