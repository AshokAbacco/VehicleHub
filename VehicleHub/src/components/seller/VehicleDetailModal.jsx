import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import {
    X, CheckCircle2, Clock, XCircle, Archive, ShoppingBag, Tag, Pencil,
    Car, FileText, User, MapPin, ImageIcon, ChevronLeft, ChevronRight, ExternalLink, Eye,
    Save, Loader2,
} from 'lucide-react';
import { useUpdateVehicleMutation } from '../../services/sellerApiSlice.js';

const approvalMeta = {
    APPROVED: { icon: CheckCircle2, label: 'Approved — live for buyers', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    PENDING: { icon: Clock, label: 'Pending admin approval', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    UNDER_VERIFICATION: { icon: Clock, label: 'Under verification by admin', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    REJECTED: { icon: XCircle, label: 'Rejected by admin', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
    SOLD: { icon: ShoppingBag, label: 'Marked as sold', color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
    ARCHIVED: { icon: Archive, label: 'Archived', color: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
    DRAFT: { icon: Tag, label: 'Draft — not submitted', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500' },
};

const formatValue = (key, value) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (Array.isArray(value)) return value.length ? value.join(', ') : undefined;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (key === 'price') {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    }
    if (key.toLowerCase().includes('date') || key.toLowerCase().endsWith('at')) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return String(value);
};

const StatChip = ({ icon: Icon, label, value }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Icon size={14} className="shrink-0 text-slate-400" />
            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="truncate text-sm font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
};

const InfoSection = ({ icon: Icon, title, fields, row }) => {
    const items = fields
        .map(({ key, label }) => ({ label, value: formatValue(key, row[key]) }))
        .filter((f) => f.value !== undefined);

    if (items.length === 0) return null;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]">
                    <Icon size={15} />
                </div>
                <h4 className="text-base font-bold text-slate-900">{title}</h4>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
                {items.map((item) => (
                    <div key={item.label} className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{item.label}</p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SECTIONS = [
    {
        icon: Car,
        title: 'Vehicle Details',
        fields: [
            { key: 'brand', label: 'Brand' },
            { key: 'model', label: 'Model' },
            { key: 'variant', label: 'Variant' },
            { key: 'manufacturingYear', label: 'Mfg. Year' },
            { key: 'registrationYear', label: 'Reg. Year' },
            { key: 'fuelType', label: 'Fuel Type' },
            { key: 'transmission', label: 'Transmission' },
            { key: 'kmDriven', label: 'KM Driven' },
            { key: 'ownership', label: 'Ownership' },
            { key: 'color', label: 'Color' },
            { key: 'seatingCapacity', label: 'Seats' },
            { key: 'engineCapacity', label: 'Engine (CC)' },
            { key: 'mileage', label: 'Mileage' },
            { key: 'registrationNumber', label: 'Reg. Number' },
            { key: 'vin', label: 'VIN' },
        ],
    },
    {
        icon: FileText,
        title: 'Condition & Specs',
        fields: [
            { key: 'vehicleCondition', label: 'Condition' },
            { key: 'engineCondition', label: 'Engine' },
            { key: 'tyreCondition', label: 'Tyres' },
            { key: 'batteryCondition', label: 'Battery' },
            { key: 'accidentHistory', label: 'Accident History' },
            { key: 'floodDamage', label: 'Flood Damage' },
            { key: 'rcAvailable', label: 'RC Available' },
            { key: 'insuranceAvailable', label: 'Insurance' },
            { key: 'insuranceExpiry', label: 'Insurance Expiry' },
            { key: 'pollutionCertificate', label: 'PUC' },
            { key: 'serviceBook', label: 'Service Book' },
            { key: 'numberOfKeys', label: 'Keys' },
            { key: 'loanPending', label: 'Loan Pending' },
            { key: 'nocAvailable', label: 'NOC' },
        ],
    },
    {
        icon: User,
        title: 'Seller Info',
        fields: [
            { key: 'sellerName', label: 'Name' },
            { key: 'mobileNumber', label: 'Mobile' },
            { key: 'email', label: 'Email' },
            { key: 'sellerType', label: 'Type' },
            { key: 'dealerName', label: 'Dealer' },
        ],
    },
    {
        icon: MapPin,
        title: 'Location',
        fields: [
            { key: 'area', label: 'Area' },
            { key: 'city', label: 'City' },
            { key: 'state', label: 'State' },
            { key: 'pincode', label: 'Pincode' },
            { key: 'country', label: 'Country' },
        ],
    },
];

const ImageGalleryModal = ({ images, onClose }) => {
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!images || images.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
            <button
                onClick={onClose}
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Close photo view"
            >
                <X size={20} />
            </button>
            <div className="relative flex max-h-[85vh] w-full max-w-4xl flex-col items-center">
                <img
                    src={images[activeImage]}
                    alt={`Photo ${activeImage + 1}`}
                    className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
                />
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                            className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/80"
                            aria-label="Previous photo"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/80"
                            aria-label="Next photo"
                        >
                            <ChevronRight size={20} />
                        </button>
                        <div className="mt-4 flex gap-2 overflow-x-auto p-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${idx === activeImage ? 'scale-105 border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                                >
                                    <img src={img} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const editableFields = [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'brand', label: 'Brand', type: 'text' },
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'variant', label: 'Variant', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'price', label: 'Price (₹)', type: 'number' },
    { key: 'manufacturingYear', label: 'Manufacturing Year', type: 'number' },
    { key: 'registrationYear', label: 'Registration Year', type: 'number' },
    { key: 'fuelType', label: 'Fuel Type', type: 'text' },
    { key: 'transmission', label: 'Transmission', type: 'text' },
    { key: 'kmDriven', label: 'KM Driven', type: 'number' },
    { key: 'ownership', label: 'Ownership', type: 'text' },
    { key: 'color', label: 'Color', type: 'text' },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'state', label: 'State', type: 'text' },
    { key: 'area', label: 'Area', type: 'text' },
    { key: 'pincode', label: 'Pincode', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
];

const buildEditableForm = (listing = {}) => {
    const form = {};
    editableFields.forEach(({ key }) => {
        form[key] = listing[key] ?? '';
    });
    return form;
};

export const VehicleEditModal = ({ vehicle, onClose, onSaved }) => {
    const [form, setForm] = useState(() => buildEditableForm(vehicle));
    const [updateVehicle, { isLoading }] = useUpdateVehicleMutation();

    useEffect(() => {
        if (vehicle) setForm(buildEditableForm(vehicle));
    }, [vehicle]);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!vehicle) return null;

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = Object.fromEntries(
                Object.entries(form).filter(([, value]) => value !== undefined && value !== null && value !== '')
            );
            await updateVehicle({ id: vehicle.id, ...payload }).unwrap();
            toast.success('Vehicle updated successfully');
            if (typeof onSaved === 'function') onSaved(payload);
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to update vehicle');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-2 backdrop-blur-sm sm:p-4 md:p-6">
            <div className="relative my-auto flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-gradient-to-r from-[#001f3f] via-[#002b5c] to-[#003d7a] px-4 py-4 text-white sm:px-6">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">Edit Listing</p>
                        <h2 className="mt-1 text-lg font-bold sm:text-xl">{vehicle.title || 'Update vehicle details'}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                        aria-label="Close edit modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f2ff] text-[#001f3f]"><Car size={17} /></div>
                                <h3 className="text-base font-bold text-slate-900">Vehicle Information</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {editableFields.slice(0, 13).map((field) => (
                                    <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2 lg:col-span-3' : ''}>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">{field.label}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                rows={4}
                                                value={form[field.key] ?? ''}
                                                onChange={(e) => setField(field.key, e.target.value)}
                                                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#001f3f] focus:bg-white focus:outline-none"
                                            />
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={form[field.key] ?? ''}
                                                onChange={(e) => setField(field.key, e.target.value)}
                                                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#001f3f] focus:bg-white focus:outline-none"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f2ff] text-[#001f3f]"><MapPin size={17} /></div>
                                <h3 className="text-base font-bold text-slate-900">Location</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {editableFields.slice(13).map((field) => (
                                    <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2 lg:col-span-4' : ''}>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">{field.label}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                rows={4}
                                                value={form[field.key] ?? ''}
                                                onChange={(e) => setField(field.key, e.target.value)}
                                                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#001f3f] focus:bg-white focus:outline-none"
                                            />
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={form[field.key] ?? ''}
                                                onChange={(e) => setField(field.key, e.target.value)}
                                                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#001f3f] focus:bg-white focus:outline-none"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border-2 border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#002a55] disabled:opacity-60"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export const VehicleDetailModal = ({ listing, onClose, onEdit }) => {
    const [showGallery, setShowGallery] = useState(false);

    // Lock background scroll while this modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Close on Escape key (only when the inner gallery isn't open)
    useEffect(() => {
        if (showGallery) return;
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose, showGallery]);

    if (!listing) return null;

    const status = String(listing.status || listing.stage || 'PENDING').toUpperCase();
    const approval = approvalMeta[status] || approvalMeta.PENDING;
    const images = Array.isArray(listing.images) ? listing.images : [];
    const rejectionReason = listing.rejectReason || listing.rejectedReason || listing.reason || listing.adminReason || '';

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-2 sm:p-4 md:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="animate-fadeInUp relative my-auto flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
                    <div className="min-w-0 pr-4">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">{listing.title || 'Untitled Listing'}</h2>
                            {listing.price !== undefined && (
                                <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:text-sm">
                                    {formatValue('price', listing.price)}
                                </span>
                            )}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${approval.dot}`} />
                            <span className="text-xs font-semibold text-slate-500">{approval.label}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                        aria-label="Close details"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
                    {/* Big status banner */}
                    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${approval.color}`}>
                        <approval.icon size={20} className="mt-0.5 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-sm font-bold">{approval.label}</p>
                            {status === 'REJECTED' && (
                                <div className="mt-2">
                                    <p className="text-sm font-semibold">Admin rejection reason</p>
                                    <textarea
                                        readOnly
                                        value={rejectionReason || 'No specific reason was provided by the admin.'}
                                        rows={3}
                                        className="mt-2 w-full resize-none rounded-xl border border-red-200 bg-white/90 p-3 text-sm text-red-800 shadow-inner outline-none"
                                    />
                                </div>
                            )}
                            {(status === 'PENDING' || status === 'UNDER_VERIFICATION') && (
                                <p className="mt-1 text-sm">This listing is awaiting review and is not yet visible to buyers.</p>
                            )}
                        </div>
                    </div>

                    {/* Image strip */}
                    {images.length > 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ImageIcon size={16} className="text-slate-400" />
                                    <h4 className="text-sm font-bold text-slate-900">Photos ({images.length})</h4>
                                </div>
                                <button
                                    onClick={() => setShowGallery(true)}
                                    className="flex items-center gap-1.5 rounded-lg bg-[#001f3f] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#001f3f]/90"
                                >
                                    <Eye size={13} /> View full
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                                {images.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setShowGallery(true)}
                                        className="aspect-square overflow-hidden rounded-lg border border-slate-200 transition hover:opacity-80"
                                    >
                                        <img src={url} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-400">
                            <ImageIcon size={16} /> No photos uploaded
                        </div>
                    )}

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatChip icon={Car} label="Category" value={listing.category} />
                        <StatChip icon={Eye} label="Views" value={listing.views} />
                        <StatChip icon={Tag} label="Brand" value={listing.brand} />
                        <StatChip icon={Tag} label="Model" value={listing.model} />
                    </div>

                    {/* Description */}
                    {listing.description && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="mb-2 text-sm font-bold text-slate-900">Description</h4>
                            <p className="text-sm leading-relaxed text-slate-600">{listing.description}</p>
                        </div>
                    )}

                    {/* Grouped detail sections */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {SECTIONS.map((section) => (
                            <InfoSection key={section.title} icon={section.icon} title={section.title} fields={section.fields} row={listing} />
                        ))}

                        {Array.isArray(listing.features) && listing.features.length > 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]">
                                        <Tag size={15} />
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900">Features</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {listing.features.map((f) => (
                                        <span key={f} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Documents */}
                    {(listing.rcFront || listing.insuranceDocument) && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]">
                                    <FileText size={15} />
                                </div>
                                <h4 className="text-base font-bold text-slate-900">Documents</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {listing.rcFront && (
                                    <a
                                        href={listing.rcFront}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                        <FileText size={15} /> RC Document <ExternalLink size={12} />
                                    </a>
                                )}
                                {listing.insuranceDocument && (
                                    <a
                                        href={listing.insuranceDocument}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                        <FileText size={15} /> Insurance Document <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Buyer details */}
                    {status === 'SOLD' && (listing.soldToName || listing.soldToPhone || listing.soldToEmail || listing.soldPrice) && (
                        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2 border-b border-purple-100 pb-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                                    <ShoppingBag size={15} />
                                </div>
                                <h4 className="text-base font-bold text-slate-900">Buyer Details</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
                                {listing.soldToName && (
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Buyer Name</p>
                                        <p className="mt-0.5 text-sm font-semibold text-slate-800">{listing.soldToName}</p>
                                    </div>
                                )}
                                {listing.soldToPhone && (
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Phone</p>
                                        <p className="mt-0.5 text-sm font-semibold text-slate-800">{listing.soldToPhone}</p>
                                    </div>
                                )}
                                {listing.soldToEmail && (
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Email</p>
                                        <p className="mt-0.5 text-sm font-semibold text-slate-800">{listing.soldToEmail}</p>
                                    </div>
                                )}
                                {listing.soldPrice && (
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Sold Price</p>
                                        <p className="mt-0.5 text-sm font-semibold text-slate-800">{formatValue('price', listing.soldPrice)}</p>
                                    </div>
                                )}
                                {listing.soldAt && (
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Sold Date</p>
                                        <p className="mt-0.5 text-sm font-semibold text-slate-800">{formatValue('soldAt', listing.soldAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
                    {onEdit && (
                        <button
                            onClick={() => { onEdit(listing); onClose(); }}
                            className="flex items-center gap-1.5 rounded-xl border-2 border-[#001f3f] px-5 py-2.5 text-xs font-bold text-[#001f3f] transition hover:bg-[#e6f2ff]"
                        >
                            <Pencil size={14} /> Save Changes
                        </button>
                    )}
                    <button onClick={onClose} className="rounded-xl border-2 border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                        Close
                    </button>
                </div>
                {showGallery && <ImageGalleryModal images={images} onClose={() => setShowGallery(false)} />}
            </div>
        </div>,
        document.body
    );
};