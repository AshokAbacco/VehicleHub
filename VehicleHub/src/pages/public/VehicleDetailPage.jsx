// VehicleHub/VehicleHub/src/pages/public/VehicleDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    CheckCircle2, ChevronRight, ShieldCheck, Sparkles, Truck,
    ChevronLeft, Share2, Heart, MapPin, CalendarDays, Fuel, Gauge, EyeOff,
    Settings2, Palette, FileText, Home, Eye, Phone, Loader2, Clock, XCircle, AlertTriangle, ShoppingBag, Zap, Send, Check,
} from 'lucide-react';
import { useGetVehicleByIdQuery } from '../../services/vehicleApiSlice.js';
import { formatCurrency } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAuthGate } from '../../context/AuthGateContext.jsx';
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetMyPurchaseRequestsQuery } from '../../services/buyerApiSlice.js';
import { PurchaseRequestModal } from '../../components/buyer/PurchaseRequestModal.jsx';

const statusMeta = {
    PENDING: {
        icon: Clock,
        color: 'bg-amber-50 border-amber-200 text-amber-800',
        title: "This listing isn't live yet",
        message: 'This vehicle is still awaiting admin approval and is not visible to other buyers.',
    },
    REJECTED: {
        icon: XCircle,
        color: 'bg-red-50 border-red-200 text-red-800',
        title: 'This listing was rejected',
        message: 'This vehicle did not pass admin review and is not available for viewing by buyers.',
    },
    DRAFT: {
        icon: AlertTriangle,
        color: 'bg-cyan-50 border-cyan-200 text-cyan-800',
        title: 'This is a draft listing',
        message: "The seller hasn't submitted this vehicle for review yet.",
    },
    ARCHIVED: {
        icon: AlertTriangle,
        color: 'bg-slate-100 border-slate-200 text-slate-700',
        title: 'This listing has been archived',
        message: 'This vehicle is no longer active on the marketplace.',
    },
    SOLD: {
        icon: CheckCircle2,
        color: 'bg-purple-50 border-purple-200 text-purple-800',
        title: 'This vehicle has been sold',
        message: 'This listing is no longer available for purchase.',
    },
};

const enquiryMeta = {
    PENDING: { label: 'Enquiry sent', detail: 'The seller will review your request shortly.', className: 'border-amber-200 bg-amber-50 text-amber-900', icon: Clock },
    ACCEPTED: { label: 'Enquiry accepted', detail: 'The seller accepted your purchase request.', className: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: CheckCircle2 },
    REJECTED: { label: 'Enquiry declined', detail: 'The seller declined this purchase request.', className: 'border-red-200 bg-red-50 text-red-900', icon: XCircle },
    CANCELLED: { label: 'Enquiry cancelled', detail: 'You cancelled this purchase request.', className: 'border-slate-200 bg-slate-100 text-slate-700', icon: XCircle },
};

/** Buy button shared by the mobile action bar and listing actions. */
const BuyNowButton = ({ onClick, disabled, full = true, size = 'lg', label = 'Buy Now' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`cursor-pointer group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-emerald-900 bg-emerald-800 font-bold text-white shadow-lg shadow-emerald-950/20 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${full ? 'w-full' : ''
            } ${size === 'lg' ? 'py-3.5 text-sm' : 'py-3 text-sm'}`}
    >
        <ShoppingBag size={17} className="relative transition-transform duration-200 group-hover:scale-110" />
        <span className="relative">{label}</span>
        <Zap size={14} className="relative shrink-0 fill-current opacity-80" />
    </button>
);

