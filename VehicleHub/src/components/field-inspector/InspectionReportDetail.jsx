import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Loader2, CheckCircle2, XCircle, AlertTriangle, Star, User, FileText,
    Car, MapPin, Camera, Wrench, Gauge, Printer, Download, Phone, Mail,
} from 'lucide-react';
import { useGetInspectorReportByIdQuery } from '../../services/fieldInspectorApiSlice.js';

const resultMeta = {
    VERIFIED: { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Verified' },
    REJECTED: { icon: XCircle, color: 'bg-red-50 text-red-700 border-red-200', label: 'Rejected' },
    NEEDS_CORRECTION: { icon: AlertTriangle, color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Needs Correction' },
    PENDING: { icon: Gauge, color: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Pending' },
};

const docStatusColor = {
    VERIFIED: 'bg-emerald-50 text-emerald-700',
    REJECTED: 'bg-red-50 text-red-700',
    MISSING: 'bg-slate-100 text-slate-600',
    EXPIRED: 'bg-orange-50 text-orange-700',
    MISMATCH: 'bg-red-50 text-red-700',
    PENDING: 'bg-amber-50 text-amber-700',
};

const conditionColor = {
    EXCELLENT: 'bg-emerald-50 text-emerald-700',
    GOOD: 'bg-[#e6f2ff] text-[#001f3f]',
    FAIR: 'bg-amber-50 text-amber-700',
    POOR: 'bg-orange-50 text-orange-700',
    DAMAGED: 'bg-red-50 text-red-700',
};

const SectionCard = ({ icon: Icon, title, children }) => (
    <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]">
                <Icon size={15} />
            </span>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
        </div>
        {children}
    </div>
);

const InfoRow = ({ label, value }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{value}</p>
        </div>
    );
};

export const InspectionReportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetInspectorReportByIdQuery(id);
    const report = data?.data;

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" /></div>;
    }
    if (isError || !report) {
        return <div className="flex h-64 items-center justify-center text-sm text-red-500">Report not found or you don't have access.</div>;
    }

    const meta = resultMeta[report.result] || resultMeta.PENDING;
    const ResultIcon = meta.icon;

    // Group vehicle checks by category (Exterior, Interior, Mechanical, etc.)
    const checksByCategory = (report.vehicleChecks || []).reduce((acc, chk) => {
        acc[chk.category] = acc[chk.category] || [];
        acc[chk.category].push(chk);
        return acc;
    }, {});

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>Report {report.inspectionNo} | VehicleHub Inspector</title></Helmet>

            {/* Header */}
            <div className="animate-fadeInUp flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-3">
                    <button onClick={() => navigate('/field-inspector/reports')} className="mt-0.5 shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <p className="font-mono text-xs font-semibold text-[#001f3f]">{report.inspectionNo}</p>
                        <h1 className="mt-0.5 text-xl font-bold text-slate-900 sm:text-2xl">{report.vehicleListing?.title}</h1>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Completed on {report.completedAt ? new Date(report.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                        <Printer size={14} /> Print
                    </button>
                    <button className="flex items-center gap-1.5 rounded-xl bg-[#001f3f] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#002a55]">
                        <Download size={14} /> Download PDF
                    </button>
                </div>
            </div>

            {/* Final result banner */}
            <div className={`animate-fadeInUp flex flex-col gap-3 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 ${meta.color}`}>
                <div className="flex items-center gap-3">
                    <ResultIcon size={24} className="shrink-0" />
                    <div>
                        <p className="text-lg font-bold">Final Result: {meta.label}</p>
                        {report.result === 'REJECTED' && report.rejectionReason && (
                            <p className="mt-1 text-sm">Reason: {report.rejectionReason}</p>
                        )}
                        {report.result === 'NEEDS_CORRECTION' && report.correctionReason && (
                            <p className="mt-1 text-sm">Correction needed: {report.correctionReason}</p>
                        )}
                    </div>
                </div>
                {report.finalRating && (
                    <div className="flex shrink-0 items-center gap-1 rounded-xl border border-white/40 bg-white/50 px-3 py-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={16} className={i < report.finalRating ? 'fill-current' : 'opacity-30'} />
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left column — Vehicle + Seller + Inspector */}
                <div className="space-y-6 lg:col-span-1">
                    <SectionCard icon={Car} title="Vehicle Information">
                        {report.vehicleListing?.images?.[0] && (
                            <img src={report.vehicleListing.images[0]} alt="" className="mb-4 h-36 w-full rounded-xl border border-slate-200 object-cover" />
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <InfoRow label="Brand" value={report.vehicleListing?.brand} />
                            <InfoRow label="Model" value={report.vehicleListing?.model} />
                            <InfoRow label="Variant" value={report.vehicleListing?.variant} />
                            <InfoRow label="Year" value={report.vehicleListing?.manufacturingYear} />
                            <InfoRow label="Registration No." value={report.vehicleListing?.registrationNumber} />
                            <InfoRow label="VIN/Chassis" value={report.vehicleListing?.vin} />
                            <InfoRow label="Fuel" value={report.vehicleListing?.fuelType} />
                            <InfoRow label="Transmission" value={report.vehicleListing?.transmission} />
                            <InfoRow label="Color" value={report.vehicleListing?.color} />
                            <InfoRow label="Expected Price" value={report.vehicleListing?.price ? `₹${report.vehicleListing.price.toLocaleString('en-IN')}` : undefined} />
                        </div>
                    </SectionCard>

                    <SectionCard icon={User} title="Seller">
                        <div className="space-y-3">
                            <InfoRow label="Name" value={report.seller?.fullName} />
                            <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                <Phone size={13} className="text-slate-400" /> {report.seller?.phone || '—'}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                <Mail size={13} className="text-slate-400" /> {report.seller?.email || '—'}
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon={User} title="Inspector">
                        <InfoRow label="Name" value={report.inspector?.fullName} />
                        <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-700">
                            <Phone size={13} className="text-slate-400" /> {report.inspector?.phone || '—'}
                        </div>
                    </SectionCard>
                </div>

                {/* Right column — Checklist, Documents, Vehicle Checks, Location, Photos */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Checklist summary */}
                    {report.checklist && (
                        <SectionCard icon={CheckCircle2} title="Verification Checklist">
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                {[
                                    ['Seller Verified', report.checklist.sellerVerified],
                                    ['Documents Verified', report.checklist.documentsVerified],
                                    ['Vehicle Identity', report.checklist.vehicleIdentityVerified],
                                    ['Exterior', report.checklist.exteriorVerified],
                                    ['Interior', report.checklist.interiorVerified],
                                    ['Mechanical', report.checklist.mechanicalVerified],
                                    ['Test Drive', report.checklist.testDriveCompleted],
                                    ['Location', report.checklist.locationVerified],
                                    ['Photos', report.checklist.photosCompleted],
                                ].map(([label, done]) => (
                                    <div key={label} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                                        {done ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Documents */}
                    {report.documents?.length > 0 && (
                        <SectionCard icon={FileText} title="Document Verification">
                            <div className="space-y-2.5">
                                {report.documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-900">{doc.documentType}</p>
                                            {doc.documentNumber && <p className="text-xs text-slate-500">No: {doc.documentNumber}</p>}
                                            {doc.remarks && <p className="mt-0.5 text-xs text-slate-500">{doc.remarks}</p>}
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${docStatusColor[doc.status] || docStatusColor.PENDING}`}>
                                            {doc.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Vehicle checks by category */}
                    {Object.keys(checksByCategory).length > 0 && (
                        <SectionCard icon={Wrench} title="Vehicle Condition Checks">
                            <div className="space-y-5">
                                {Object.entries(checksByCategory).map(([category, checks]) => (
                                    <div key={category}>
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{category}</p>
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            {checks.map((chk) => (
                                                <div key={chk.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                                    <span className="truncate text-xs font-medium text-slate-700">{chk.item}</span>
                                                    {chk.condition && (
                                                        <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${conditionColor[chk.condition] || 'bg-slate-100 text-slate-500'}`}>
                                                            {chk.condition}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Location */}
                    {report.location && (
                        <SectionCard icon={MapPin} title="Location Verification">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <InfoRow label="Expected Address" value={report.location.expectedAddress} />
                                <InfoRow label="Actual Address" value={report.location.actualAddress} />
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${report.location.locationMatched ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                    {report.location.locationMatched ? 'Location Matched' : 'Location Mismatch'}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${report.location.vehiclePresent ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                    {report.location.vehiclePresent ? 'Vehicle Present' : 'Vehicle Not Present'}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${report.location.sellerPresent ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                    {report.location.sellerPresent ? 'Seller Present' : 'Seller Not Present'}
                                </span>
                            </div>
                            {report.location.remarks && <p className="mt-3 text-sm text-slate-600">{report.location.remarks}</p>}
                        </SectionCard>
                    )}

                    {/* Photos */}
                    {report.photos?.length > 0 && (
                        <SectionCard icon={Camera} title={`Evidence Photos (${report.photos.length})`}>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                                {report.photos.map((photo) => (
                                    <a key={photo.id} href={photo.imageUrl} target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                                        <img src={photo.imageUrl} alt={photo.category} className="h-full w-full object-cover transition group-hover:scale-105" />
                                        <span className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
                                            {photo.category}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Final notes */}
                    {report.finalNotes && (
                        <SectionCard icon={FileText} title="Inspector's Final Notes">
                            <p className="text-sm leading-relaxed text-slate-600">{report.finalNotes}</p>
                        </SectionCard>
                    )}
                </div>
            </div>
        </div>
    );
};