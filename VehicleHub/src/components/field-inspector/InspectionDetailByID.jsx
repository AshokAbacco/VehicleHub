import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    ArrowLeft, Loader2, User, Phone, Mail, MapPin, Car, Calendar,
    Clock, UserCheck, UserCog, CheckCircle2, PlayCircle, Image as ImageIcon,
    ChevronLeft, ChevronRight, X, AlertCircle, Sparkles, IndianRupee, Hash,
} from 'lucide-react';
import {
    useGetInspectionByIdQuery,
    useAcceptInspectionMutation,
    useStartInspectionMutation,
} from '../../services/fieldInspectorApiSlice.js';

const statusBadge = {
    ASSIGNED: 'bg-[#e6f2ff] text-[#001f3f] border-[#001f3f]/20',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
    RE_VERIFICATION: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
};

const priorityBadge = {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-[#e6f2ff] text-[#001f3f]',
    HIGH: 'bg-orange-50 text-orange-700',
    URGENT: 'bg-red-50 text-red-700',
};

const timelineSteps = [
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RE_VERIFICATION', label: 'Re-verification' },
    { key: 'COMPLETED', label: 'Completed' },
];

const InfoRow = ({ label, value, icon: Icon }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="min-w-0">
            <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {Icon && <Icon size={11} />} {label}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{value}</p>
        </div>
    );
};

const SectionCard = ({ icon: Icon, title, children, className = '' }) => (
    <div className={`animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6 ${className}`}>
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]">
                <Icon size={15} />
            </span>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
        </div>
        {children}
    </div>
);

