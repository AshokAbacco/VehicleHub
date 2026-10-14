import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import {
    Search, Eye, Trash2, Pencil, X, Tag, CheckCircle2, Clock, XCircle, Archive,
    ShoppingBag, Car, MapPin, User, FileText, ImageIcon, ChevronLeft, ChevronRight, ExternalLink,
    ChevronsLeft, ChevronsRight,
} from 'lucide-react';

const statusColors = {
    Active: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    Pending: 'bg-amber-50 text-amber-600 border border-amber-200',
    Confirmed: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    Paid: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    Settled: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    Processing: 'bg-amber-50 text-amber-600 border border-amber-200',
    Verified: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    'Pending review': 'bg-amber-50 text-amber-600 border border-amber-200',
    Lead: 'bg-cyan-50 text-cyan-600 border border-cyan-200',
    Rejected: 'bg-red-50 text-red-600 border border-red-200',
    APPROVED: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-600 border border-amber-200',
    UNDER_VERIFICATION: 'bg-blue-50 text-blue-600 border border-blue-200',
    REJECTED: 'bg-red-50 text-red-600 border border-red-200',
    SOLD: 'bg-slate-100 text-slate-600 border border-slate-200',
    ARCHIVED: 'bg-slate-100 text-slate-500 border border-slate-200',
    DRAFT: 'bg-cyan-50 text-cyan-600 border border-cyan-200',
};

