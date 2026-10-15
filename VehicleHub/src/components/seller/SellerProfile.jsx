// VehicleHub/VehicleHub/src/components/seller/SellerProfile.jsx
import { useRef, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import {
    Camera, ShieldCheck, Star, MapPin, Phone, Mail, Building2, Save,
    Pencil, CheckCircle2, Clock, FileText, Award, TrendingUp, X, Loader2, XCircle, Upload, Trash2,
} from 'lucide-react';
import {
    useGetMyProfileQuery,
    useUpdateMyProfileMutation,
    useGetSellerStatsQuery,
    useUploadMyDocumentsMutation,
    useDeleteMyDocumentMutation,
} from '../../services/sellerApiSlice.js';
import { AvatarImage } from '../ui/AvatarImage.jsx';

const Field = ({ label, children }) => (
    <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
        {children}
    </div>
);

const inputClass = "w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#001f3f] focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const docStatusStyle = {
    VERIFIED: 'bg-emerald-50 text-emerald-700',
    PENDING: 'bg-amber-50 text-amber-700',
    REJECTED: 'bg-red-50 text-red-700',
};

export const SellerProfilePage = () => {
    const { data, isLoading, isError } = useGetMyProfileQuery();
    const { data: statsData } = useGetSellerStatsQuery();
    const [updateProfile, { isLoading: saving }] = useUpdateMyProfileMutation();
    const [uploadDocuments, { isLoading: uploadingDocs }] = useUploadMyDocumentsMutation();
    const [deleteDocument] = useDeleteMyDocumentMutation();
    const docInputRef = useRef(null);

    const profile = data?.data;
    const stats = statsData?.stats;

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (profile) {
            setForm({
                ownerName: profile.ownerName || '',
                businessName: profile.businessName || '',
                description: profile.description || '',
                phone: profile.phone || '',
                sellerType: profile.sellerType || '',
                gstNumber: profile.gstNumber || '',
                panNumber: profile.panNumber || '',
                address: profile.address || '',
                city: profile.city || '',
                state: profile.state || '',
                pincode: profile.pincode || '',
            });
        }
    }, [profile]);

    if (isLoading || !form) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" /></div>;
    }
    if (isError || !profile) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-500">
                <XCircle size={22} />
                <p className="text-sm font-medium">Failed to load your seller profile.</p>
            </div>
        );
    }

    const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleDocumentUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (!files.length) return;
        try {
            const formData = new FormData();
            files.forEach((file) => formData.append('documents', file));
            formData.append('documentType', 'OWNERSHIP_PROOF');
            await uploadDocuments(formData).unwrap();
            toast.success('Document(s) uploaded successfully');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to upload document(s)');
        }
    };

    const handleDocumentDelete = async (documentId) => {
        try {
            await deleteDocument(documentId).unwrap();
            toast.success('Document deleted');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete document');
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        setForm({
            ownerName: profile.ownerName || '',
            businessName: profile.businessName || '',
            description: profile.description || '',
            phone: profile.phone || '',
            sellerType: profile.sellerType || '',
            gstNumber: profile.gstNumber || '',
            panNumber: profile.panNumber || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            pincode: profile.pincode || '',
        });
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value !== undefined && value !== null) formData.append(key, value);
            });
            if (avatarFile) formData.append('profilePhoto', avatarFile);

            await updateProfile(formData).unwrap();
            toast.success('Profile updated successfully');
            setEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to update profile');
        }
    };

    const displayName = profile.ownerName || profile.user?.fullName || 'Seller';
    const isVerified = profile.verificationStatus === 'APPROVED';
    const avatarSrc = avatarPreview || profile.profilePhoto;

    const statCards = [
        { label: 'Total listings', value: stats?.total ?? '—', icon: FileText, bg: 'bg-[#e6f2ff]', color: 'text-[#001f3f]' },
        { label: 'Vehicles sold', value: stats?.sold ?? '—', icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600' },
        { label: 'Avg rating', value: profile.rating?.toFixed(1) ?? '—', icon: Star, bg: 'bg-amber-50', color: 'text-amber-600' },
        { label: 'Total reviews', value: profile.totalReviews ?? 0, icon: Clock, bg: 'bg-purple-50', color: 'text-purple-600' },
    ];

    const badges = [
        isVerified && { label: 'Verified Seller', icon: ShieldCheck, bg: 'bg-emerald-50', color: 'text-emerald-700' },
        profile.isElite && { label: 'Elite Seller', icon: Award, bg: 'bg-amber-50', color: 'text-amber-700' },
        (stats?.sold ?? 0) >= 100 && { label: '100+ Sales', icon: TrendingUp, bg: 'bg-[#e6f2ff]', color: 'text-[#001f3f]' },
    ].filter(Boolean);

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>My Profile | VehicleHub</title></Helmet>

            {/* Header / cover card */}
            <div className="animate-fadeInUp overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="h-24 bg-gradient-to-r from-[#001f3f] via-[#002a55] to-[#003d7a] sm:h-28" />
                <div className="px-5 pb-6 sm:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="-mt-10 flex items-end gap-4 sm:-mt-12">
                            <div className="relative shrink-0">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-[#001f3f] to-[#003d7a] text-2xl font-bold text-white shadow-md sm:h-24 sm:w-24">
                                    <AvatarImage src={avatarSrc} name={displayName} />
                                </div>
                                {editing && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#001f3f] text-white transition hover:bg-[#002a55]"
                                        aria-label="Change avatar"
                                    >
                                        <Camera size={13} />
                                    </button>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </div>
                            <div className="min-w-0 pb-1">
                                <div className="flex items-center gap-1.5">
                                    <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">{displayName}</h1>
                                    {isVerified && <ShieldCheck size={16} className="shrink-0 text-emerald-500" />}
                                </div>
                                <p className="truncate text-sm text-slate-500">{profile.businessName || 'Individual Seller'}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 self-start sm:self-auto">
                            {editing && (
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    <X size={15} /> Cancel
                                </button>
                            )}
                            <button
                                onClick={() => (editing ? handleSave() : setEditing(true))}
                                disabled={saving}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-[#001f3f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#002a55] hover:shadow-md disabled:opacity-60"
                            >
                                {saving ? <Loader2 size={15} className="animate-spin" /> : editing ? <Save size={15} /> : <Pencil size={15} />}
                                {saving ? 'Saving...' : editing ? 'Save changes' : 'Edit profile'}
                            </button>
                        </div>
                    </div>

                    {badges.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {badges.map((b) => {
                                const Icon = b.icon;
                                return (
                                    <span key={b.label} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${b.bg} ${b.color}`}>
                                        <Icon size={13} /> {b.label}
                                    </span>
                                );
                            })}
                            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${profile.verificationStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700'
                                : profile.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                <Clock size={13} /> {profile.verificationStatus}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {statCards.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                        <div
                            key={s.label}
                            style={{ animationDelay: `${idx * 60}ms` }}
                            className="animate-fadeInUp opacity-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                        >
                            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
                                <Icon size={17} />
                            </span>
                            <p className="mt-3 text-xl font-extrabold text-slate-900 sm:text-2xl">{s.value}</p>
                            <p className="text-xs text-slate-500">{s.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                {/* Left column — editable info */}
                <div className="space-y-6">
                    <div className="animate-fadeInUp rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
                            <Building2 size={16} className="text-[#001f3f]" /> Business Information
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Owner Name">
                                <input disabled={!editing} className={inputClass} value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} />
                            </Field>
                            <Field label="Business Name">
                                <input disabled={!editing} className={inputClass} value={form.businessName} onChange={(e) => set('businessName', e.target.value)} />
                            </Field>
                            <Field label="Email">
                                <input disabled className={inputClass} value={profile.email || profile.user?.email || ''} />
                            </Field>
                            <Field label="Phone">
                                <input disabled={!editing} type="tel" className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                            </Field>
                            {/* Account type decides Seller vs Dealer access — set by the admin-approved application, not editable */}
                            <Field label="Account Type">
                                <input disabled className={inputClass} value={form.sellerType === 'Dealer' ? 'Dealer (shop — many vehicles)' : 'Seller (individual — one vehicle)'} />
                            </Field>
                            <Field label="GST Number">
                                <input disabled={!editing} className={inputClass} value={form.gstNumber} onChange={(e) => set('gstNumber', e.target.value)} />
                            </Field>
                            <Field label="PAN Number">
                                <input disabled={!editing} className={inputClass} value={form.panNumber} onChange={(e) => set('panNumber', e.target.value)} />
                            </Field>
                        </div>

                        <div className="mt-4">
                            <Field label="About / Bio">
                                <textarea
                                    disabled={!editing}
                                    rows={3}
                                    className={inputClass}
                                    value={form.description}
                                    onChange={(e) => set('description', e.target.value)}
                                    placeholder="Tell buyers about your business..."
                                />
                            </Field>
                        </div>
                    </div>

                    <div className="animate-fadeInUp rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
                            <MapPin size={16} className="text-[#001f3f]" /> Location
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Field label="Address">
                                    <input disabled={!editing} className={inputClass} value={form.address} onChange={(e) => set('address', e.target.value)} />
                                </Field>
                            </div>
                            <Field label="City">
                                <input disabled={!editing} className={inputClass} value={form.city} onChange={(e) => set('city', e.target.value)} />
                            </Field>
                            <Field label="State">
                                <input disabled={!editing} className={inputClass} value={form.state} onChange={(e) => set('state', e.target.value)} />
                            </Field>
                            <Field label="Pincode">
                                <input disabled={!editing} className={inputClass} value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
                            </Field>
                        </div>
                    </div>
                </div>

                {/* Right column — contact card + documents */}
                <div className="space-y-6">
                    <div className="animate-fadeInUp rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 text-base font-bold text-slate-900">Quick Contact</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2.5 text-slate-700">
                                <Phone size={14} className="shrink-0 text-[#001f3f]" /> {profile.phone || 'Not set'}
                            </div>
                            <div className="flex items-center gap-2.5 text-slate-700">
                                <Mail size={14} className="shrink-0 text-[#001f3f]" /> {profile.email || profile.user?.email || 'Not set'}
                            </div>
                            <div className="flex items-center gap-2.5 text-slate-700">
                                <MapPin size={14} className="shrink-0 text-[#001f3f]" /> {[profile.city, profile.state].filter(Boolean).join(', ') || 'Not set'}
                            </div>
                        </div>
                    </div>

                    <div className="animate-fadeInUp rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                                <FileText size={16} className="text-[#001f3f]" /> Verification Documents
                            </h2>
                            <button
                                onClick={() => docInputRef.current?.click()}
                                disabled={uploadingDocs}
                                className="flex items-center gap-1.5 rounded-lg bg-[#001f3f] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#002a55] disabled:opacity-60"
                            >
                                {uploadingDocs ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Upload
                            </button>
                            <input ref={docInputRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleDocumentUpload} />
                        </div>
                        {profile.documents?.length > 0 ? (
                            <div className="space-y-2.5">
                                {profile.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm transition hover:bg-slate-100"
                                    >
                                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-slate-700 hover:underline">
                                            {doc.type.replace(/_/g, ' ')}
                                        </a>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${docStatusStyle[doc.status] || docStatusStyle.PENDING}`}>
                                            {doc.status}
                                        </span>
                                        <button
                                            onClick={() => handleDocumentDelete(doc.id)}
                                            className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-red-500 transition hover:bg-red-100"
                                            aria-label="Delete document"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="py-6 text-center text-sm text-slate-400">No documents uploaded.</p>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};