const StatusTimeline = ({ currentStatus }) => {
    if (currentStatus === 'CANCELLED') return null;
    const currentIdx = timelineSteps.findIndex((s) => s.key === currentStatus);

    return (
        <div className="mt-4 flex items-center">
            {timelineSteps.map((s, idx) => {
                const done = idx <= currentIdx;
                const isLast = idx === timelineSteps.length - 1;
                return (
                    <div key={s.key} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                            <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors duration-300 ${done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-300'
                                    }`}
                            >
                                {done ? <CheckCircle2 size={13} /> : idx + 1}
                            </span>
                            <span className={`hidden text-[10px] font-semibold sm:block ${done ? 'text-emerald-700' : 'text-slate-400'}`}>{s.label}</span>
                        </div>
                        {!isLast && (
                            <div className={`mx-1.5 h-0.5 flex-1 rounded transition-colors duration-300 ${idx < currentIdx ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const ImageGalleryModal = ({ images, onClose }) => {
    const [active, setActive] = useState(0);
    if (!images?.length) return null;
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <button onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                <X size={20} />
            </button>
            <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col items-center">
                <img src={images[active]} alt={`Photo ${active + 1}`} className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl" />
                {images.length > 1 && (
                    <>
                        <button onClick={() => setActive((i) => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => setActive((i) => (i + 1) % images.length)} className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
                            <ChevronRight size={20} />
                        </button>
                        <div className="mt-4 flex gap-2 overflow-x-auto p-1">
                            {images.map((img, idx) => (
                                <button key={idx} onClick={() => setActive(idx)} className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${idx === active ? 'border-white' : 'border-transparent opacity-50'}`}>
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

export const InspectionDetailByID = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showGallery, setShowGallery] = useState(false);
    const [justAccepted, setJustAccepted] = useState(false);

    const { data, isLoading, isError } = useGetInspectionByIdQuery(id);
    const [acceptInspection, { isLoading: accepting }] = useAcceptInspectionMutation();
    const [startInspection, { isLoading: starting }] = useStartInspectionMutation();

    const inspection = data?.data;

    const handleAccept = async () => {
        try {
            await acceptInspection(id).unwrap();
            setJustAccepted(true);
            toast.success('Inspection accepted');
            setTimeout(() => setJustAccepted(false), 2000);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to accept inspection');
        }
    };

    const handleStart = async () => {
        try {
            await startInspection(id).unwrap();
            toast.success('Inspection started');
            navigate(`/field-inspector/inspections/${id}/verify`);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to start inspection');
        }
    };

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" /></div>;
    }
    if (isError || !inspection) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-500">
                <AlertCircle size={22} />
                <p className="text-sm font-medium">Inspection not found or you don't have access.</p>
            </div>
        );
    }

    const vehicle = inspection.vehicleListing || {};
    const images = Array.isArray(vehicle.images) ? vehicle.images : [];
    const isAccepted = ['ACCEPTED', 'RE_VERIFICATION'].includes(inspection.status);
    const rejectionMessage = inspection.rejectionReason || inspection.correctionReason || inspection.finalNotes || (inspection.result === 'REJECTED' ? 'Inspection was rejected by the verifier.' : '');

    return (
        <div className="space-y-5 text-slate-900 sm:space-y-6">
            <Helmet><title>{inspection.inspectionNo} | VehicleHub Inspector</title></Helmet>

            {/* Header */}
            <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <button onClick={() => navigate(-1)} className="mt-0.5 shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-[#001f3f]/20 hover:bg-slate-50">
                            <ArrowLeft size={16} />
                        </button>
                        <div className="min-w-0">
                            <p className="flex items-center gap-1 font-mono text-xs font-semibold text-[#001f3f]">
                                <Hash size={11} /> {inspection.inspectionNo}
                            </p>
                            <h1 className="mt-0.5 truncate text-lg font-bold text-slate-900 sm:text-2xl">{vehicle.title}</h1>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors duration-500 ${justAccepted ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : statusBadge[inspection.status] || 'bg-slate-100 text-slate-600'}`}>
                                    {justAccepted ? '✓ Accepted' : inspection.status.replace('_', ' ')}
                                </span>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityBadge[inspection.priority] || 'bg-slate-100 text-slate-600'}`}>
                                    {inspection.priority} priority
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 xs:flex-row">
                        {inspection.status === 'ASSIGNED' && (
                            <button
                                onClick={handleAccept}
                                disabled={accepting}
                                className={`cursor-pointer flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 ${justAccepted ? 'bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-600' : 'bg-[#001f3f] shadow-[#001f3f]/20 hover:bg-[#002a55]'
                                    }`}
                            >
                                {accepting ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : justAccepted ? (
                                    <Sparkles size={16} />
                                ) : (
                                    <UserCheck size={16} />
                                )}
                                {justAccepted ? 'Accepted!' : 'Accept Inspection'}
                            </button>
                        )}
                        {['ASSIGNED', 'ACCEPTED', 'RE_VERIFICATION'].includes(inspection.status) && (
                            <button
                                onClick={handleStart}
                                disabled={starting}
                                className={`cursor-pointer flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 ${isAccepted ? 'border-emerald-500 text-emerald-700 hover:bg-emerald-50' : 'border-[#001f3f] text-[#001f3f] hover:bg-[#e6f2ff]'
                                    }`}
                            >
                                {starting ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                                {inspection.status === 'RE_VERIFICATION' ? 'Start Re-verification Inspection' : 'Start Inspection'}
                            </button>
                        )}
                        {inspection.status === 'IN_PROGRESS' && (
                            <button
                                onClick={() => navigate(`/field-inspector/inspections/${id}/verify`)}
                                className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-md"
                            >
                                <PlayCircle size={16} /> Continue Inspection
                            </button>
                        )}
                        {inspection.status === 'COMPLETED' && (
                            <button
                                onClick={() => navigate(`/field-inspector/reports/${id}`)}
                                className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-[#001f3f] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#002a55] hover:shadow-md"
                            >
                                <CheckCircle2 size={16} /> View Report
                            </button>
                        )}
                    </div>
                </div>

                <StatusTimeline currentStatus={inspection.status} />
            </div>

            {(inspection.status === 'REJECTED' || inspection.status === 'RE_VERIFICATION' || inspection.result === 'REJECTED' || inspection.result === 'NEEDS_CORRECTION') && rejectionMessage && (
                <div className={`animate-fadeInUp rounded-2xl border p-4 sm:p-5 ${inspection.status === 'REJECTED' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                    <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${inspection.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            <AlertCircle size={17} />
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900">
                                {inspection.status === 'RE_VERIFICATION' ? 'Re-verification requested' : inspection.status === 'REJECTED' ? 'Inspection rejected' : 'Correction requested'}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-700">{rejectionMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
                {/* Left column */}
                <div className="space-y-5 sm:space-y-6 lg:col-span-2">
                    {/* Vehicle photos + details */}
                    <SectionCard icon={Car} title="Vehicle Details">
                        {images.length > 0 && (
                            <div className="mb-4">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {images.slice(0, 3).map((img, idx) => (
                                        <button
                                            key={`${img}-${idx}`}
                                            onClick={() => setShowGallery(true)}
                                            className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm ring-1 ring-slate-200 transition duration-300 hover:shadow-lg ${idx === 0 ? 'sm:col-span-2' : ''}`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/10 to-transparent opacity-80" />
                                            <img
                                                src={img}
                                                alt={`${vehicle.title} ${idx + 1}`}
                                                className={`w-full object-cover transition duration-500 group-hover:scale-105 ${idx === 0 ? 'h-52 sm:h-64' : 'h-24 sm:h-32'}`}
                                            />
                                            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3 text-left">
                                                {idx === 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">Vehicle Preview</p>
                                                        <p className="mt-1 text-base font-bold text-white">{vehicle.title}</p>
                                                    </div>
                                                )}
                                                {idx === 2 && images.length > 3 && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm ring-1 ring-white/20">
                                                        <ImageIcon size={12} /> View all
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {images.length > 3 && (
                                    <button
                                        onClick={() => setShowGallery(true)}
                                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-[#001f3f]/15 bg-[#e6f2ff] px-3 py-2 text-xs font-bold text-[#001f3f] transition hover:bg-[#dfeeff]"
                                    >
                                        <ImageIcon size={12} /> View all photos ({images.length})
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
                            <InfoRow label="Brand" value={vehicle.brand} />
                            <InfoRow label="Model" value={vehicle.model} />
                            <InfoRow label="Variant" value={vehicle.variant} />
                            <InfoRow label="Category" value={vehicle.category} />
                            <InfoRow label="Mfg. Year" value={vehicle.manufacturingYear} />
                            <InfoRow label="Reg. Year" value={vehicle.registrationYear} />
                            <InfoRow label="Registration No." value={vehicle.registrationNumber} />
                            <InfoRow label="VIN/Chassis" value={vehicle.vin} />
                            <InfoRow label="Fuel Type" value={vehicle.fuelType} />
                            <InfoRow label="Transmission" value={vehicle.transmission} />
                            <InfoRow label="Color" value={vehicle.color} />
                            <InfoRow label="KM Driven" value={vehicle.kmDriven} />
                            <InfoRow label="Engine Capacity" value={vehicle.engineCapacity ? `${vehicle.engineCapacity} CC` : undefined} />
                            <InfoRow label="Seating Capacity" value={vehicle.seatingCapacity} />
                            <InfoRow label="Ownership" value={vehicle.ownership} />
                            <InfoRow label="Expected Price" icon={IndianRupee} value={vehicle.price ? `₹${vehicle.price.toLocaleString('en-IN')}` : undefined} />
                        </div>
                    </SectionCard>

                    {/* Location */}
                    <SectionCard icon={MapPin} title="Inspection Location">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <InfoRow label="Area" value={vehicle.area} />
                            <InfoRow label="City" value={vehicle.city} />
                            <InfoRow label="State" value={vehicle.state} />
                            <InfoRow label="Pincode" value={vehicle.pincode} />
                            <InfoRow label="Country" value={vehicle.country} />
                        </div>
                        <div className="mt-4">
                            {(vehicle.city || vehicle.state) && (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                        [
                                            vehicle.area,
                                            vehicle.city,
                                            vehicle.state,
                                            vehicle.pincode,
                                        ]
                                            .filter(Boolean)
                                            .join(", ")
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#001f3f]/20 bg-[#e6f2ff] px-3.5 py-2 text-xs font-semibold text-[#001f3f] transition hover:-translate-y-0.5 hover:bg-[#d5eaff] cursor-pointer"
                                >
                                    <MapPin size={13} />
                                    Open Location in Maps
                                </a>
                            )}
                        </div>

                    </SectionCard>
                </div>

                {/* Right column */}
                <div className="space-y-5 sm:space-y-6 lg:col-span-1">
                    {/* Seller */}
                    <SectionCard icon={User} title="Seller Information">
                        <div className="space-y-3">
                            <InfoRow label="Full Name" value={inspection.seller?.fullName} />
                            <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                <Phone size={13} className="shrink-0 text-slate-400" /> {inspection.seller?.phone || '—'}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                <Mail size={13} className="shrink-0 text-slate-400" /> {inspection.seller?.email || '—'}
                            </div>
                            <InfoRow label="Seller ID" value={inspection.seller?.id} />
                        </div>
                    </SectionCard>

                    {/* Assignment */}
                    <SectionCard icon={UserCog} title="Assignment Details">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-[#001f3f]/20">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e6f2ff] text-[#001f3f]">
                                    <UserCheck size={14} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Assigned To</p>
                                    <p className="truncate text-sm font-semibold text-slate-800">{inspection.inspector?.fullName || 'You'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-[#001f3f]/20">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e6f2ff] text-[#001f3f]">
                                    <UserCog size={14} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Assigned By</p>
                                    <p className="truncate text-sm font-semibold text-slate-800">{inspection.assignedBy?.fullName || 'Admin'}</p>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Schedule */}
                    <SectionCard icon={Calendar} title="Schedule">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={14} className="shrink-0 text-slate-400" />
                                <div className="min-w-0">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Scheduled Date</p>
                                    <p className="truncate font-semibold text-slate-800">
                                        {inspection.scheduledDate ? new Date(inspection.scheduledDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not scheduled'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock size={14} className="shrink-0 text-slate-400" />
                                <div className="min-w-0">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Deadline</p>
                                    <p className="truncate font-semibold text-slate-800">
                                        {inspection.deadline ? new Date(inspection.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                    </p>
                                </div>
                            </div>
                            <InfoRow label="Assigned On" value={inspection.assignedAt ? new Date(inspection.assignedAt).toLocaleDateString('en-IN') : undefined} />
                            <InfoRow label="Accepted On" value={inspection.acceptedAt ? new Date(inspection.acceptedAt).toLocaleDateString('en-IN') : undefined} />
                        </div>
                    </SectionCard>
                </div>
            </div>

            {showGallery && <ImageGalleryModal images={images} onClose={() => setShowGallery(false)} />}
        </div >
    );
};