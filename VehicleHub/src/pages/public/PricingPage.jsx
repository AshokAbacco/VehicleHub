// VehicleHub/VehicleHub/src/pages/public/PricingPage.jsx
// Pricing (/pricing): Premium plan for Urban (₹500/month) or Rural (₹350/month) areas, billed for
// 1, 3, 6 or 12 months. "Get Premium" opens a short form -> Razorpay Checkout -> the backend
// verifies the payment -> /seller-Register opens with the details filled in.
// The amount is always recalculated and checked on the backend; the browser's success
// callback is never treated as proof of payment.
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Check, Crown, Building2, Trees, X, Store, User, Phone, Mail, Loader2, Lock, AlertCircle, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
    useGetPricingPlansQuery, useCreatePlanOrderMutation, useVerifyPlanPaymentMutation, useCheckPlanAccountMutation,
    PLAN_MONTHLY_PRICE, PLAN_DURATIONS, savePlanPrefill,
} from '../../services/pricingApiSlice.js';
import { loadRazorpay } from '../../utils/razorpay.js';
import { formatCurrency } from '../../utils/formatters.js';

const LOCATIONS = [
    { value: 'URBAN', label: 'Urban Cities', hint: 'Metros and city limits', icon: Building2 },
    { value: 'RURAL', label: 'Rural Areas', hint: 'Towns and villages', icon: Trees },
];

const PREMIUM_FEATURES = [
    'Dealer dashboard to manage your shop inventory',
    'List your vehicles to buyers across VehicleHub',
    'Purchase requests from buyers, with alerts',
    'Buyer enquiries straight to your WhatsApp',
    'Request field inspections for your vehicles',
    'Priority support from the MotorDesk team',
];

const durationName = (m) => (m === 12 ? '12 months (Yearly)' : m === 1 ? '1 month' : `${m} months`);

// ---------- form validation (the backend checks the same rules) ----------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const validate = (f) => {
    const e = {};
    const shop = f.shopName.trim();
    const name = f.fullName.trim();
    let digits = f.phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    if (!shop) e.shopName = 'Please enter your shop name.';
    else if (shop.length < 2 || shop.length > 100) e.shopName = 'Shop name must be between 2 and 100 characters.';
    if (!name) e.fullName = 'Please enter your full name.';
    else if (name.length < 2 || name.length > 100) e.fullName = 'Full name must be between 2 and 100 characters.';
    if (!f.phone.trim()) e.phone = 'Please enter your phone number.';
    else if (!/^[6-9]\d{9}$/.test(digits)) e.phone = 'Please enter a valid 10-digit mobile number.';
    if (!f.email.trim()) e.email = 'Please enter your email address.';
    else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Please enter a valid email address.';
    return e;
};

const errorText = (err, fallback) =>
    err?.status === 'FETCH_ERROR'
        ? "Can't reach the server. Please check your connection and try again."
        : `${err?.data?.message || fallback}${err?.data?.detail ? ` (${err.data.detail})` : ''}`; // detail only comes in development

