import { Helmet } from 'react-helmet-async';
import {
    ClipboardList, Clock, CalendarCheck, CheckCircle2, ShieldCheck,
    XCircle, AlertTriangle, TimerOff, MapPin, Phone, Loader2, Eye, ArrowRight,
    LayoutDashboard, TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    useGetInspectorDashboardQuery,
    useGetTodayScheduleQuery,
    useGetPendingInspectionsQuery,
    useGetUpcomingInspectionsQuery,
    useGetRecentCompletedQuery,
} from '../../services/fieldInspectorApiSlice.js';

const statCardConfig = [
    { key: 'total', label: 'Total Assigned', desc: 'All inspections assigned to you', icon: ClipboardList, bg: 'bg-[#e6f2ff]', color: 'text-[#001f3f]' },
    { key: 'pending', label: 'Pending Inspections', desc: 'Waiting for physical verification', icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
    { key: 'today', label: "Today's Inspections", desc: 'Scheduled for today', icon: CalendarCheck, bg: 'bg-[#e6f2ff]', color: 'text-[#001f3f]' },
    { key: 'completed', label: 'Completed Inspections', desc: 'Successfully submitted', icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { key: 'verified', label: 'Verified Vehicles', desc: 'Passed field verification', icon: ShieldCheck, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { key: 'rejected', label: 'Rejected Vehicles', desc: 'Failed verification', icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' },
    { key: 'needsCorrection', label: 'Need Correction', desc: 'Awaiting seller correction', icon: AlertTriangle, bg: 'bg-orange-50', color: 'text-orange-600' },
    { key: 'overdue', label: 'Overdue Inspections', desc: 'Past their deadline', icon: TimerOff, bg: 'bg-red-50', color: 'text-red-600' },
];

const statusBadge = {
    ASSIGNED: 'bg-[#e6f2ff] text-[#001f3f]',
    ACCEPTED: 'bg-blue-50 text-blue-700',
    IN_PROGRESS: 'bg-amber-50 text-amber-700',
    COMPLETED: 'bg-emerald-50 text-emerald-700',
    CANCELLED: 'bg-slate-100 text-slate-600',
};

const statusDot = {
    ASSIGNED: 'bg-[#001f3f]',
    ACCEPTED: 'bg-blue-500',
    IN_PROGRESS: 'bg-amber-500',
    COMPLETED: 'bg-emerald-500',
    CANCELLED: 'bg-slate-400',
};

const resultBadge = {
    VERIFIED: 'bg-emerald-50 text-emerald-700',
    REJECTED: 'bg-red-50 text-red-700',
    NEEDS_CORRECTION: 'bg-amber-50 text-amber-700',
    PENDING: 'bg-slate-100 text-slate-600',
};

export const FieldInspectorDashboard = () => {
    const navigate = useNavigate();
    const { data: statsData, isLoading: statsLoading } = useGetInspectorDashboardQuery();
    const { data: todayData, isLoading: todayLoading } = useGetTodayScheduleQuery();
    const { data: pendingData, isLoading: pendingLoading } = useGetPendingInspectionsQuery();
    const { data: upcomingData, isLoading: upcomingLoading } = useGetUpcomingInspectionsQuery();
    const { data: recentData, isLoading: recentLoading } = useGetRecentCompletedQuery();

    const stats = statsData?.data || {};
    const todaySchedule = todayData?.data || [];
    const pending = pendingData?.data || [];
    const upcoming = upcomingData?.data || [];
    const recentCompleted = recentData?.data || [];

    const goToInspection = (id) => navigate(`/field-inspector/inspections/${id}`);

    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>Inspector Dashboard | VehicleHub</title></Helmet>

            {/* Gradient hero header */}
            <div className="animate-fadeInUp relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001f3f] via-[#002a55] to-[#003d7a] p-6 shadow-lg shadow-[#001f3f]/20 sm:p-7">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-white/5" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                            <LayoutDashboard size={13} /> {greeting}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Inspection Dashboard</h1>
                        <p className="mt-1 text-sm text-white/70">Manage your assigned vehicle verifications.</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-white backdrop-blur-sm">
                        <TrendingUp size={16} className="text-emerald-300" />
                        <span className="text-sm font-semibold">{stats.completed ?? 0} completed this cycle</span>
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            {statsLoading ? (
                <div className="flex h-24 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                    {statCardConfig.map((cfg, idx) => {
                        const Icon = cfg.icon;
                        return (
                            <button
                                key={cfg.key}
                                onClick={() => navigate(`/field-inspector/inspections?status=${cfg.key}`)}
                                style={{ animationDelay: `${idx * 60}ms` }}
                                className="group relative min-w-0 animate-fadeInUp opacity-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#001f3f]/30 hover:shadow-lg sm:p-5"
                            >
                                <span className="absolute inset-x-0 top-0 h-[3px] w-full overflow-hidden">
                                    <span className="block h-full w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-[#001f3f] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
                                </span>
                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg} ${cfg.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                    <Icon size={18} />
                                </span>
                                <p className="mt-3 text-2xl font-extrabold text-slate-900 transition-transform duration-300 group-hover:translate-x-0.5 sm:mt-4">{stats[cfg.key] ?? 0}</p>
                                <p className="mt-0.5 text-xs font-semibold text-slate-700 sm:text-sm">{cfg.label}</p>
                                <p className="mt-0.5 truncate text-[11px] text-slate-400">{cfg.desc}</p>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Today's Inspection Schedule */}
            <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
                <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Today's Inspection Schedule</h2>
                        <p className="text-sm text-slate-500">Inspections scheduled for today.</p>
                    </div>
                    {todaySchedule.length > 0 && (
                        <span className="w-fit rounded-full bg-[#e6f2ff] px-3 py-1 text-xs font-bold text-[#001f3f]">
                            {todaySchedule.length} today
                        </span>
                    )}
                </div>

                <div className="p-5 sm:p-6">
                    {todayLoading ? (
                        <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                    ) : todaySchedule.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
                            <CalendarCheck size={22} />
                            <p className="text-sm font-medium">No inspections scheduled for today.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full min-w-[700px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Inspection ID</th>
                                        <th className="px-4 py-3">Vehicle</th>
                                        <th className="px-4 py-3">Seller</th>
                                        <th className="px-4 py-3">Location</th>
                                        <th className="px-4 py-3">Time</th>
                                        <th className="px-4 py-3">Priority</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {todaySchedule.map((insp, idx) => (
                                        <tr
                                            key={insp.id}
                                            style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}
                                            className="animate-fadeInUp opacity-0 transition-colors duration-150 hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-3 font-mono text-xs font-medium text-[#001f3f]">{insp.inspectionNo}</td>
                                            <td className="px-4 py-3 max-w-[200px] truncate font-semibold text-slate-900">{insp.vehicleListing?.title}</td>
                                            <td className="px-4 py-3 text-slate-500">{insp.seller?.fullName}</td>
                                            <td className="px-4 py-3 text-slate-500">{[insp.vehicleListing?.city, insp.vehicleListing?.state].filter(Boolean).join(', ') || '—'}</td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {insp.scheduledDate ? new Date(insp.scheduledDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{insp.priority}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge[insp.status] || 'bg-slate-100 text-slate-600'}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot[insp.status] || 'bg-slate-400'}`} />
                                                    {insp.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => goToInspection(insp.id)}
                                                    className="group/btn flex items-center gap-1.5 rounded-full border border-[#001f3f]/20 bg-[#e6f2ff] px-3 py-1.5 text-xs font-semibold text-[#001f3f] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#001f3f] hover:text-white hover:shadow-md"
                                                >
                                                    <Eye size={13} className="transition-transform duration-200 group-hover/btn:scale-110" /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Pending Inspections */}
                <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
                    <div className="border-b border-slate-100 bg-slate-50 p-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">Pending Inspections</h2>
                            {pending.length > 0 && (
                                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">{pending.length}</span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">Latest assignments waiting for action.</p>
                    </div>

                    <div className="p-5 sm:p-6">
                        {pendingLoading ? (
                            <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                        ) : pending.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
                                <Clock size={22} />
                                <p className="text-sm font-medium">No pending inspections.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pending.map((insp, idx) => (
                                    <div
                                        key={insp.id}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                        className="animate-fadeInUp opacity-0 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#001f3f]/20 hover:bg-white hover:shadow-sm"
                                    >
                                        <div className="flex items-start gap-3">
                                            {insp.vehicleListing?.images?.[0] ? (
                                                <img src={insp.vehicleListing.images[0]} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover" />
                                            ) : (
                                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ff] text-lg">🚘</span>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-slate-900">{insp.vehicleListing?.title}</p>
                                                <p className="truncate text-xs text-slate-500">{insp.vehicleListing?.registrationNumber}</p>
                                                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                    <Phone size={11} /> {insp.seller?.fullName} · {insp.seller?.phone}
                                                </div>
                                                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                    <MapPin size={11} /> {[insp.vehicleListing?.city, insp.vehicleListing?.state].filter(Boolean).join(', ') || 'Location not set'}
                                                </div>
                                            </div>
                                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge[insp.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {insp.status}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => goToInspection(insp.id)}
                                            className="mt-3 w-full rounded-lg bg-[#001f3f] py-2 text-xs font-bold text-white shadow-sm shadow-[#001f3f]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#002a55] hover:shadow-md"
                                        >
                                            {insp.status === 'ASSIGNED' ? 'View & Accept' : 'Start Inspection'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Inspections */}
                <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
                    <div className="border-b border-slate-100 bg-slate-50 p-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">Upcoming Inspections</h2>
                            {upcoming.length > 0 && (
                                <span className="rounded-full bg-[#e6f2ff] px-2.5 py-1 text-xs font-bold text-[#001f3f]">{upcoming.length}</span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">Scheduled ahead.</p>
                    </div>

                    <div className="p-5 sm:p-6">
                        {upcomingLoading ? (
                            <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                        ) : upcoming.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
                                <CalendarCheck size={22} />
                                <p className="text-sm font-medium">No upcoming inspections.</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {upcoming.map((insp, idx) => (
                                    <button
                                        key={insp.id}
                                        onClick={() => goToInspection(insp.id)}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                        className="group animate-fadeInUp opacity-0 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#001f3f]/30 hover:bg-white hover:shadow-sm"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-900">{insp.vehicleListing?.title}</p>
                                            <p className="truncate text-xs text-slate-500">{insp.seller?.fullName}</p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <p className="text-xs font-semibold text-[#001f3f]">
                                                {insp.scheduledDate ? new Date(insp.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                                            </p>
                                            <ArrowRight size={13} className="text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#001f3f]" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Completed Inspections */}
            <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
                <div className="border-b border-slate-100 bg-slate-50 p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-slate-900">Recent Completed Inspections</h2>
                    <p className="text-sm text-slate-500">Your most recently submitted reports.</p>
                </div>

                <div className="p-5 sm:p-6">
                    {recentLoading ? (
                        <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                    ) : recentCompleted.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
                            <CheckCircle2 size={22} />
                            <p className="text-sm font-medium">No completed inspections yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {recentCompleted.map((insp, idx) => (
                                <div
                                    key={insp.id}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                    className="animate-fadeInUp opacity-0 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#001f3f]/20 hover:bg-white hover:shadow-sm"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-900">{insp.vehicleListing?.title}</p>
                                        <p className="truncate text-xs text-slate-500">{insp.seller?.fullName} · {insp.completedAt ? new Date(insp.completedAt).toLocaleDateString('en-IN') : '—'}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${resultBadge[insp.result] || 'bg-slate-100 text-slate-600'}`}>
                                            {insp.result.replace('_', ' ')}
                                        </span>
                                        <button
                                            onClick={() => navigate(`/field-inspector/reports/${insp.id}`)}
                                            className="rounded-full border border-[#001f3f]/20 bg-[#e6f2ff] px-3 py-1.5 text-xs font-semibold text-[#001f3f] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#001f3f] hover:text-white hover:shadow-sm"
                                        >
                                            View Report
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};