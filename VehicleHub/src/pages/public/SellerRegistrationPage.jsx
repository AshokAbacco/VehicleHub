// VehicleHub/VehicleHub/src/pages/public/SellerRegistrationPage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from 'react-hot-toast'; // the app renders react-hot-toast's <Toaster>
import {
    ShieldCheck, Camera, FileText, Home, MapPin, Phone,
    Building2, CreditCard, Landmark, CheckCircle2, User, Clock, XCircle, Loader2, Search, Lock, Eye, EyeOff,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAuthGate } from "../../context/AuthGateContext.jsx";
import { fetchSellerStatus, openSellerArea } from "../../utils/sellerStatus.js";


import { useRegisterSellerMutation } from "../../services/sellerApiSlice.js";
import { isValidWhatsApp } from "../../utils/whatsapp.js";
import { readPlanPrefill, clearPlanPrefill } from "../../services/pricingApiSlice.js";
import { formatCurrency } from "../../utils/formatters.js";

const initialFormData = {

    sellerType: "Individual",
    ownerName: "", businessName: "", email: "", phone: "",
    // WhatsApp: buyers are sent here after a purchase request
    whatsappSameAsPhone: true, whatsappNumber: "",
    address: "", city: "", state: "", pincode: "",
    gstNumber: "", panNumber: "",
    yearsInBusiness: "", website: "",
    bankAccountHolder: "", bankAccountNumber: "", bankIFSC: "", bankName: "",
    description: "",
    profilePhoto: null, shopLogo: null, panCardImage: null, gstCertificate: null,
    agreedToTerms: false,
    // only for visitors without an account — creates their login with the application
    password: "", confirmPassword: "",
};

const Field = ({ label, required, children }) => (
    <label className="space-y-2 text-sm text-slate-700">
        <span className="block font-semibold">{label} {required && <span className="text-red-500">*</span>}</span>
        {children}
    </label>
);

const TextInput = (props) => (
    <input {...props} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#001f3f] focus:bg-white focus:ring-2 focus:ring-[#001f3f]/10" />
);

const PASSWORD_MIN = 6;

// Password box with a show / hide (eye) button
const PasswordInput = ({ invalid, ...props }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                {...props}
                type={show ? 'text' : 'password'}
                aria-invalid={invalid || undefined}
                className={`w-full rounded-2xl border bg-slate-50 py-3 pl-4 pr-12 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#001f3f]/10 ${invalid ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-[#001f3f]'}`}
            />
            <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? 'Hide password' : 'Show password'}
                title={show ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
        </div>
    );
};