// ============================================================
export const PricingPage = () => {
    const [location, setLocation] = useState('URBAN');
    const [months, setMonths] = useState(1);
    const [formOpen, setFormOpen] = useState(false);
    const { data } = useGetPricingPlansQuery();

    const monthly = data?.data?.monthly?.[location] ?? PLAN_MONTHLY_PRICE[location];
    const total = monthly * months;

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-4 py-10 text-slate-900 sm:py-14 lg:px-8">
            <Helmet>
                <title>Pricing | VehicleHub</title>
            </Helmet>

            <div className="mx-auto max-w-5xl">
                <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#001f3f]/60">Pricing</p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Simple pricing for your vehicle shop</h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
                        One Premium plan, priced for where you sell. Choose your area and how long you want to subscribe.
                    </p>
                </div>

                {/* Location */}
                <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-3" role="radiogroup" aria-label="Location">
                    {LOCATIONS.map(({ value, label, hint, icon: Icon }) => {
                        const active = location === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => setLocation(value)}
                                className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left transition sm:px-4 ${active ? 'border-[#001f3f] bg-white shadow-md shadow-[#001f3f]/10' : 'border-slate-200 bg-white/70 hover:border-slate-300'}`}
                            >
                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-[#001f3f] text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <Icon size={18} />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-bold text-slate-900">{label}</span>
                                    <span className="block truncate text-xs text-slate-500">{hint}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Duration tabs */}
                <div className="mt-5 flex justify-center">
                    <div role="tablist" aria-label="Subscription duration" className="inline-flex w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                        {PLAN_DURATIONS.map((d) => {
                            const active = months === d.months;
                            return (
                                <button
                                    key={d.months}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => setMonths(d.months)}
                                    className={`flex-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${active ? 'bg-[#001f3f] text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {d.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Premium plan */}
                <div className="mx-auto mt-8 max-w-xl">
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
                        <div className="bg-gradient-to-br from-[#001f3f] via-[#002d5c] to-[#003d7a] px-6 py-6 text-white sm:px-8">
                            <div className="flex items-center justify-between gap-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                                    <Crown size={13} /> Premium
                                </span>
                                <span className="text-xs font-medium text-cyan-100">
                                    {location === 'URBAN' ? 'Urban Cities' : 'Rural Areas'}
                                </span>
                            </div>
                            <div className="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1">
                                <span className="text-4xl font-black tracking-tight sm:text-5xl" data-testid="plan-total">{formatCurrency(total)}</span>
                                <span className="pb-1.5 text-sm text-cyan-100">for {durationName(months)}</span>
                            </div>
                            <p className="mt-1 text-sm text-cyan-100">
                                {formatCurrency(monthly)} per month{months > 1 ? ` × ${months} months` : ''}
                            </p>
                        </div>

                        <div className="px-6 py-6 sm:px-8">
                            <ul className="space-y-3">
                                {PREMIUM_FEATURES.map((f) => (
                                    <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                            <Check size={13} />
                                        </span>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button
                                type="button"
                                onClick={() => setFormOpen(true)}
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f3f] py-3.5 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:bg-[#002a55]"
                            >
                                <Crown size={16} /> Get Premium — {formatCurrency(total)}
                            </button>
                            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                                <Lock size={12} /> Secure payment by Razorpay
                            </p>
                        </div>
                    </div>

                    {/* All durations for the chosen area */}
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {PLAN_DURATIONS.map((d) => (
                            <button
                                key={d.months}
                                type="button"
                                onClick={() => setMonths(d.months)}
                                className={`rounded-2xl border bg-white px-3 py-3 text-center transition ${months === d.months ? 'border-[#001f3f] ring-2 ring-[#001f3f]/10' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                                <span className="block text-xs font-semibold text-slate-500">{d.label}</span>
                                <span className="mt-0.5 block text-base font-extrabold text-slate-900">{formatCurrency(monthly * d.months)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {formOpen && (
                <PlanCheckoutModal
                    location={location}
                    months={months}
                    amount={total}
                    onClose={() => setFormOpen(false)}
                />
            )}
        </div>
    );
};

// ============================================================
// Form -> Razorpay -> backend verification -> /seller-Register
// ============================================================
const Field = ({ id, label, icon: Icon, error, ...props }) => (
    <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
        <div className="relative">
            <Icon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
                id={id}
                aria-invalid={!!error}
                className={`w-full rounded-xl border-2 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none ${error ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-[#001f3f]'}`}
                {...props}
            />
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
);

const PlanCheckoutModal = ({ location, months, amount, onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [form, setForm] = useState({
        shopName: '',
        fullName: user?.fullName || user?.name || '',
        phone: (user?.phone || '').replace(/^\+91/, ''),
        email: user?.email || '',
    });
    const [errors, setErrors] = useState({});
    const [stage, setStage] = useState('form'); // form | paying | verifying
    const [message, setMessage] = useState(null); // { type: 'error' | 'info', text }
    const [createOrder] = useCreatePlanOrderMutation();
    const [checkAccount] = useCheckPlanAccountMutation();
    // email / phone that already belong to another account -> payment is blocked
    const [taken, setTaken] = useState({ email: false, phone: false });
    const accountExists = taken.email || taken.phone;
    const [verifyPayment] = useVerifyPlanPaymentMutation();
    const busy = stage !== 'form';

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape' && !busy) onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [busy, onClose]);

    const summary = useMemo(
        () => `Premium · ${location === 'URBAN' ? 'Urban' : 'Rural'} · ${durationName(months)}`,
        [location, months],
    );

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
        if (taken[name]) setTaken((t) => ({ ...t, [name]: false }));
        if (message?.type === 'error') setMessage(null);
    };

    // Leaving the email / phone box -> check it isn't already registered
    const onCheckBlur = async (e) => {
        const { name } = e.target;
        const value = form[name].trim();
        if (!value || validate({ ...form, [name]: value })[name]) return; // empty or not valid yet
        try {
            const res = await checkAccount({ [name]: value }).unwrap();
            if (form[name].trim() !== value) return; // changed while checking
            const msg = res?.data?.errors?.[name];
            setTaken((t) => ({ ...t, [name]: Boolean(msg) }));
            if (msg) setErrors((er) => ({ ...er, [name]: msg }));
        } catch {
            /* the server checks again when paying */
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const found = validate(form);
        if (accountExists) {
            if (taken.email) found.email = errors.email;
            if (taken.phone) found.phone = errors.phone;
        }
        setErrors(found);
        if (Object.keys(found).length) return;
        setMessage(null);
        setStage('paying');

        // 1) Order from the backend (amount worked out there)
        let order;
        try {
            const res = await createOrder({
                shopName: form.shopName.trim(),
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                plan: 'PREMIUM',
                locationCategory: location,
                durationMonths: months,
            }).unwrap();
            order = res.data;
        } catch (err) {
            if (err?.data?.errors) setErrors(err.data.errors);
            if (err?.data?.code === 'ACCOUNT_EXISTS') {
                setTaken({ email: Boolean(err.data.errors?.email), phone: Boolean(err.data.errors?.phone) });
                setStage('form');
                return; // the field messages + sign-in box explain it
            }
            setMessage({ type: 'error', text: errorText(err, "Couldn't start the payment. Please try again.") });
            setStage('form');
            return;
        }

        // 2) Razorpay Checkout
        let Razorpay;
        try {
            Razorpay = await loadRazorpay();
        } catch {
            setMessage({ type: 'error', text: "Couldn't load the payment window. Please check your connection and try again." });
            setStage('form');
            return;
        }

        const checkout = new Razorpay({
            key: order.keyId,
            order_id: order.orderId,
            amount: order.amount,
            currency: order.currency,
            name: 'VehicleHub',
            description: summary,
            prefill: order.prefill,
            notes: { shopName: form.shopName.trim() },
            theme: { color: '#001f3f' },
            modal: {
                // Closed without paying -> nothing is saved, stay on the form
                ondismiss: () => {
                    setStage((s) => (s === 'verifying' ? s : 'form'));
                    setMessage((m) => m || { type: 'info', text: 'Payment cancelled. You have not been charged.' });
                },
            },
            // 3) Razorpay says it's paid -> the backend checks with Razorpay before anything is saved
            handler: async (response) => {
                setStage('verifying');
                setMessage(null);
                try {
                    const res = await verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    }).unwrap();
                    const paid = res.data;
                    const prefill = {
                        subscriptionPaymentId: paid.id,
                        shopName: paid.shopName,
                        fullName: paid.fullName,
                        phone: paid.phone,
                        email: paid.email,
                        plan: paid.plan,
                        locationCategory: paid.locationCategory,
                        durationMonths: paid.durationMonths,
                        amount: paid.amount,
                        razorpayPaymentId: paid.razorpayPaymentId,
                    };
                    savePlanPrefill(prefill);
                    navigate('/seller-Register', { state: { planPrefill: prefill } });
                } catch (err) {
                    setStage('form');
                    setMessage({
                        type: 'error',
                        text: errorText(err, "We couldn't verify your payment. If money was deducted, please contact support with your payment ID.")
                            + (response?.razorpay_payment_id ? ` (Payment ID: ${response.razorpay_payment_id})` : ''),
                    });
                }
            },
        });
        checkout.on('payment.failed', (resp) => {
            setMessage({ type: 'error', text: `Payment failed: ${resp?.error?.description || 'please try again.'}` });
        });
        checkout.open();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !busy && onClose()} />
            <div role="dialog" aria-modal="true" aria-labelledby="plan-form-title" className="animate-fadeInUp relative my-auto flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
                <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-[#001f3f] to-[#003d7a] px-5 py-4 text-white sm:px-6">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Crown size={16} /></span>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">Get Premium</p>
                            <h3 id="plan-form-title" className="text-sm font-bold">{summary}</h3>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={busy} aria-label="Close" className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={onSubmit} noValidate className="space-y-4 overflow-y-auto p-5 sm:p-6">
                    <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Amount to pay</p>
                            <p className="text-xl font-extrabold text-slate-900">{formatCurrency(amount)}</p>
                        </div>
                        <ShieldCheck size={22} className="text-emerald-600" />
                    </div>

                    <Field id="plan-shop" label="Shop Name" icon={Store} name="shopName" value={form.shopName} onChange={onChange} error={errors.shopName} placeholder="e.g. RK Motors" autoComplete="organization" disabled={busy} />
                    <Field id="plan-name" label="Full Name" icon={User} name="fullName" value={form.fullName} onChange={onChange} error={errors.fullName} placeholder="Your full name" autoComplete="name" disabled={busy} />
                    <Field id="plan-phone" label="Phone Number" icon={Phone} name="phone" type="tel" value={form.phone} onChange={onChange} onBlur={onCheckBlur} error={errors.phone} placeholder="98765 43210" autoComplete="tel" disabled={busy} />
                    <Field id="plan-email" label="Email Address" icon={Mail} name="email" type="email" value={form.email} onChange={onChange} onBlur={onCheckBlur} error={errors.email} placeholder="you@example.com" autoComplete="email" disabled={busy} />

                    {accountExists && (
                        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900" data-testid="account-exists">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>
                                You already have a MotorDesk account with this {taken.email && taken.phone ? 'email and phone number' : taken.email ? 'email' : 'phone number'}.{' '}
                                <Link to="/login" state={{ from: '/pricing' }} className="font-semibold text-[#001f3f] underline">Sign in</Link> to buy the plan, or use different details.
                            </span>
                        </div>
                    )}

                    {message && (
                        <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                            <AlertCircle size={16} className="mt-0.5 shrink-0" /> <span>{message.text}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={busy || accountExists}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f3f] py-3.5 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:bg-[#002a55] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {stage === 'verifying' ? (
                            <><Loader2 size={16} className="animate-spin" /> Confirming your payment...</>
                        ) : stage === 'paying' ? (
                            <><Loader2 size={16} className="animate-spin" /> Opening payment...</>
                        ) : (
                            <><Lock size={15} /> Proceed to pay {formatCurrency(amount)}</>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-400">
                        After payment you'll continue to seller registration with these details filled in.
                    </p>
                </form>
            </div>
        </div>,
        document.body,
    );
};