const approvalMeta = {
    APPROVED: { icon: CheckCircle2, label: 'Approved — live for buyers', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    PENDING: { icon: Clock, label: 'Pending admin approval', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    UNDER_VERIFICATION: { icon: Clock, label: 'Under verification by admin', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    REJECTED: { icon: XCircle, label: 'Rejected by admin', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
    SOLD: { icon: ShoppingBag, label: 'Marked as sold', color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
    ARCHIVED: { icon: Archive, label: 'Archived', color: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
    DRAFT: { icon: Tag, label: 'Draft — not submitted', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500' },
};

const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

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

const HIDDEN_KEYS = new Set([
    'id', 'sellerId', 'images', 'documents', 'rcFront', 'insuranceDocument', 'status',
    'title', 'category', 'price', 'views', 'description', 'features',
]);

const ImageGalleryModal = ({ images, onClose }) => {
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!images || images.length === 0) return null;

    return createPortal(
        <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
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
                    alt={`Listing photo ${activeImage + 1}`}
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
                                    className={`h-14 w-14 overflow-hidden rounded-lg border-2 transition ${idx === activeImage ? 'scale-105 border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                                >
                                    <img src={img} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};

const DetailsModal = ({ row, onClose, onDelete, onEdit }) => {
    const [showGallery, setShowGallery] = useState(false);
    const approval = row.status ? approvalMeta[row.status] : null;
    const images = Array.isArray(row.images) ? row.images : [];
    const rejectionReason = row.rejectReason || row.rejectedReason || row.reason || row.adminReason || '';

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);
    useEffect(() => {
        if (showGallery) return;
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose, showGallery]);

    const coveredKeys = new Set(SECTIONS.flatMap((s) => s.fields.map((f) => f.key)));
    const leftoverKeys = Object.keys(row).filter((k) => !HIDDEN_KEYS.has(k) && !coveredKeys.has(k));
    const leftoverFields = leftoverKeys.map((k) => ({ key: k, label: formatLabel(k) }));

    return createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center overflow-y-auto p-2 sm:p-4 md:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="animate-fadeInUp relative my-auto flex h-full max-h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl sm:rounded-3xl">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
                    <div className="min-w-0 pr-4">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">{row.title || 'Untitled Listing'}</h2>
                            {row.price !== undefined && (
                                <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:text-sm">
                                    {formatValue('price', row.price)}
                                </span>
                            )}
                        </div>
                        {approval && (
                            <div className="mt-1.5 flex items-center gap-2">
                                <span className={`h-2 w-2 shrink-0 rounded-full ${approval.dot}`} />
                                <span className="text-xs font-semibold text-slate-500">{approval.label}</span>
                            </div>
                        )}
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
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatChip icon={Car} label="Category" value={row.category} />
                        <StatChip icon={Eye} label="Views" value={row.views} />
                        <StatChip icon={Tag} label="Brand" value={row.brand} />
                        <StatChip icon={Tag} label="Model" value={row.model} />
                    </div>

                    {row.status && String(row.status).toUpperCase() === 'REJECTED' && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
                            <h4 className="mb-2 text-sm font-bold text-red-700">Rejection reason</h4>
                            <textarea
                                readOnly
                                value={rejectionReason || 'No specific reason was provided by the admin.'}
                                rows={3}
                                className="w-full resize-none rounded-xl border border-red-200 bg-white p-3 text-sm text-red-800 outline-none"
                            />
                        </div>
                    )}

                    {row.description && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="mb-2 text-sm font-bold text-slate-900">Description</h4>
                            <p className="text-sm leading-relaxed text-slate-600">{row.description}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {SECTIONS.map((section) => (
                            <InfoSection key={section.title} icon={section.icon} title={section.title} fields={section.fields} row={row} />
                        ))}

                        {Array.isArray(row.features) && row.features.length > 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]">
                                        <Tag size={15} />
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900">Features</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {row.features.map((f) => (
                                        <span key={f} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {leftoverFields.length > 0 && (
                            <InfoSection icon={Tag} title="Other Details" fields={leftoverFields} row={row} />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex flex-wrap items-center gap-2">
                        {images.length > 0 && (
                            <button
                                onClick={() => setShowGallery(true)}
                                className="flex items-center gap-2 rounded-xl bg-[#001f3f] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#001f3f]/90"
                            >
                                <ImageIcon size={16} /> View Photos ({images.length})
                            </button>
                        )}
                        {row.rcFront && (
                            <a
                                href={row.rcFront}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                <FileText size={15} /> RC Doc <ExternalLink size={12} />
                            </a>
                        )}
                        {row.insuranceDocument && (
                            <a
                                href={row.insuranceDocument}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                <FileText size={15} /> Insurance Doc <ExternalLink size={12} />
                            </a>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-xl border-2 border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                        >
                            Close
                        </button>
                        {onEdit && (
                            <button
                                onClick={() => { onEdit(row); onClose(); }}
                                className="flex items-center gap-1.5 rounded-xl border-2 border-[#001f3f] px-5 py-2.5 text-xs font-bold text-[#001f3f] transition hover:bg-[#e6f2ff]"
                            >
                                <Pencil size={14} /> Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => { onDelete(row); onClose(); }}
                                className="flex items-center gap-1.5 rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-600"
                            >
                                <Trash2 size={15} /> Delete
                            </button>
                        )}
                    </div>
                </div>
            </div >

            {showGallery && <ImageGalleryModal images={images} onClose={() => setShowGallery(false)} />}
        </div >,
        document.body
    );
};

// ============================================================
// Pagination bar
// ============================================================
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const PaginationBar = ({ page, pageCount, pageSize, totalItems, onPageChange, onPageSizeChange }) => {
    const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalItems);

    const pageNumbers = useMemo(() => {
        if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
        const set = new Set([1, 2, pageCount - 1, pageCount, page - 1, page, page + 1]);
        const nums = [...set].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
        const withGaps = [];
        nums.forEach((n, idx) => {
            if (idx > 0 && n - nums[idx - 1] > 1) withGaps.push('...');
            withGaps.push(n);
        });
        return withGaps;
    }, [page, pageCount]);

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>
                    Showing <span className="font-semibold text-slate-700">{from}</span>–
                    <span className="font-semibold text-slate-700">{to}</span> of{' '}
                    <span className="font-semibold text-slate-700">{totalItems}</span>
                </span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 focus:border-[#001f3f] focus:outline-none"
                >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>{size} / page</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(1)} disabled={page === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="First page">
                    <ChevronsLeft size={14} />
                </button>
                <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page">
                    <ChevronLeft size={14} />
                </button>
                {pageNumbers.map((n, idx) =>
                    n === '...' ? (
                        <span key={`gap-${idx}`} className="px-1.5 text-xs text-slate-400">…</span>
                    ) : (
                        <button
                            key={n}
                            onClick={() => onPageChange(n)}
                            className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${n === page ? 'bg-[#001f3f] text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            {n}
                        </button>
                    )
                )}
                <button onClick={() => onPageChange(page + 1)} disabled={page === pageCount} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page">
                    <ChevronRight size={14} />
                </button>
                <button onClick={() => onPageChange(pageCount)} disabled={page === pageCount} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Last page">
                    <ChevronsRight size={14} />
                </button>
            </div>
        </div>
    );
};

export const GenericTablePage = ({
    title,
    subtitle,
    columns,
    rows,
    emptyText = 'Nothing here yet.',
    onRowAction,
    onDelete,
    onEdit,
    defaultPageSize = 10,
}) => {
    const [search, setSearch] = useState('');
    const [localRows, setLocalRows] = useState(rows);
    const [viewingRow, setViewingRow] = useState(null);
    const [confirmDeleteRow, setConfirmDeleteRow] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    useEffect(() => {
        setLocalRows(rows);
    }, [rows]);

    const filtered = useMemo(
        () =>
            localRows.filter((row) =>
                Object.values(row).some((val) => String(val).toLowerCase().includes(search.trim().toLowerCase()))
            ),
        [localRows, search]
    );

    useEffect(() => {
        setPage(1);
    }, [search, pageSize]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, pageCount);

    const paginatedRows = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, safePage, pageSize]);

    const handleDelete = (row) => {
        setLocalRows((prev) => prev.filter((r) => r.id !== row.id));
        onDelete?.(row);
    };

    return (
        <div className="space-y-6">
            <Helmet><title>{title} | VehicleHub Seller</title></Helmet>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                    </div>
                    <span className="w-fit rounded-full border border-slate-200 bg-[#e6f2ff] px-3 py-1 text-xs font-semibold text-[#001f3f]">
                        {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
                    </span>
                </div>

                <div className="mt-4 flex w-full max-w-sm items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 transition focus-within:border-[#001f3f] focus-within:bg-white">
                    <Search size={15} className="shrink-0 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="divide-y divide-slate-100 md:hidden">
                    {paginatedRows.length === 0 ? (
                        <p className="px-5 py-12 text-center text-sm text-slate-400">{emptyText}</p>
                    ) : paginatedRows.map((row) => (
                        <article key={row.id} className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-900">{row.title || row.name || row.vehicle || 'Listing'}</p>
                                    <p className="mt-1 text-xs text-slate-500">{row.category || row.type || ''}</p>
                                </div>
                                {row.status && (
                                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColors[String(row.status).toUpperCase()] || statusColors[row.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {String(row.status).replaceAll('_', ' ')}
                                    </span>
                                )}
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                {columns.filter((col) => col.key !== 'title' && col.key !== 'status').slice(0, 4).map((col) => (
                                    <div key={col.key} className="min-w-0">
                                        <p className="text-slate-400">{col.label}</p>
                                        <p className="mt-0.5 truncate font-semibold text-slate-700">{col.render ? col.render(row) : row[col.key] || '—'}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                                <button onClick={() => { setViewingRow(row); onRowAction?.(row); }} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600" aria-label="View details"><Eye size={14} /> View</button>
                                {onEdit && <button onClick={() => onEdit(row)} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600" aria-label="Edit"><Pencil size={14} /> Edit</button>}
                                <button onClick={() => setConfirmDeleteRow(row)} className="flex h-9 w-10 items-center justify-center rounded-lg border border-red-100 text-red-500" aria-label="Delete"><Trash2 size={14} /></button>
                            </div>
                        </article>
                    ))}
                </div>
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-150 text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                {columns.map((col) => (
                                    <th key={col.key} className="px-5 py-4 font-semibold">{col.label}</th>
                                ))}
                                <th className="px-5 py-4 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedRows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className="px-5 py-12 text-center text-slate-400">
                                        {emptyText}
                                    </td>
                                </tr>
                            ) : (
                                paginatedRows.map((row) => (
                                    <tr key={row.id} className="transition hover:bg-slate-50">
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-5 py-4 text-slate-700">
                                                {col.render ? col.render(row) : (
                                                    statusColors[row[col.key]] ? (
                                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[row[col.key]]}`}>
                                                            {row[col.key]}
                                                        </span>
                                                    ) : row[col.key]
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => { setViewingRow(row); onRowAction?.(row); }}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#001f3f] hover:bg-[#e6f2ff] hover:text-[#001f3f]"
                                                    aria-label="View details"
                                                    title="View details"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(row)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#001f3f] hover:bg-[#e6f2ff] hover:text-[#001f3f]"
                                                        aria-label="Edit"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setConfirmDeleteRow(row)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-400 hover:bg-red-50 hover:text-red-500"
                                                    aria-label="Delete"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <PaginationBar
                    page={safePage}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    totalItems={filtered.length}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                />
            </div>

            {viewingRow && (
                <DetailsModal
                    row={viewingRow}
                    onClose={() => setViewingRow(null)}
                    onDelete={() => setConfirmDeleteRow(viewingRow)}
                    onEdit={onEdit}
                />
            )}

            {confirmDeleteRow && createPortal(
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDeleteRow(null)} />
                    <div className="animate-fadeInUp relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                            <Trash2 size={20} />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-slate-900">Delete this listing?</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            "{confirmDeleteRow.title}" will be permanently removed. This can't be undone.
                        </p>
                        <div className="mt-5 flex gap-2">
                            <button
                                onClick={() => setConfirmDeleteRow(null)}
                                className="flex-1 rounded-lg border-2 border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { handleDelete(confirmDeleteRow); setViewingRow(null); setConfirmDeleteRow(null); }}
                                className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};