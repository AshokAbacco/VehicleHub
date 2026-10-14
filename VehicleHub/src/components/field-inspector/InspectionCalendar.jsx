import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, ChevronRight, Calendar as CalIcon, Loader2, X, Eye,
    Phone, MapPin, Flame, ArrowUp, Minus, ArrowDown, CalendarClock, CalendarDays,
} from 'lucide-react';
import { useGetCalendarInspectionsQuery } from '../../services/fieldInspectorApiSlice.js';

const statusChip = {
    ASSIGNED: 'bg-[#001f3f] text-white',
    ACCEPTED: 'bg-blue-500 text-white',
    IN_PROGRESS: 'bg-amber-500 text-white',
    COMPLETED: 'bg-emerald-500 text-white',
    CANCELLED: 'bg-slate-400 text-white',
};

const statusDot = {
    ASSIGNED: 'bg-[#001f3f]',
    ACCEPTED: 'bg-blue-500',
    IN_PROGRESS: 'bg-amber-500',
    COMPLETED: 'bg-emerald-500',
    CANCELLED: 'bg-slate-400',
};

const statusBadge = {
    ASSIGNED: 'bg-[#e6f2ff] text-[#001f3f] border border-[#001f3f]/15',
    ACCEPTED: 'bg-blue-50 text-blue-700 border border-blue-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border border-amber-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    CANCELLED: 'bg-slate-100 text-slate-500 border border-slate-200',
};

const priorityMeta = {
    LOW: { color: 'text-slate-500', icon: ArrowDown },
    MEDIUM: { color: 'text-blue-600', icon: Minus },
    HIGH: { color: 'text-orange-600', icon: ArrowUp },
    URGENT: { color: 'text-red-600', icon: Flame },
};

