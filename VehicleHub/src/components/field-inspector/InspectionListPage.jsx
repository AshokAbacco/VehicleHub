import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, MapPin, Phone, Inbox, Flame, ArrowUp, Minus, ArrowDown } from 'lucide-react';

const statusConfig = {
    ASSIGNED: { badge: 'bg-[#e6f2ff] text-[#001f3f] border border-[#001f3f]/15', dot: 'bg-[#001f3f]' },
    ACCEPTED: { badge: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' },
    IN_PROGRESS: { badge: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
    RE_VERIFICATION: { badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200', dot: 'bg-indigo-500' },
    COMPLETED: { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
    REJECTED: { badge: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' },
    CANCELLED: { badge: 'bg-slate-100 text-slate-500 border border-slate-200', dot: 'bg-slate-400' },
};

const resultConfig = {
    VERIFIED: { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
    REJECTED: { badge: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' },
    NEEDS_CORRECTION: { badge: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
    PENDING: { badge: 'bg-slate-100 text-slate-500 border border-slate-200', dot: 'bg-slate-400' },
};

const priorityConfig = {
    LOW: { color: 'text-slate-500', icon: ArrowDown },
    MEDIUM: { color: 'text-blue-600', icon: Minus },
    HIGH: { color: 'text-orange-600', icon: ArrowUp },
    URGENT: { color: 'text-red-600', icon: Flame },
};

const StatusBadge = ({ value, config }) => {
    const meta = config[value] || { badge: 'bg-slate-100 text-slate-500 border border-slate-200', dot: 'bg-slate-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {value.replace('_', ' ')}
        </span>
    );
};

const PriorityBadge = ({ value }) => {
    const meta = priorityConfig[value] || priorityConfig.MEDIUM;
    const Icon = meta.icon;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${meta.color}`}>
            <Icon size={12} /> {value}
        </span>
    );
};

export const InspectionListPage = ({ title, subtitle, inspections = [], isLoading, isError, emptyText, showResult = false }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 text-slate-900">
            <div className="animate-fadeInUp">
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>

            <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
                {isLoading ? (
                    <div className="flex h-56 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" />
                    </div>
                ) : isError ? (
                    <div className="flex h-56 flex-col items-center justify-center gap-2 text-red-500">
                        <Inbox size={22} />
                        <p className="text-sm font-medium">Failed to load inspections.</p>
                    </div>
                ) : inspections.length === 0 ? (
                    <div className="flex h-56 flex-col items-center justify-center gap-2 text-slate-400">
                        <Inbox size={26} />
                        <p className="text-sm font-medium">{emptyText}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full min-w-[820px] text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3.5">Inspection ID</th>
                                        <th className="px-5 py-3.5">Vehicle</th>
                                        <th className="px-5 py-3.5">Seller</th>
                                        <th className="px-5 py-3.5">Location</th>
                                        <th className="px-5 py-3.5">Priority</th>
                                        <th className="px-5 py-3.5">{showResult ? 'Result' : 'Status'}</th>
                                        <th className="px-5 py-3.5">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {inspections.map((insp, idx) => (
                                        <tr
                                            key={insp.id}
                                            style={{ animationDelay: `${Math.min(idx, 10) * 40}ms` }}
                                            className="animate-fadeInUp opacity-0 transition-colors duration-150 hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 font-mono text-xs font-semibold text-[#001f3f]">{insp.inspectionNo}</td>
                                            <td className="px-5 py-4 max-w-[220px] truncate font-semibold text-slate-900">{insp.vehicleListing?.title}</td>
                                            <td className="px-5 py-4 text-slate-500">{insp.seller?.fullName}</td>
                                            <td className="px-5 py-4 text-slate-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin size={12} className="shrink-0 text-slate-400" />
                                                    {[insp.vehicleListing?.city, insp.vehicleListing?.state].filter(Boolean).join(', ') || '—'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4"><PriorityBadge value={insp.priority} /></td>
                                            <td className="px-5 py-4">
                                                <StatusBadge value={showResult ? insp.result : insp.status} config={showResult ? resultConfig : statusConfig} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => navigate(`/field-inspector/inspections/${insp.id}`)}
                                                    className="group flex items-center gap-1.5 rounded-full border border-[#001f3f]/15 bg-[#e6f2ff] px-3 py-1.5 text-xs font-semibold text-[#001f3f] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#001f3f] hover:text-white hover:shadow-md"
                                                >
                                                    <Eye size={13} className="transition-transform duration-200 group-hover:scale-110" /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="space-y-2.5 p-4 sm:hidden">
                            {inspections.map((insp, idx) => (
                                <div
                                    key={insp.id}
                                    style={{ animationDelay: `${Math.min(idx, 10) * 50}ms` }}
                                    className="animate-fadeInUp opacity-0 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#001f3f]/20 hover:bg-white hover:shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono text-xs font-semibold text-[#001f3f]">{insp.inspectionNo}</span>
                                        <StatusBadge value={showResult ? insp.result : insp.status} config={showResult ? resultConfig : statusConfig} />
                                    </div>
                                    <p className="mt-2 truncate text-sm font-semibold text-slate-900">{insp.vehicleListing?.title}</p>
                                    <div className="mt-1.5 flex items-center justify-between">
                                        <p className="flex items-center gap-1 text-xs text-slate-500"><Phone size={11} /> {insp.seller?.fullName}</p>
                                        <PriorityBadge value={insp.priority} />
                                    </div>
                                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                        <MapPin size={11} /> {[insp.vehicleListing?.city, insp.vehicleListing?.state].filter(Boolean).join(', ') || '—'}
                                    </p>
                                    <button
                                        onClick={() => navigate(`/field-inspector/inspections/${insp.id}`)}
                                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#001f3f] py-2.5 text-xs font-bold text-white shadow-sm shadow-[#001f3f]/20 transition hover:-translate-y-0.5 hover:bg-[#002a55]"
                                    >
                                        <Eye size={13} /> View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};