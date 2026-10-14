// VehicleHub/VehicleHub/src/components/seller/InspectionRequestsPage.jsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import {
    AlertCircle, CalendarCheck, CheckCircle2, FileText, Image as ImageIcon,
    Loader2, MapPin, Phone, User, X, XCircle,
} from 'lucide-react';
import {
    useGetSellerInspectionByIdQuery,
    useGetSellerInspectionsQuery,
} from '../../services/sellerApiSlice.js';

const statusStyles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200',
    ACCEPTED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
};

const formatDate = (value) => value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
const formatTime = (value) => value
    ? new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
    : '—';
const readable = (value) => String(value || '—').replaceAll('_', ' ');
// Friendlier labels for the Inspection.status values stored in the database
const statusLabel = (status) => ({ PENDING: 'Awaiting inspector', ASSIGNED: 'Inspector assigned', COMPLETED: 'Completed', REJECTED: 'Rejected' })[status] || readable(status);

const Info = ({ title, value }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{title}</p>
            <p className="mt-0.5 wrap-break-word text-sm font-semibold text-slate-800">{String(value)}</p>
        </div>
    );
};

const Section = ({ icon: Icon, title, children }) => (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]"><Icon size={15} /></span>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        </div>
        {children}
    </section>
);

const InspectionDetailsModal = ({ id, onClose }) => {
    const { data, isLoading, isError } = useGetSellerInspectionByIdQuery(id);
    const inspection = data?.data;
    const vehicle = inspection?.vehicleListing;
    const checklist = inspection?.checklist;
    const checks = inspection?.vehicleChecks || [];
    const checklistItems = checklist ? [
        ['Seller', checklist.sellerVerified, checklist.sellerNotes],
        ['Documents', checklist.documentsVerified, checklist.documentNotes],
        ['Vehicle identity', checklist.vehicleIdentityVerified, checklist.identityNotes],
        ['Exterior', checklist.exteriorVerified, checklist.exteriorNotes],
        ['Interior', checklist.interiorVerified, checklist.interiorNotes],
        ['Mechanical', checklist.mechanicalVerified, checklist.mechanicalNotes],
        ['Test drive', checklist.testDriveCompleted, checklist.testDriveNotes],
        ['Location', checklist.locationVerified, checklist.locationNotes],
        ['Photos', checklist.photosCompleted, null],
    ] : [];

    return createPortal(
        /* Portaled to document.body so "fixed" is relative to the real viewport, not a transformed ancestor */
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4">
            {/* Backdrop click listener */}
            <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

            {/* Modal Box Container */}
            <div className="relative z-10 flex h-[96vh] max-h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl sm:rounded-3xl xl:max-w-7xl">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#001f3f]">Inspection report</p>
                        <h2 className="truncate text-lg font-bold text-slate-900">{vehicle?.title || 'Inspection details'}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content Area with Inner Scroll */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {isLoading && (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" />
                        </div>
                    )}
                    {isError && (
                        <div className="flex h-48 items-center justify-center gap-2 text-sm text-red-500">
                            <AlertCircle size={20} /> Failed to load inspection details.
                        </div>
                    )}
                    {inspection && (
                        <div className="space-y-5">
                            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                                <div>
                                    <p className="font-mono text-xs text-slate-500">{inspection.inspectionNo}</p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Scheduled {formatDate(inspection.scheduledDate)} at {formatTime(inspection.scheduledDate)}
                                    </p>
                                </div>
                                <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyles[inspection.status] || statusStyles.ASSIGNED}`}>
                                    {statusLabel(inspection.status)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                                <div className="space-y-5 lg:col-span-1">
                                    <Section icon={CalendarCheck} title="Vehicle details">
                                        {vehicle?.images?.[0] && (
                                            <img src={vehicle.images[0]} alt={vehicle.title} className="mb-4 h-40 w-full rounded-xl object-cover" />
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            <Info title="Name" value={vehicle?.title} />
                                            <Info title="Category" value={vehicle?.category} />
                                            <Info title="Brand" value={vehicle?.brand} />
                                            <Info title="Model" value={vehicle?.model} />
                                            <Info title="Variant" value={vehicle?.variant} />
                                            <Info title="Year" value={vehicle?.manufacturingYear} />
                                            <Info title="Registration" value={vehicle?.registrationNumber} />
                                            <Info title="Fuel" value={vehicle?.fuelType} />
                                            <Info title="KM driven" value={vehicle?.kmDriven} />
                                            <Info title="Price" value={vehicle?.price ? `₹${vehicle.price.toLocaleString('en-IN')}` : null} />
                                        </div>
                                    </Section>
                                    <Section icon={User} title="Field inspector">
                                        <div className="space-y-3">
                                            <Info title="Name" value={inspection.inspector?.fullName} />
                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <Phone size={14} className="text-slate-400" />
                                                {inspection.inspector?.phone || '—'}
                                            </div>
                                            <p className="break-all text-sm text-slate-700">{inspection.inspector?.email || '—'}</p>
                                        </div>
                                    </Section>
                                </div>

                                <div className="space-y-5 lg:col-span-2">
                                    <Section icon={CheckCircle2} title="Inspector verification checklist">
                                        {checklistItems.length ? (
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                {checklistItems.map(([name, done, notes]) => (
                                                    <div key={name} className={`rounded-xl border p-3 ${done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                                                        <p className={`flex items-center gap-2 text-xs font-bold ${done ? 'text-emerald-700' : 'text-slate-500'}`}>
                                                            {done ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                            {name}
                                                        </p>
                                                        {notes && <p className="mt-1 text-xs text-slate-600">{notes}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400">Checklist not submitted yet.</p>
                                        )}
                                    </Section>

                                    <Section icon={FileText} title="Document verification">
                                        {inspection.documents?.length ? (
                                            <div className="space-y-2">
                                                {inspection.documents.map((doc) => (
                                                    <div key={doc.id} className="flex flex-col gap-1 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">{readable(doc.documentType)}</p>
                                                            <p className="text-xs text-slate-500">{doc.remarks || doc.rejectionReason || 'No remarks'}</p>
                                                        </div>
                                                        <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                                            {readable(doc.status)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400">No document checks recorded.</p>
                                        )}
                                    </Section>

                                    <Section icon={CheckCircle2} title="Vehicle inspection checks">
                                        {checks.length ? (
                                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                {checks.map((check) => (
                                                    <div key={check.id} className="rounded-xl border border-slate-200 p-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="text-sm font-semibold text-slate-800">{check.item}</p>
                                                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                                                {readable(check.condition || check.status)}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-xs text-slate-400">{check.category}</p>
                                                        {check.remarks && <p className="mt-2 text-xs text-slate-600">{check.remarks}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400">No vehicle checks recorded.</p>
                                        )}
                                    </Section>

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <Section icon={MapPin} title="Location verification">
                                            <div className="grid grid-cols-2 gap-3">
                                                <Info title="Expected address" value={inspection.location?.expectedAddress} />
                                                <Info title="Actual address" value={inspection.location?.actualAddress} />
                                                <Info title="Vehicle present" value={inspection.location?.vehiclePresent == null ? null : (inspection.location.vehiclePresent ? 'Yes' : 'No')} />
                                                <Info title="Seller present" value={inspection.location?.sellerPresent == null ? null : (inspection.location.sellerPresent ? 'Yes' : 'No')} />
                                                <Info title="Location matched" value={inspection.location?.locationMatched == null ? null : (inspection.location.locationMatched ? 'Yes' : 'No')} />
                                            </div>
                                            {inspection.location?.remarks && <p className="mt-3 text-xs text-slate-600">{inspection.location.remarks}</p>}
                                        </Section>

                                        <Section icon={ImageIcon} title="Inspection evidence">
                                            <div className="grid grid-cols-3 gap-2">
                                                {(inspection.photos || []).map((photo) => (
                                                    <img key={photo.id} src={photo.imageUrl} alt={photo.category} className="aspect-square w-full rounded-lg object-cover" />
                                                ))}
                                            </div>
                                            {!inspection.photos?.length && <p className="text-sm text-slate-400">No inspection photos uploaded.</p>}
                                        </Section>
                                    </div>

                                    <Section icon={FileText} title="Final report">
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            <Info title="Result" value={readable(inspection.result)} />
                                            <Info title="Rating" value={inspection.finalRating ? `${inspection.finalRating}/5` : null} />
                                            <Info title="Completed" value={formatDate(inspection.completedAt)} />
                                            <Info title="Notes" value={inspection.finalNotes || inspection.rejectionReason || inspection.correctionReason} />
                                        </div>
                                    </Section>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
export const InspectionRequestsPage = () => {
    const { data, isLoading, isError } = useGetSellerInspectionsQuery(undefined, { pollingInterval: 15000 });
    const [selectedId, setSelectedId] = useState(null);
    const inspections = data?.data || [];

    return (
        <div className="space-y-6">
            <Helmet><title>Inspection Requests | VehicleHub Seller</title></Helmet>
            <div className="rounded-2xl bg-linear-to-br from-[#001f3f] via-[#002a55] to-[#003d7a] p-5 shadow-lg sm:p-7"><p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200"><CalendarCheck size={13} /> Vehicle Inspections</p><h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Inspection Requests</h1><p className="mt-1 text-sm text-white/70">Field inspections of your vehicles by our verified inspectors.</p></div>
            {isLoading && <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white"><Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" /></div>}
            {isError && <div className="flex h-48 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 text-sm text-red-600"><AlertCircle size={20} /> Failed to load inspection requests.</div>}
            {!isLoading && !isError && <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Vehicle</th><th className="px-5 py-4">Field Inspector</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Time</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">View</th></tr></thead><tbody className="divide-y divide-slate-100">{inspections.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-semibold text-slate-900">{item.vehicleListing?.title || 'Vehicle'}</td><td className="px-5 py-4 text-slate-700">{item.inspector?.fullName || 'Not assigned'}</td><td className="px-5 py-4 text-slate-600">{formatDate(item.scheduledDate || item.assignedAt)}</td><td className="px-5 py-4 text-slate-600">{formatTime(item.scheduledDate || item.assignedAt)}</td><td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status] || statusStyles.ASSIGNED}`}>{statusLabel(item.status)}</span></td><td className="px-5 py-4 text-right"><button onClick={() => setSelectedId(item.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#001f3f] hover:bg-[#e6f2ff]">View</button></td></tr>)}</tbody></table></div><div className="divide-y divide-slate-100 md:hidden">{inspections.map((item) => <article key={item.id} className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{item.vehicleListing?.title || 'Vehicle'}</p><p className="mt-1 text-xs text-slate-500">Inspector: {item.inspector?.fullName || 'Not assigned'}</p></div><span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${statusStyles[item.status] || statusStyles.ASSIGNED}`}>{statusLabel(item.status)}</span></div><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><Info title="Date" value={formatDate(item.scheduledDate || item.assignedAt)} /><Info title="Time" value={formatTime(item.scheduledDate || item.assignedAt)} /></div><button onClick={() => setSelectedId(item.id)} className="mt-4 w-full rounded-lg bg-[#001f3f] py-2.5 text-xs font-bold text-white">View full inspection</button></article>)}</div>{!inspections.length && <p className="p-12 text-center text-sm text-slate-400">No inspection requests found.</p>}</div>}
            {selectedId && <InspectionDetailsModal id={selectedId} onClose={() => setSelectedId(null)} />}
        </div>
    );
};