import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, SlidersHorizontal, X, ClipboardList } from 'lucide-react';
import { InspectionListPage } from '../../components/field-inspector/InspectionListPage.jsx';
import { useGetMyInspectionsQuery } from '../../services/fieldInspectorApiSlice.js';

const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const priorityOptions = [
    { value: '', label: 'All priorities' },
    { value: 'URGENT', label: 'Urgent' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
];

export const FieldInspectorInspections = () => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');

    const { data, isLoading, isError } = useGetMyInspectionsQuery({
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
    });
    const inspections = data?.data?.inspections || [];
    const total = data?.data?.total ?? inspections.length;

    const activeFilterCount = [status, priority].filter(Boolean).length;

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setPriority('');
    };

    return (
        <div className="space-y-6">
            <Helmet><title>My Inspections | VehicleHub Inspector</title></Helmet>

            {/* Gradient hero header */}
            <div className="animate-fadeInUp relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001f3f] via-[#002a55] to-[#003d7a] p-6 shadow-lg shadow-[#001f3f]/20 sm:p-7">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-white/5" />
                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                            <ClipboardList size={13} /> Field Inspector
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">My Inspections</h1>
                        <p className="mt-1 text-sm text-white/70">Manage all vehicle verification assignments.</p>
                    </div>
                    <span className="w-fit rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm">
                        {total} total
                    </span>
                </div>
            </div>

            {/* Filter bar */}
            <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition focus-within:border-[#001f3f]/30 focus-within:bg-white">
                        <Search size={16} className="shrink-0 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by vehicle, seller, or inspection ID..."
                            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="shrink-0 text-slate-400 hover:text-slate-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={15} className="hidden shrink-0 text-slate-400 sm:block" />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition focus:outline-none ${status ? 'border-[#001f3f]/30 bg-[#e6f2ff] text-[#001f3f]' : 'border-slate-200 bg-white text-slate-700'
                                }`}
                        >
                            {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition focus:outline-none ${priority ? 'border-[#001f3f]/30 bg-[#e6f2ff] text-[#001f3f]' : 'border-slate-200 bg-white text-slate-700'
                                }`}
                        >
                            {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        {(activeFilterCount > 0 || search) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                            >
                                <X size={12} /> Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <InspectionListPage
                title=""
                subtitle=""
                inspections={inspections}
                isLoading={isLoading}
                isError={isError}
                emptyText={search || activeFilterCount > 0 ? 'No inspections match your filters.' : 'No inspections assigned yet.'}
            />
        </div>
    );
};