const FileInput = ({ icon: Icon, name, onChange, fileName }) => (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-[#001f3f]/30">
        <Icon size={18} className="shrink-0 text-slate-500" />
        <div className="min-w-0 flex-1">
            <input type="file" name={name} onChange={onChange} className="w-full text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-[#e6f2ff] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#001f3f]" />
        </div>
        {fileName && <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />}
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e6f2ff] text-[#001f3f]"><Icon size={16} /></div>
        <div><h3 className="text-sm font-bold text-slate-900">{title}</h3>{subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}</div>
    </div>
);

export const SellerRegistration = () => {
    const navigate = useNavigate();
    const { user, completeAuth, logout } = useAuth();
    const { requireAuth } = useAuthGate();



    const [registerSeller] = useRegisterSellerMutation();

    // Premium plan just paid on the Pricing page -> start with those details (all still editable)
    const routerLocation = useLocation();
    const [planPrefill] = useState(() => routerLocation.state?.planPrefill || readPlanPrefill());
    const [formData, setFormData] = useState(() =>
        planPrefill
            ? {
                ...initialFormData,
                sellerType: 'Dealer', // the plan is for a shop
                ownerName: planPrefill.fullName || '',
                businessName: planPrefill.shopName || '',
                email: planPrefill.email || '',
                phone: String(planPrefill.phone || '').replace(/^\+91/, ''),
            }
            : initialFormData
    );
    const [submitting, setSubmitting] = useState(false);

    // Application status from the server: undefined = loading, null = never applied,
    // or { status: PENDING | APPROVED | REJECTED, rejectReason, sellerProfile, role }
    const [application, setApplication] = useState(user ? undefined : null);
    const role = String(user?.role || '').toLowerCase();

    useEffect(() => {
        let cancelled = false;
        if (!user) { setApplication(null); return undefined; }
        fetchSellerStatus().then((st) => {
            if (cancelled) return;
            if (st?.isApproved) {
                // Already an approved seller — go straight to the seller dashboard
                openSellerArea({ navigate, user, completeAuth });
                return;
            }
            setApplication(st?.isSellerRegistered ? st : null);
            // Rejected: start the form from what they sent last time
            if (st?.status === 'REJECTED' && st.sellerProfile) {
                setFormData((prev) => ({
                    ...prev,
                    // details from a plan just paid for win over the old application
                    ownerName: (planPrefill && prev.ownerName) || st.sellerProfile.ownerName || prev.ownerName,
                    businessName: (planPrefill && prev.businessName) || st.sellerProfile.businessName || prev.businessName,
                    sellerType: planPrefill ? prev.sellerType : st.sellerProfile.sellerType === 'DEALER' ? 'Dealer' : 'Individual',
                    ...(st.sellerProfile.whatsappNumber && !st.sellerProfile.whatsappSameAsPhone
                        ? { whatsappSameAsPhone: false, whatsappNumber: st.sellerProfile.whatsappNumber }
                        : {}),
                }));
            }
        });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);


    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : files ? files[0] : value,
        }));
    };

    // After submitting, the application waits for an admin; the account stays a buyer until approved.

    const handleSubmit = async (e) => {

        e.preventDefault();

        // Visitors without an account create their login with the application
        const isGuest = !user;
        if (isGuest) {
            if ((formData.password || '').length < PASSWORD_MIN) {
                toast.error(`Choose a password of at least ${PASSWORD_MIN} characters for your account.`);
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error('The two passwords do not match.');
                return;
            }
        }

        const fullName = formData.ownerName?.trim() || formData.businessName?.trim() || user?.name || 'Seller';
        const phone = formData.phone?.trim() || user?.phone || '';
        if (formData.whatsappSameAsPhone && !isValidWhatsApp(phone)) {
            toast.error("Your phone number isn't a valid WhatsApp mobile number. Untick \"also my WhatsApp number\" and enter your WhatsApp number.");
            return;
        }
        if (!formData.whatsappSameAsPhone && formData.whatsappNumber.trim() && !isValidWhatsApp(formData.whatsappNumber)) {
            toast.error('Enter a valid WhatsApp mobile number (10 digits, or with country code).');
            return;
        }
        setSubmitting(true);
        try {
            const fd = new FormData();
            // Basic fields
            fd.append('sellerType', formData.sellerType);
            fd.append('ownerName', formData.ownerName?.trim() || fullName);
            if (formData.businessName) fd.append('businessName', formData.businessName);
            fd.append('email', formData.email?.trim() || user?.email || '');
            fd.append('phone', phone);
            fd.append('whatsappSameAsPhone', formData.whatsappSameAsPhone ? 'true' : 'false');
            if (!formData.whatsappSameAsPhone) fd.append('whatsappNumber', formData.whatsappNumber.trim());
            fd.append('address', formData.address);
            fd.append('city', formData.city);
            fd.append('state', formData.state);
            fd.append('pincode', formData.pincode);
            if (formData.gstNumber) fd.append('gstNumber', formData.gstNumber);
            fd.append('panNumber', formData.panNumber);
            if (formData.yearsInBusiness) fd.append('yearsInBusiness', String(formData.yearsInBusiness));
            if (formData.website) fd.append('website', formData.website);
            if (formData.bankAccountHolder) fd.append('bankAccountHolder', formData.bankAccountHolder);
            if (formData.bankAccountNumber) fd.append('bankAccountNumber', formData.bankAccountNumber);
            if (formData.bankIFSC) fd.append('bankIFSC', formData.bankIFSC);
            if (formData.bankName) fd.append('bankName', formData.bankName);
            if (formData.description) fd.append('description', formData.description);
            if (isGuest) fd.append('password', formData.password);
            if (planPrefill?.subscriptionPaymentId) fd.append('subscriptionPaymentId', planPrefill.subscriptionPaymentId);

            // Files
            if (formData.profilePhoto) fd.append('profilePhoto', formData.profilePhoto);
            if (formData.shopLogo) fd.append('shopLogo', formData.shopLogo);
            if (formData.panCardImage) fd.append('panCardImage', formData.panCardImage);
            if (formData.gstCertificate) fd.append('gstCertificate', formData.gstCertificate);

            const response = await registerSeller(fd).unwrap();
            // New visitor: their account was created with the application — sign them in
            if (isGuest && response?.accessToken && response?.user) {
                completeAuth(response.user, response.accessToken);
            }

            // Under review now — the seller dashboard opens once an admin approves
            setApplication({
                status: 'PENDING',
                isSellerRegistered: true,
                sellerProfile: {
                    ownerName: formData.ownerName?.trim() || fullName,
                    businessName: formData.businessName,
                    submittedAt: new Date().toISOString(),
                },
            });
            clearPlanPrefill(); // the plan is now attached to this application
            toast.success(response?.message || 'Registration submitted. An admin will review it shortly.');
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Seller registration failed', error);
            if (error?.status === 401) {
                // Token missing/invalid/expired — clear the stale session and re-login.
                logout?.();
                toast.error('Your session has expired. Please log in again to continue.');
                requireAuth(() => navigate('/seller-Register'), 'SELL');
                return;
            }
            toast.error(error?.data?.message || 'Seller registration failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
            <Helmet><title>Seller Registration | VehicleHub</title></Helmet>
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                    {/* Left — pitch panel */}
                    <div className="space-y-4 lg:sticky lg:top-10">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#e6f2ff] px-4 py-2 text-sm font-semibold text-[#001f3f] shadow-sm">
                            <ShieldCheck size={16} /> Trusted Seller Onboarding
                        </span>
                        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                            Register as a seller and start listing premium vehicles.
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                            Your application is reviewed by our admin team, typically within 24 hours. Once verified, Sellers list one vehicle at a time and Dealers can list as many as they like.
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                            {[
                                { icon: Home, title: 'Verified business', text: 'Submit your GST and PAN for faster approval.' },
                                { icon: MapPin, title: 'Local pickup support', text: 'Get matched with buyers in your city instantly.' },
                                { icon: Landmark, title: 'Secure payouts', text: 'Get paid directly to your registered bank account.' },
                            ].map((item) => (
                                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-3 text-[#001f3f]"><item.icon size={18} /><span className="font-semibold">{item.title}</span></div>
                                    <p className="mt-2 text-sm text-slate-500">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — application status, or the form */}
                    {application === undefined ? (
                        <div className="flex h-64 items-center justify-center rounded-[32px] bg-white shadow-2xl shadow-slate-900/5">
                            <Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" />
                        </div>
                    ) : role === 'admin' || role === 'inspector' ? (
                        <div className="rounded-[32px] bg-white p-8 text-center shadow-2xl shadow-slate-900/5">
                            <ShieldCheck size={28} className="mx-auto text-[#001f3f]" />
                            <h2 className="mt-3 text-lg font-bold text-slate-900">This account can't register as a seller</h2>
                            <p className="mt-1 text-sm text-slate-500">Admin and Field Inspector accounts are separate from seller accounts. Sign in with a buyer account to apply.</p>
                        </div>
                    ) : application?.status === 'PENDING' ? (
                        <div className="rounded-[32px] bg-white p-6 shadow-2xl shadow-slate-900/5 sm:p-8">
                            <div className="flex flex-col items-center text-center">
                                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-8 ring-amber-50/60"><Clock size={28} /></span>
                                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">Application under review</p>
                                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Thanks{application.sellerProfile?.ownerName ? `, ${application.sellerProfile.ownerName.split(' ')[0]}` : ''}! We're verifying your details.</h2>
                                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    Our admin team reviews every seller registration{application.sellerProfile?.businessName ? ` — including ${application.sellerProfile.businessName}` : ''}.
                                    You'll get a notification as soon as it's approved, and then your {application.sellerProfile?.sellerType === 'DEALER' ? 'dealer' : 'seller'} dashboard opens for you.
                                </p>
                                {application.sellerProfile?.submittedAt && (
                                    <p className="mt-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                        Submitted {new Date(application.sellerProfile.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                    </p>
                                )}
                                <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
                                    <Link to="/search" className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                                        <Search size={15} /> Browse vehicles
                                    </Link>
                                    <Link to="/buyer/dashboard/notifications" className="flex items-center justify-center gap-2 rounded-xl bg-[#001f3f] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#002a55]">
                                        Check notifications
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                    <div className="rounded-[32px] bg-white p-6 shadow-2xl shadow-slate-900/5 sm:p-8">
                        {application?.status === 'REJECTED' && (
                            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                <XCircle size={18} className="mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-bold">Your previous application was not approved</p>
                                    {application.rejectReason && <p className="mt-0.5"><span className="font-semibold">Reason:</span> {application.rejectReason}</p>}
                                    <p className="mt-1 text-red-600/80">Correct the details below and submit again.</p>
                                </div>
                            </div>
                        )}
                        <div className="mb-6 flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Seller card</p>
                                <h2 className="mt-2 text-lg font-bold text-slate-900">Complete your registration</h2>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#001f3f] text-white shadow-md"><FileText size={18} /></div>
                        </div>

                        {planPrefill && (
                            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5" data-testid="plan-paid-banner">
                                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                                <div className="min-w-0 text-sm">
                                    <p className="font-bold text-slate-900">Premium plan paid</p>
                                    <p className="mt-0.5 text-slate-600">
                                        {planPrefill.locationCategory === 'RURAL' ? 'Rural' : 'Urban'} · {planPrefill.durationMonths === 12 ? '12 months (Yearly)' : `${planPrefill.durationMonths} month${planPrefill.durationMonths > 1 ? 's' : ''}`}
                                        {planPrefill.amount ? ` · ${formatCurrency(planPrefill.amount)}` : ''}
                                        {planPrefill.razorpayPaymentId ? ` · Payment ID ${planPrefill.razorpayPaymentId}` : ''}
                                    </p>
                                    {planPrefill.email && (
                                        <p className="mt-1 text-xs text-slate-600">Your invoice is on its way to <strong>{planPrefill.email}</strong>.</p>
                                    )}
                                    <p className="mt-1 text-xs text-slate-500">We've filled in your shop name, name, phone and email from the payment. You can change them below.</p>
                                </div>
                            </div>
                        )}

                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Seller type */}
                            <div>
                                <SectionHeader icon={User} title="Account Type" subtitle="This decides your account once the admin approves it" />
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {[
                                        { type: 'Individual', title: 'Seller (individual)', text: 'Selling your own vehicle — one listing at a time.' },
                                        { type: 'Dealer', title: 'Dealer (shop / business)', text: 'Running a shop — list and manage many vehicles.' },
                                    ].map(({ type, title, text }) => (
                                        <label key={type} className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 px-4 py-3 transition ${formData.sellerType === type ? 'border-[#001f3f] bg-[#e6f2ff]' : 'border-slate-200 bg-slate-50 hover:border-[#001f3f]/30'}`}>
                                            <input type="radio" name="sellerType" value={type} checked={formData.sellerType === type} onChange={handleChange} className="mt-1 h-4 w-4 accent-[#001f3f]" />
                                            <span>
                                                <span className="block font-semibold text-slate-800">{title}</span>
                                                <span className="block text-xs text-slate-500">{text}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Personal / business info */}
                            <div>
                                <SectionHeader icon={Building2} title="Business Information" subtitle="Tell us who you are" />
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Owner name" required><TextInput type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required /></Field>
                                    <Field label={formData.sellerType === 'Dealer' ? 'Shop / business name' : 'Business name (optional)'} required={formData.sellerType === 'Dealer'}><TextInput type="text" name="businessName" value={formData.businessName} onChange={handleChange} required={formData.sellerType === 'Dealer'} placeholder="e.g. RK Dealerships" /></Field>
                                    <Field label="Email" required><TextInput type="email" name="email" value={formData.email} onChange={handleChange} required /></Field>
                                    {/* Phone + WhatsApp */}
                                    <div className="space-y-2 text-sm text-slate-700">
                                        <label htmlFor="seller-phone" className="block font-semibold">Phone <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <TextInput id="seller-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="98765 43210" style={{ paddingRight: '2.75rem' }} />
                                            <FaWhatsapp
                                                size={20}
                                                title={formData.whatsappSameAsPhone ? 'This number is on WhatsApp' : 'Not your WhatsApp number'}
                                                className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 transition ${formData.whatsappSameAsPhone ? 'text-[#25D366]' : 'text-slate-300'}`}
                                            />
                                        </div>
                                        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                                            <input type="checkbox" name="whatsappSameAsPhone" checked={formData.whatsappSameAsPhone} onChange={handleChange} className="h-4 w-4 accent-[#25D366]" />
                                            This is also my WhatsApp number
                                        </label>
                                        {!formData.whatsappSameAsPhone && (
                                            <div className="space-y-1.5 pt-1">
                                                <label htmlFor="seller-whatsapp" className="flex items-center gap-1.5 font-semibold">
                                                    <FaWhatsapp size={15} className="text-[#25D366]" /> WhatsApp number
                                                </label>
                                                <TextInput id="seller-whatsapp" type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="WhatsApp mobile number" />
                                                <span className="block text-xs text-slate-400">Buyers message you here after sending a purchase request. Leave empty if you don't use WhatsApp.</span>
                                            </div>
                                        )}
                                    </div>
                                    <Field label="Years in business"><TextInput type="number" name="yearsInBusiness" value={formData.yearsInBusiness} onChange={handleChange} placeholder="e.g. 5" /></Field>
                                    <Field label="Website (optional)"><TextInput type="text" name="website" value={formData.website} onChange={handleChange} placeholder="https://" /></Field>
                                </div>
                            </div>

                            {/* Visitors without an account: create the login with this application */}
                            {!user && (
                                <div>
                                    <SectionHeader icon={Lock} title="Create Your Login" subtitle="Sign in later with your email or mobile number and this password" />
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="Password" required>
                                            <PasswordInput name="password" value={formData.password} onChange={handleChange} required minLength={PASSWORD_MIN} autoComplete="new-password" placeholder={`At least ${PASSWORD_MIN} characters`}
                                                invalid={formData.password.length > 0 && formData.password.length < PASSWORD_MIN} />
                                            {formData.password.length > 0 && formData.password.length < PASSWORD_MIN && (
                                                <span className="block text-xs text-red-600">At least {PASSWORD_MIN} characters ({PASSWORD_MIN - formData.password.length} more)</span>
                                            )}
                                        </Field>
                                        <Field label="Confirm password" required>
                                            <PasswordInput name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={PASSWORD_MIN} autoComplete="new-password" placeholder="Type it again"
                                                invalid={formData.confirmPassword.length > 0 && formData.confirmPassword !== formData.password} />
                                            {formData.confirmPassword.length > 0 && formData.confirmPassword !== formData.password && (
                                                <span className="block text-xs text-red-600">Passwords don't match</span>
                                            )}
                                        </Field>
                                    </div>
                                    {/* <p className="mt-2 text-xs text-slate-500">
                                        Already have an account? <Link to="/login" state={{ from: '/seller-Register' }} className="font-semibold text-[#001f3f] hover:underline">Sign in</Link> first, then apply.
                                    </p> */}
                                </div>
                            )}

                            {/* Location */}
                            <div>
                                <SectionHeader icon={MapPin} title="Location" />
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2"><Field label="Address" required><TextInput type="text" name="address" value={formData.address} onChange={handleChange} required /></Field></div>
                                    <Field label="City" required><TextInput type="text" name="city" value={formData.city} onChange={handleChange} required /></Field>
                                    <Field label="State" required><TextInput type="text" name="state" value={formData.state} onChange={handleChange} required /></Field>
                                    <Field label="Pincode" required><TextInput type="text" name="pincode" value={formData.pincode} onChange={handleChange} required /></Field>
                                </div>
                            </div>

                            {/* Legal / compliance */}
                            <div>
                                <SectionHeader icon={ShieldCheck} title="Legal & Compliance" subtitle="Required for faster admin verification" />
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="GST number"><TextInput type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="22AAAAA0000A1Z5" /></Field>
                                    <Field label="PAN number" required><TextInput type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} required placeholder="ABCDE1234F" /></Field>
                                </div>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <Field label="PAN card image"><FileInput icon={FileText} name="panCardImage" onChange={handleChange} fileName={formData.panCardImage?.name} /></Field>
                                    <Field label="GST certificate"><FileInput icon={FileText} name="gstCertificate" onChange={handleChange} fileName={formData.gstCertificate?.name} /></Field>
                                </div>
                            </div>

                            {/* Bank details */}
                            <div>
                                <SectionHeader icon={Landmark} title="Bank Details" subtitle="For payouts once a vehicle sells" />
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Account holder name"><TextInput type="text" name="bankAccountHolder" value={formData.bankAccountHolder} onChange={handleChange} /></Field>
                                    <Field label="Bank name"><TextInput type="text" name="bankName" value={formData.bankName} onChange={handleChange} /></Field>
                                    <Field label="Account number"><TextInput type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} /></Field>
                                    <Field label="IFSC code"><TextInput type="text" name="bankIFSC" value={formData.bankIFSC} onChange={handleChange} /></Field>
                                </div>
                            </div>

                            {/* About + branding */}
                            <div>
                                <SectionHeader icon={CreditCard} title="Profile & Branding" />
                                <Field label="Business description">
                                    <textarea name="description" value={formData.description} onChange={handleChange} className="min-h-[100px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#001f3f] focus:ring-2 focus:ring-[#001f3f]/10" placeholder="Tell buyers what makes you trustworthy..." />
                                </Field>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <Field label="Profile photo"><FileInput icon={Camera} name="profilePhoto" onChange={handleChange} fileName={formData.profilePhoto?.name} /></Field>
                                    <Field label="Shop logo"><FileInput icon={FileText} name="shopLogo" onChange={handleChange} fileName={formData.shopLogo?.name} /></Field>
                                </div>
                            </div>

                            {/* Terms */}
                            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} className="mt-0.5 h-4 w-4 shrink-0 accent-[#001f3f]" />
                                I confirm the information provided is accurate and agree to VehicleHub's <span className="font-semibold text-[#001f3f]">Seller Terms</span> and verification process.
                            </label>

                            <button
                                type="submit"
                                disabled={!formData.agreedToTerms || submitting}
                                className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-3xl bg-[#001f3f] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#001f3f]/20 transition hover:bg-[#002a55] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Phone size={16} /> {submitting ? 'Submitting...' : 'Submit for Verification'}
                            </button>
                            <p className="text-center text-xs text-slate-400">Your registration will be reviewed by our admin team before you can start listing.</p>
                        </form>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};