const statusFilterOptions = [
    { value: '', label: 'All statuses' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const priorityFilterOptions = [
    { value: '', label: 'All priorities' },
    { value: 'URGENT', label: 'Urgent' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const InspectionCalendar = () => {
    const navigate = useNavigate();
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [selectedDay, setSelectedDay] = useState(today);

    const month = viewDate.getMonth() + 1;
    const year = viewDate.getFullYear();

    const { data, isLoading, isError } = useGetCalendarInspectionsQuery({
        month, year,
        status: status || undefined,
        priority: priority || undefined,
    });
    const inspections = data?.data || [];

    const eventsByDay = useMemo(() => {
        const map = {};
        inspections.forEach((insp) => {
            if (!insp.scheduledDate) return;
            const key = dateKey(new Date(insp.scheduledDate));
            if (!map[key]) map[key] = [];
            map[key].push(insp);
        });
        return map;
    }, [inspections]);

    const monthEventCount = inspections.length;

    const gridDays = useMemo(() => {
        const firstOfMonth = new Date(year, month - 1, 1);
        const startOffset = firstOfMonth.getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        const cells = [];

        for (let i = 0; i < startOffset; i++) {
            const d = new Date(year, month - 1, 1 - (startOffset - i));
            cells.push({ date: d, inCurrentMonth: false });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({ date: new Date(year, month - 1, d), inCurrentMonth: true });
        }
        while (cells.length % 7 !== 0 || cells.length < 42) {
            const last = cells[cells.length - 1].date;
            const next = new Date(last);
            next.setDate(next.getDate() + 1);
            cells.push({ date: next, inCurrentMonth: false });
        }
        return cells;
    }, [month, year]);

    const goPrevMonth = () => setViewDate(new Date(year, month - 2, 1));
    const goNextMonth = () => setViewDate(new Date(year, month, 1));
    const goToday = () => {
        setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setSelectedDay(today);
    };

    const todayKey = dateKey(today);
    const selectedEvents = selectedDay ? eventsByDay[dateKey(selectedDay)] || [] : [];

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>Inspection Calendar | VehicleHub Inspector</title></Helmet>

            {/* Gradient header */}
            <div className="animate-fadeInUp relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001f3f] via-[#002a55] to-[#003d7a] p-6 shadow-lg shadow-[#001f3f]/20 sm:p-7">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-white/5" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                            <CalendarDays size={13} /> Field Inspector
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Inspection Calendar</h1>
                        <p className="mt-1 text-sm text-white/70">
                            {monthEventCount} inspection{monthEventCount !== 1 ? 's' : ''} in {MONTH_NAMES[month - 1]} {year}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={goPrevMonth} className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/20">
                            <ChevronLeft size={17} />
                        </button>
                        <span className="min-w-[130px] rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-center text-sm font-bold text-white backdrop-blur-sm">
                            {MONTH_NAMES[month - 1]} {year}
                        </span>
                        <button onClick={goNextMonth} className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/20">
                            <ChevronRight size={17} />
                        </button>
                        <button onClick={goToday} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#001f3f] shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
                            Today
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters + legend */}
            <div className="animate-fadeInUp flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition focus:border-[#001f3f]/30 focus:bg-white focus:outline-none">
                        {statusFilterOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition focus:border-[#001f3f]/30 focus:bg-white focus:outline-none">
                        {priorityFilterOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
                    {Object.entries(statusDot).map(([key, color]) => (
                        <span key={key} className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <span className={`h-2 w-2 rounded-full ${color}`} /> {key.replace('_', ' ')}
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                {/* Calendar grid */}
                <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {isLoading ? (
                        <div className="flex h-[520px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                    ) : isError ? (
                        <div className="flex h-[520px] items-center justify-center text-sm text-red-500">Failed to load calendar.</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                                {WEEKDAYS.map((d) => (
                                    <div key={d} className="py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7">
                                {gridDays.map(({ date, inCurrentMonth }, idx) => {
                                    const key = dateKey(date);
                                    const events = eventsByDay[key] || [];
                                    const isToday = key === todayKey;
                                    const isSelected = selectedDay && dateKey(selectedDay) === key;
                                    const isWeekendCol = idx % 7 === 0 || idx % 7 === 6;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedDay(date)}
                                            className={`group relative flex min-h-[92px] flex-col gap-1.5 border-b border-r border-slate-100 p-2 text-left transition-all duration-150 last:border-r-0 sm:min-h-[112px] sm:p-2.5 ${!inCurrentMonth ? 'bg-slate-50/60' : isWeekendCol ? 'bg-slate-50/30' : 'bg-white'
                                                } ${isSelected ? '!bg-[#e6f2ff] ring-1 ring-inset ring-[#001f3f]/20' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${isToday
                                                        ? 'bg-[#001f3f] text-white shadow-sm shadow-[#001f3f]/30'
                                                        : !inCurrentMonth
                                                            ? 'text-slate-300'
                                                            : 'text-slate-700 group-hover:bg-white group-hover:shadow-sm'
                                                        }`}
                                                >
                                                    {date.getDate()}
                                                </span>
                                                {events.length > 0 && (
                                                    <span className="hidden rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 sm:block">
                                                        {events.length}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Event chips — up to 2 visible, rest as +N */}
                                            <div className="flex flex-col gap-1">
                                                {events.slice(0, 2).map((ev) => (
                                                    <span
                                                        key={ev.id}
                                                        className={`truncate rounded-md px-1.5 py-0.5 text-[9px] font-semibold leading-tight sm:text-[10px] ${statusChip[ev.status] || 'bg-slate-400 text-white'}`}
                                                        title={ev.vehicleListing?.title}
                                                    >
                                                        {ev.vehicleListing?.title || 'Inspection'}
                                                    </span>
                                                ))}
                                                {events.length > 2 && (
                                                    <span className="text-[9px] font-bold text-slate-400">+{events.length - 2} more</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Day detail panel */}
                <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {selectedDay ? (
                        <>
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        {dateKey(selectedDay) === todayKey ? 'Today' : 'Selected Day'}
                                    </p>
                                    <h3 className="text-base font-bold text-slate-900">
                                        {selectedDay.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </h3>
                                </div>
                                <button onClick={() => setSelectedDay(null)} className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="max-h-[500px] overflow-y-auto p-4">
                                {selectedEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                                        <CalendarClock size={24} />
                                        <p className="text-sm font-medium">No inspections on this day.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedEvents.map((insp) => {
                                            const PMeta = priorityMeta[insp.priority] || priorityMeta.MEDIUM;
                                            const PIcon = PMeta.icon;
                                            return (
                                                <button
                                                    key={insp.id}
                                                    onClick={() => navigate(`/field-inspector/inspections/${insp.id}`)}
                                                    className="group block w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#001f3f]/20 hover:bg-white hover:shadow-md"
                                                >
                                                    <div className={`h-1 w-full ${statusDot[insp.status] || 'bg-slate-400'}`} />
                                                    <div className="p-3.5">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{insp.vehicleListing?.title}</p>
                                                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge[insp.status] || 'bg-slate-100 text-slate-600'}`}>
                                                                {insp.status.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                                                            <Phone size={11} className="shrink-0" /> {insp.seller?.fullName}
                                                        </p>
                                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                                            <MapPin size={11} className="shrink-0" />
                                                            <span className="truncate">{[insp.vehicleListing?.city, insp.vehicleListing?.state].filter(Boolean).join(', ') || '—'}</span>
                                                        </p>
                                                        <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 pt-2.5">
                                                            <span className={`flex items-center gap-1 text-[11px] font-semibold ${PMeta.color}`}>
                                                                <PIcon size={11} /> {insp.priority}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-[11px] font-bold text-[#001f3f] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                                View <Eye size={11} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-2 p-6 text-slate-400">
                            <CalIcon size={28} />
                            <p className="text-sm font-medium">Select a day to view inspections.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};