export const VehicleDetailPage = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const { requireAuth } = useAuthGate();

    const { data, isLoading, isError } = useGetVehicleByIdQuery(id);
    const vehicle = data?.data || data;

    const [activeImage, setActiveImage] = useState(0);
    const [savedOverride, setSavedOverride] = useState(null);
    const [showPhone, setShowPhone] = useState(false);
    const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const { data: purchaseRequestsData } = useGetMyPurchaseRequestsQuery(undefined, { skip: !isAuthenticated });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [id]);

    const wishlistItems = wishlistData?.data || wishlistData || [];
    const remoteSaved = wishlistItems.some((item) => (item.vehicleListingId || item.vehicleListing?.id) === id);
    const saved = savedOverride ?? remoteSaved;
    const purchaseRequests = purchaseRequestsData?.data || [];
    const vehicleEnquiry = purchaseRequests
        .filter((request) => String(request.vehicleListingId) === String(id))
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))[0];
    const enquiry = vehicleEnquiry ? (enquiryMeta[vehicleEnquiry.status] || enquiryMeta.PENDING) : null;
    // A pending or accepted request blocks a new one (the server rejects duplicates too).
    // Declined / cancelled requests let the buyer send a fresh offer.
    const requestLocked = ['PENDING', 'ACCEPTED'].includes(vehicleEnquiry?.status);
    const lockedLabel = vehicleEnquiry?.status === 'ACCEPTED' ? 'Request Accepted' : 'Enquiry Sent';

    const handleWishlist = () => {
        const updateWishlist = async () => {
            if (saved) await removeFromWishlist(id).unwrap();
            else await addToWishlist(id).unwrap();
            setSavedOverride(!saved);
        };
        if (isAuthenticated) updateWishlist();
        else requireAuth(updateWishlist);
    };

    const runBuyerAction = (action) => {
        if (isAuthenticated) action();
        else requireAuth(action);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#001f3f]" />
                    <p className="text-sm text-slate-500">Loading vehicle details...</p>
                </div>
            </div>
        );
    }

    if (isError || !vehicle) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
                <XCircle size={28} className="text-red-400" />
                <p className="text-base font-semibold text-slate-700">Vehicle not found</p>
                <p className="max-w-sm text-sm text-slate-500">This listing may have been removed or the link is incorrect.</p>
                <Link to="/search" className="mt-2 rounded-lg bg-[#001f3f] px-4 py-2 text-sm font-bold text-white hover:bg-[#002a55]">
                    Browse other vehicles
                </Link>
            </div>
        );
    }

    const isOwner = user?.id === vehicle.sellerId;
    const status = vehicle.status || 'PENDING';
    const isPubliclyVisible = status === 'APPROVED' || status === 'AVAILABLE';

    // Not approved: only the owning seller or an admin should ever land here (e.g. previewing their own listing).
    // Show a clear "not live yet" banner instead of the full public page.
    if (!isPubliclyVisible && !isOwner && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        const meta = statusMeta[status] || statusMeta.PENDING;
        const StatusIcon = meta.icon;
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
                <Helmet><title>Listing unavailable | VehicleHub</title></Helmet>
                <div className={`flex h-16 w-16 items-center justify-center rounded-full border ${meta.color}`}>
                    <StatusIcon size={28} />
                </div>
                <h1 className="text-xl font-bold text-slate-900">{meta.title}</h1>
                <p className="max-w-sm text-sm text-slate-500">{meta.message}</p>
                <Link to="/search" className="mt-2 rounded-lg bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#002a55]">
                    Browse other vehicles
                </Link>
            </div>
        );
    }

    const images = Array.isArray(vehicle.images) && vehicle.images.length > 0 ? vehicle.images : ['/placeholder-vehicle.png'];

    const specs = [
        { label: 'Category', value: vehicle.category, icon: Settings2 },
        { label: 'Fuel', value: vehicle.fuelType, icon: Fuel },
        { label: 'Transmission', value: vehicle.transmission, icon: Gauge },
        { label: 'KM Driven', value: vehicle.kmDriven ? `${vehicle.kmDriven.toLocaleString('en-IN')} km` : '—', icon: Truck },
        // add "CC" only when the stored value is a bare number ("1497" -> "1497 CC", "199 cc" stays)
        { label: 'Engine Capacity', value: vehicle.engineCapacity ? (/^\d+(\.\d+)?$/.test(String(vehicle.engineCapacity).trim()) ? `${vehicle.engineCapacity} CC` : vehicle.engineCapacity) : '—', icon: Settings2 },
        // fuel efficiency (km/l) — only shown when the listing has it; Vehicle.mileage holds KM driven
        ...(vehicle.fuelEfficiency ? [{ label: 'Mileage', value: `${vehicle.fuelEfficiency} km/l`, icon: Gauge }] : []),
        { label: 'Ownership', value: vehicle.ownership ? `${vehicle.ownership}${({ 1: 'st', 2: 'nd', 3: 'rd' })[vehicle.ownership] || 'th'} owner` : '—', icon: FileText },
        { label: 'Color', value: vehicle.color || '—', icon: Palette },
        { label: 'Registration No.', value: vehicle.registrationNumber || '—', icon: FileText },
        { label: 'VIN / Chassis', value: vehicle.vin || '—', icon: FileText },
        { label: 'Mfg. Year', value: vehicle.manufacturingYear || '—', icon: CalendarDays },
        { label: 'Reg. Year', value: vehicle.registrationYear || '—', icon: CalendarDays },
        { label: 'Seating Capacity', value: vehicle.seatingCapacity || '—', icon: Settings2 },
        { label: 'RC Available', value: vehicle.rcAvailable ? 'Yes' : 'No', icon: FileText },
        { label: 'Insurance', value: vehicle.insuranceAvailable ? 'Valid' : 'Not available', icon: ShieldCheck },
        { label: 'PUC Certificate', value: vehicle.pollutionCertificate ? 'Yes' : 'No', icon: FileText },
        { label: 'Service Book', value: vehicle.serviceBook ? 'Available' : 'Not available', icon: FileText },
        { label: 'Number of Keys', value: vehicle.numberOfKeys ?? '—', icon: FileText },
        { label: 'Accident History', value: vehicle.accidentHistory ? 'Yes' : 'No', icon: AlertTriangle },
        { label: 'Flood Damage', value: vehicle.floodDamage ? 'Yes' : 'No', icon: AlertTriangle },
        { label: 'Condition', value: vehicle.vehicleCondition || '—', icon: CheckCircle2 },
        { label: 'Engine Condition', value: vehicle.engineCondition || '—', icon: Settings2 },
        { label: 'Tyre Condition', value: vehicle.tyreCondition || '—', icon: Settings2 },
        { label: 'Battery Condition', value: vehicle.batteryCondition || '—', icon: Settings2 },
        { label: 'Negotiable', value: vehicle.negotiable ? 'Yes' : 'No', icon: FileText },
        { label: 'EMI Available', value: vehicle.emiAvailable ? 'Yes' : 'No', icon: FileText },
    ];

    const location = [vehicle.area, vehicle.city, vehicle.state].filter(Boolean).join(', ') || 'Pan India';
    const nonApprovedMeta = !isPubliclyVisible ? (statusMeta[status] || statusMeta.PENDING) : null;

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
            <Helmet>
                <title>{vehicle.title} | VehicleHub</title>
                <meta name="description" content={vehicle.description || vehicle.title} />
            </Helmet>

            {/* Bottom padding on mobile so the sticky bar never covers content */}
            <div className="mx-auto w-full max-w-7xl px-3 py-4 pb-28 sm:px-4 sm:py-5 lg:px-8 lg:pb-5">

                {/* Preview banner — only shown to the owner/admin when the listing isn't approved */}
                {nonApprovedMeta && (
                    <div className={`mb-4 flex items-start gap-3 rounded-xl border p-4 ${nonApprovedMeta.color}`}>
                        <nonApprovedMeta.icon size={20} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold">{nonApprovedMeta.title} — Preview mode</p>
                            <p className="mt-0.5 text-sm">{nonApprovedMeta.message} You're seeing this because you're the {isOwner ? 'seller' : 'admin'}.</p>
                            {status === 'REJECTED' && vehicle.rejectReason && (
                                <p className="mt-1 text-sm font-semibold">Reason: {vehicle.rejectReason}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Breadcrumbs */}
                <nav className="mb-3 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs text-slate-500 [&::-webkit-scrollbar]:hidden">
                    <Link to="/" className="flex shrink-0 items-center gap-1 hover:text-[#001f3f]"><Home size={12} /> Home</Link>
                    <ChevronRight size={11} className="shrink-0" />
                    <Link to="/search" className="shrink-0 hover:text-[#001f3f]">Search</Link>
                    <ChevronRight size={11} className="shrink-0" />
                    <Link to={`/search?category=${vehicle.category}`} className="shrink-0 capitalize hover:text-[#001f3f]">{vehicle.category}</Link>
                    <ChevronRight size={11} className="shrink-0" />
                    <span className="min-w-0 truncate font-medium text-slate-700">{vehicle.title}</span>
                </nav>

                {/* Image gallery */}
                <div className="relative mb-6 overflow-hidden rounded-xl border border-slate-200 bg-black">
                    <div className="relative flex h-[240px] items-center justify-center sm:h-[400px] lg:h-[500px]">
                        <img src={images[activeImage]} alt={`${vehicle.title} ${activeImage + 1}`} className="h-full w-auto max-w-full object-contain" />

                        <div className="absolute right-4 top-4 flex items-center gap-2">
                            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60" aria-label="Share">
                                <Share2 size={16} />
                            </button>
                            <button
                                onClick={handleWishlist}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
                                aria-label="Save vehicle"
                            >
                                <Heart size={16} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-red-400' : ''} />
                            </button>
                        </div>

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 sm:h-11 sm:w-11"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={22} />
                                </button>
                                <button
                                    onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 sm:h-11 sm:w-11"
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={22} />
                                </button>
                            </>
                        )}

                        <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                            {activeImage + 1} / {images.length}
                        </span>
                    </div>

                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto border-t border-white/10 bg-slate-950 p-2.5 [&::-webkit-scrollbar]:hidden">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`h-12 w-16 shrink-0 overflow-hidden rounded border-2 transition sm:h-14 sm:w-20 ${activeImage === index ? 'border-white' : 'border-transparent opacity-50 hover:opacity-90'}`}
                                >
                                    <img src={img} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

                    {/* LEFT COLUMN */}
                    <div className="min-w-0 space-y-5">

                        {/* Title block */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                            {status !== 'APPROVED' && (
                                <span className="mb-2 inline-block rounded bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase text-amber-700">
                                    {status}
                                </span>
                            )}
                            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{vehicle.title}</h1>
                            {vehicle.variant && <p className="mt-1 text-sm text-slate-500">{vehicle.brand} {vehicle.model} · {vehicle.variant}</p>}

                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 sm:text-sm">
                                <span className="flex items-center gap-1"><Fuel size={13} className="shrink-0" /> {vehicle.fuelType}</span>
                                <span className="flex items-center gap-1"><Truck size={13} className="shrink-0" /> {vehicle.kmDriven ? `${vehicle.kmDriven.toLocaleString('en-IN')} km` : '—'}</span>
                                <span className="flex items-center gap-1"><Gauge size={13} className="shrink-0" /> {vehicle.transmission}</span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><MapPin size={12} /> {location}</span>
                                <span className="flex items-center gap-1"><Eye size={12} /> {vehicle.views ?? 0} views</span>
                            </div>
                        </div>

                        {/* Overview */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                            <h2 className="mb-4 text-base font-bold text-slate-900">Overview</h2>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                <div className="flex items-start gap-2.5">
                                    <FileText size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-400">Ownership</p>
                                        <p className="text-sm font-semibold text-slate-900">{vehicle.ownership || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-400">Location</p>
                                        <p className="text-sm font-semibold text-slate-900">{location}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <CalendarDays size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-400">Posting date</p>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                            <h2 className="mb-3 text-base font-bold text-slate-900">Description</h2>
                            <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{vehicle.description || 'No description provided.'}</p>

                            <p className="mb-2 mt-5 text-sm font-bold text-slate-900">Complete vehicle information:</p>
                            <div className="grid gap-1.5 text-sm text-slate-600 sm:grid-cols-2">
                                {specs.map(({ label, value }) => (
                                    <p key={label}><span className="text-slate-400">{label}:</span> {value}</p>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        {vehicle.features?.length > 0 && (
                            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                                <div className="mb-3 flex items-center gap-2 text-[#001f3f]">
                                    <Sparkles size={16} /> <span className="text-base font-bold">Why buyers love this vehicle</span>
                                </div>
                                <ul className="grid gap-2 sm:grid-cols-2">
                                    {vehicle.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-sm text-slate-700">
                                            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" /> {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Trust badges */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                            <div className="mb-3 flex items-center gap-2 text-[#001f3f]">
                                <ShieldCheck size={16} /> <span className="text-base font-bold">Verified documents & trust</span>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-3">
                                {[
                                    { label: 'RC verified', ok: vehicle.rcAvailable },
                                    { label: 'Insurance valid', ok: vehicle.insuranceAvailable },
                                    { label: 'No accident history', ok: !vehicle.accidentHistory },
                                ].map((doc) => (
                                    <div
                                        key={doc.label}
                                        className={`flex items-center gap-2 rounded-lg p-2.5 text-sm ${doc.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                                    >
                                        {doc.ok ? <CheckCircle2 size={15} className="shrink-0" /> : <XCircle size={15} className="shrink-0" />} {doc.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Documents, if present */}
                        {(vehicle.rcFront || vehicle.insuranceDocument) && (
                            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                                <h2 className="mb-3 text-base font-bold text-slate-900">Documents</h2>
                                <div className="flex flex-wrap gap-2">
                                    {vehicle.rcFront && (
                                        <a href={vehicle.rcFront} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                                            <FileText size={14} /> RC Document
                                        </a>
                                    )}
                                    {vehicle.insuranceDocument && (
                                        <a href={vehicle.insuranceDocument} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                                            <FileText size={14} /> Insurance Document
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN — hidden on mobile since price/buy now live in the sticky bottom bar there */}
                    <div className="hidden min-w-0 space-y-4 lg:sticky lg:top-24 lg:block lg:self-start">

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="bg-gradient-to-br from-slate-950 via-[#002d4f] to-emerald-900 px-5 py-5 text-white">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">Vehicle price</p>
                                <p className="mt-1 text-3xl font-black tracking-tight">{formatCurrency(vehicle.price)}</p>
                                {vehicle.negotiable && <span className="mt-2 inline-flex rounded-full bg-emerald-300/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">Negotiable price</span>}
                            </div>

                            <div className="p-5">
                                {enquiry && (
                                    <div className={`mb-4 flex items-start gap-3 rounded-xl border px-3.5 py-3 ${enquiry.className}`}>
                                        <enquiry.icon size={18} className="mt-0.5 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold">{enquiry.label}</p>
                                            <p className="mt-0.5 text-xs opacity-80">{enquiry.detail}</p>
                                            <p className="mt-1 text-xs font-semibold">Offer: {formatCurrency(vehicleEnquiry.offerPrice)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Buy Now — compact on desktop, full width on mobile handled by sticky bar below */}
                                <div className="mt-4 hidden gap-2 lg:flex cursor-pointer">
                                    <button
                                        onClick={() => runBuyerAction(() => setPurchaseModalOpen(true))}
                                        disabled={!isPubliclyVisible || requestLocked}
                                        className="cursor-pointer flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-emerald-900 bg-emerald-800 px-3 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {requestLocked ? <><Check size={14} /> {lockedLabel}</> : <><Send size={14} /> Buy Now</>}
                                    </button>
                                </div>

                                {/* Mobile — stacked full width */}
                                {isPubliclyVisible && (
                                    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-slate-200 bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden">
                                        <button
                                            onClick={() => runBuyerAction(() => setPurchaseModalOpen(true))}
                                            disabled={requestLocked}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-900 bg-emerald-800 py-3 text-sm font-bold text-white shadow-md shadow-emerald-950/20 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {requestLocked ? <><Check size={16} /> {lockedLabel}</> : <><ShoppingBag size={16} /> Buy Now - {formatCurrency(vehicle.price)}</>}
                                        </button>
                                    </div>
                                )}

                                {/* Seller contact — show/hide toggle, compact and polished */}
                                <div className="cursor-pointer mt-3 flex items-center justify-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 transition">
                                    {/* // seller name */}
                                    <span className="text-sm font-bold text-slate-900">{vehicle.sellerName || 'Not provided'}</span>
                                    <Phone size={14} className="shrink-0 text-slate-400" />
                                    {showPhone ? (
                                        <span className="animate-fadeInUp text-sm font-bold text-slate-900">{vehicle.mobileNumber || 'Not provided'}</span>
                                    ) : (
                                        <button
                                            onClick={() => runBuyerAction(() => setShowPhone(true))}
                                            className="cursor-pointer flex items-center gap-1 text-sm font-semibold text-[#001f3f] transition hover:text-[#002a55]"
                                        >
                                            Contact Number
                                            <Eye size={13} />
                                        </button>
                                    )}
                                    {showPhone && (
                                        <button onClick={() => setShowPhone(false)} className="ml-1 text-slate-300 transition hover:text-slate-500" aria-label="Hide number">
                                            <EyeOff size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* Seller profile */}
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#001f3f] to-[#003366] text-base font-bold text-white shadow-sm">
                                    {(vehicle.sellerName || 'S')[0]}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-xs text-slate-500">
                                        Posted By{' '}
                                        <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                                            {vehicle.sellerName || 'Seller'}
                                            <ShieldCheck size={13} className="shrink-0 text-[#001f3f]" />
                                        </span>
                                    </p>
                                    <p className="text-xs text-slate-400">{vehicle.sellerType || 'Individual'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Location card */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">
                            <div className="flex items-center gap-2 text-[#001f3f]">
                                <MapPin size={16} />
                                <span className="text-sm font-bold text-slate-900">Location</span>
                            </div>
                            <p className="mt-1.5 text-sm text-slate-600">{location}</p>
                        </div>

                        {/* Safety tips */}
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm font-bold text-amber-800">Stay safe while buying</p>
                            <ul className="mt-2 space-y-1.5 text-xs text-amber-700">
                                <li>• Meet the seller in a public place</li>
                                <li>• Inspect the vehicle before paying</li>
                                <li>• Never transfer money in advance</li>
                                <li>• Verify RC and insurance documents</li>
                            </ul>
                        </div>
                    </div>

                    {/* Mobile-only compact seller / location / safety cards — right column content, stacked below description on mobile */}
                    <div className="min-w-0 space-y-4 lg:hidden">
                        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <div className="flex w-full items-center justify-between gap-3 p-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#001f3f] to-[#003366] text-base font-bold text-white">
                                        {(vehicle.sellerName || 'S')[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs text-slate-500">
                                            Posted By{' '}
                                            <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                                                {vehicle.sellerName || 'Seller'}
                                                <ShieldCheck size={13} className="shrink-0 text-[#001f3f]" />
                                            </span>
                                        </p>
                                        <p className="text-xs text-slate-400">{vehicle.sellerType || 'Individual'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center gap-2 text-[#001f3f]">
                                <MapPin size={16} />
                                <span className="text-sm font-bold text-slate-900">Location</span>
                            </div>
                            <p className="mt-1.5 text-sm text-slate-600">{location}</p>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm font-bold text-amber-800">Stay safe while buying</p>
                            <ul className="mt-2 space-y-1.5 text-xs text-amber-700">
                                <li>• Meet the seller in a public place</li>
                                <li>• Inspect the vehicle before paying</li>
                                <li>• Never transfer money in advance</li>
                                <li>• Verify RC and insurance documents</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky mobile bottom action bar — price + Buy Now + Show number */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] backdrop-blur-lg lg:hidden">
                <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-lg font-extrabold text-slate-900">{formatCurrency(vehicle.price)}</p>
                        {showPhone ? (
                            <p className="truncate text-xs font-semibold text-slate-500">{vehicle.mobileNumber || 'Not provided'}</p>
                        ) : (
                            <button
                                onClick={() => runBuyerAction(() => setShowPhone(true))}
                                className="flex items-center gap-1 text-xs font-semibold text-[#001f3f] underline"
                            >
                                <Phone size={11} /> Show number
                            </button>
                        )}
                    </div>
                    <div className="w-[52%] shrink-0">
                        <BuyNowButton onClick={() => runBuyerAction(() => setPurchaseModalOpen(true))} disabled={!isPubliclyVisible || requestLocked} label={requestLocked ? lockedLabel : 'Buy Now'} size="sm" />
                    </div>
                </div>
            </div>

            {purchaseModalOpen && <PurchaseRequestModal vehicle={vehicle} onClose={() => setPurchaseModalOpen(false)} />}
        </div>
    );
};