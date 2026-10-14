import { useState } from "react";
import { useNavigate, } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from 'react-toastify';
import {
    ShieldCheck, Camera, FileText, Home, MapPin, Phone,
    Building2, CreditCard, Landmark, CheckCircle2, User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAuthGate } from "../../context/AuthGateContext.jsx";

import { addPendingSellerRegistration } from "../../data/adminSellerVerification.js";


import { useRegisterSellerMutation } from "../../services/sellerApiSlice.js";

const initialFormData = {

    sellerType: "Individual",
    ownerName: "", businessName: "", email: "", phone: "",
    address: "", city: "", state: "", pincode: "",
    gstNumber: "", panNumber: "",
    yearsInBusiness: "", website: "",
    bankAccountHolder: "", bankAccountNumber: "", bankIFSC: "", bankName: "",
    description: "",
    profilePhoto: null, shopLogo: null, panCardImage: null, gstCertificate: null,
    agreedToTerms: false,
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

    const [formData, setFormData] = useState(initialFormData);
    const [submitting, setSubmitting] = useState(false);

    // NEW: tracks which screen to show


    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : files ? files[0] : value,
        }));
    };

    // Note: automatic polling/pending persistence removed — after registration we redirect to dashboard.

    const handleSubmit = async (e) => {

        e.preventDefault();

        // The /sellers/register API requires a logged-in user (Bearer token).
        // Without a token the server answers 401, so ask the user to log in first.
        const existingToken = localStorage.getItem('vehiclehub_token');
        if (!existingToken) {
            toast.info('Please log in with your phone or email to continue seller registration.');
            requireAuth(() => navigate('/seller-Register'), 'SELL');
            return;
        }

        const fullName = formData.ownerName?.trim() || formData.businessName?.trim() || user?.name || 'Seller';
        const phone = formData.phone?.trim() || user?.phone || '';
        setSubmitting(true);
        try {
            const fd = new FormData();
            // Basic fields
            fd.append('sellerType', formData.sellerType);
            fd.append('ownerName', formData.ownerName?.trim() || fullName);
            if (formData.businessName) fd.append('businessName', formData.businessName);
            fd.append('email', formData.email?.trim() || user?.email || '');
            fd.append('phone', phone);
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

            // Files
            if (formData.profilePhoto) fd.append('profilePhoto', formData.profilePhoto);
            if (formData.shopLogo) fd.append('shopLogo', formData.shopLogo);
            if (formData.panCardImage) fd.append('panCardImage', formData.panCardImage);
            if (formData.gstCertificate) fd.append('gstCertificate', formData.gstCertificate);

            const response = await registerSeller(fd).unwrap();

            const sellerUser = {
                ...(user || {}),
                ...(response?.user || {}),
                id: user?.id || response?.user?.id || `seller-${Date.now()}`,
                name: response?.user?.fullName || fullName,
                fullName: response?.user?.fullName || fullName,
                email: formData.email?.trim() || user?.email || 'seller@vehiclehub.io',
                phone,
                role: 'seller', // server switches the user to SELLER on registration
                sellerProfile: {
                    id: response?.sellerProfile?.id,
                    verificationStatus: response?.sellerProfile?.verificationStatus,
                },
            };

            addPendingSellerRegistration({
                ownerName: formData.ownerName?.trim() || fullName,
                businessName: formData.businessName,
                sellerType: formData.sellerType,
                email: formData.email,
                phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                gstNumber: formData.gstNumber,
                panNumber: formData.panNumber,
                yearsInBusiness: formData.yearsInBusiness,
                website: formData.website,
                bankAccountHolder: formData.bankAccountHolder,
                bankAccountNumber: formData.bankAccountNumber,
                bankIFSC: formData.bankIFSC,
                bankName: formData.bankName,
                description: formData.description,
                panCardImage: formData.panCardImage?.name || null,
                gstCertificate: formData.gstCertificate?.name || null,
                profilePhoto: formData.profilePhoto?.name || null,
                shopLogo: formData.shopLogo?.name || null,
                userId: sellerUser?.id,
            });

            // Complete auth for the newly-registered seller and go straight to dashboard
            const token = response?.token || localStorage.getItem('vehiclehub_token');
            completeAuth?.(sellerUser, token);
            toast.success("Registration successful — redirecting to your seller dashboard.");
            navigate('/seller/dashboard');

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
                            Your application is reviewed by our admin team, typically within 24 hours. Once verified, you can list unlimited vehicles.
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

                    {/* Right — form */}
                    <div className="rounded-[32px] bg-white p-6 shadow-2xl shadow-slate-900/5 sm:p-8">
                        <div className="mb-6 flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Seller card</p>
                                <h2 className="mt-2 text-lg font-bold text-slate-900">Complete your registration</h2>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#001f3f] text-white shadow-md"><FileText size={18} /></div>
                        </div>

                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Seller type */}
                            <div>
                                <SectionHeader icon={User} title="Seller Type" />
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {['Individual', 'Dealer'].map((type) => (
                                        <label key={type} className={`flex cursor-pointer items-center gap-2 rounded-2xl border-2 px-4 py-3 transition ${formData.sellerType === type ? 'border-[#001f3f] bg-[#e6f2ff]' : 'border-slate-200 bg-slate-50 hover:border-[#001f3f]/30'}`}>
                                            <input type="radio" name="sellerType" value={type} checked={formData.sellerType === type} onChange={handleChange} className="h-4 w-4 accent-[#001f3f]" />
                                            <span className="font-medium text-slate-800">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Personal / business info */}
                            <div>
                                <SectionHeader icon={Building2} title="Business Information" subtitle="Tell us who you are" />
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Owner name" required><TextInput type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required /></Field>
                                    <Field label="Business name"><TextInput type="text" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="e.g. RK Dealerships" /></Field>
                                    <Field label="Email" required><TextInput type="email" name="email" value={formData.email} onChange={handleChange} required /></Field>
                                    <Field label="Phone" required><TextInput type="tel" name="phone" value={formData.phone} onChange={handleChange} required /></Field>
                                    <Field label="Years in business"><TextInput type="number" name="yearsInBusiness" value={formData.yearsInBusiness} onChange={handleChange} placeholder="e.g. 5" /></Field>
                                    <Field label="Website (optional)"><TextInput type="text" name="website" value={formData.website} onChange={handleChange} placeholder="https://" /></Field>
                                </div>
                            </div>

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
                </div>
            </div>
        </div>
    );
};