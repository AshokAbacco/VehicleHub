// VehicleHub/VehicleHub/src/components/admin/InspectionsPage.jsx
// Admin > Field Inspections: every field inspection, and assigning a Field Inspector to a vehicle.
// Assigned jobs show up on that inspector's dashboard (and the seller is notified).
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { ClipboardCheck, Plus, Search, X, Loader2, CalendarClock, UserCheck, ChevronDown } from 'lucide-react';
import {
    useGetAdminInspectionsQuery,
    useGetInspectorsQuery,
    useGetAdminVehiclesQuery,
    useAssignInspectionMutation,
} from '../../services/adminApiSlice.js';
import { AdminLoading, AdminError, AdminEmpty } from './AdminState.jsx';

const STATUS = {
    PENDING: { label: 'Not assigned', cls: 'bg-slate-100 text-slate-600' },
    ASSIGNED: { label: 'Assigned', cls: 'bg-blue-50 text-blue-700' },
    ACCEPTED: { label: 'Accepted', cls: 'bg-cyan-50 text-cyan-700' },
    IN_PROGRESS: { label: 'In progress', cls: 'bg-amber-50 text-amber-700' },
    COMPLETED: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700' },
    REJECTED: { label: 'Rejected', cls: 'bg-red-50 text-red-700' },
    CANCELLED: { label: 'Cancelled', cls: 'bg-slate-100 text-slate-500' },
};
const RESULT = {
    VERIFIED: { label: 'Verified', cls: 'text-emerald-600' },
    REJECTED: { label: 'Failed', cls: 'text-red-600' },
    NEEDS_CORRECTION: { label: 'Needs correction', cls: 'text-amber-600' },
};
const PRIORITY_CLS = { LOW: 'text-slate-500', MEDIUM: 'text-blue-600', HIGH: 'text-orange-600', URGENT: 'text-red-600' };
const FILTERS = ['ALL', 'PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
const OPEN = ['PENDING', 'ASSIGNED', 'ACCEPTED'];

const when = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—');

// datetime-local value for "tomorrow 10:00"
const defaultSlot = () => {
    const d = new Date(Date.now() + 86400000);
    d.setHours(10, 0, 0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const inputCls = 'w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#001f3f] focus:bg-white focus:outline-none';

const AssignModal = ({ preset, onClose }) => {
    const { data: inspectorsData, isLoading: loadingInspectors } = useGetInspectorsQuery();
    const { data: vehiclesData, isLoading: loadingVehicles } = useGetAdminVehiclesQuery();
    const [assign, { isLoading: saving }] = useAssignInspectionMutation();
    const inspectors = inspectorsData?.data || [];
    // Vehicles that can be inspected: waiting for approval or live
    const vehicles = (vehiclesData?.data?.vehicles || []).filter((v) => ['pending', 'live'].includes(v.status));
    const [form, setForm] = useState({
        vehicleId: preset?.vehicleListingId || '',
        inspectorId: preset?.inspector?.id || '',
        scheduledAt: defaultSlot(),
        priority: preset?.priority || 'MEDIUM',
        deadline: '',
    });
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.vehicleId || !form.inspectorId || !form.scheduledAt) return toast.error('Choose a vehicle, an inspector and a date');
        try {
            const res = await assign({
                ...form,
                scheduledAt: new Date(form.scheduledAt).toISOString(),
                deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
            }).unwrap();
            toast.success(res?.message || 'Inspection assigned');
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to assign inspection');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <form onSubmit={submit} className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-[#001f3f]">Field inspection</p>
                        <h2 className="text-lg font-bold text-slate-900">{preset ? 'Reassign inspector' : 'Assign an inspector'}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={18} /></button>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Vehicle</span>
                        {loadingVehicles ? <div className="flex h-11 items-center"><Loader2 size={16} className="animate-spin text-[#001f3f]" /></div> : (
                            <div className="relative">
                                <select value={form.vehicleId} onChange={(e) => set('vehicleId', e.target.value)} disabled={!!preset} className={`${inputCls} appearance-none pr-9`}>
                                    <option value="">Select a vehicle…</option>
                                    {vehicles.map((v) => (
                                        <option key={v.id} value={v.id}>{v.title} — {v.seller} ({v.status === 'pending' ? 'awaiting approval' : 'live'})</option>
                                    ))}
                                    {preset && !vehicles.some((v) => v.id === preset.vehicleListingId) && <option value={preset.vehicleListingId}>{preset.vehicleListing?.title}</option>}
                                </select>
                                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        )}
                    </label>
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Field inspector</span>
                        {loadingInspectors ? <div className="flex h-11 items-center"><Loader2 size={16} className="animate-spin text-[#001f3f]" /></div> : inspectors.length === 0 ? (
                            <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">No field inspector accounts yet.</p>
                        ) : (
                            <div className="relative">
                                <select value={form.inspectorId} onChange={(e) => set('inspectorId', e.target.value)} className={`${inputCls} appearance-none pr-9`}>
                                    <option value="">Select an inspector…</option>
                                    {inspectors.map((i) => (
                                        <option key={i.id} value={i.id}>{i.fullName || i.email} — {i.openInspections} open job{i.openInspections === 1 ? '' : 's'}</option>
                                    ))}
                                </select>
                                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        )}
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Inspection date & time</span>
                            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => set('scheduledAt', e.target.value)} className={inputCls} />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Priority</span>
                            <div className="relative">
                                <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className={`${inputCls} appearance-none pr-9`}>
                                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
                                </select>
                                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </label>
                    </div>
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Report deadline <span className="font-normal text-slate-400">(optional)</span></span>
                        <input type="datetime-local" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className={inputCls} />
                    </label>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                    <button type="button" onClick={onClose} className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#002a55] disabled:opacity-60">
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <UserCheck size={15} />} Assign
                    </button>
                </div>
            </form>
        </div>,
        document.body
    );
};

export const InspectionsPage = () => {
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [assigning, setAssigning] = useState(null); // null | 'new' | inspection
    const { data, isLoading, isError, error, refetch } = useGetAdminInspectionsQuery(undefined, { pollingInterval: 30000 });
    const items = useMemo(() => data?.data || [], [data]);
    const counts = useMemo(() => items.reduce((a, i) => ({ ...a, [i.status]: (a[i.status] || 0) + 1 }), { ALL: items.length }), [items]);
    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items
            .filter((i) => filter === 'ALL' || i.status === filter)
            .filter((i) => !q || [i.inspectionNo, i.vehicleListing?.title, i.inspector?.fullName, i.seller?.fullName].filter(Boolean).some((f) => f.toLowerCase().includes(q)));
    }, [items, filter, search]);

    return (
        <div className="space-y-6">
            <Helmet><title>Field Inspections | Admin</title></Helmet>
            <div className="animate-fadeInUp flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><ClipboardCheck size={22} className="text-[#001f3f]" /> Field Inspections</h1>
                    <p className="text-sm text-slate-500">Assign field inspectors to vehicles and track their verification reports.</p>
                </div>
                <button onClick={() => setAssigning('new')} className="flex w-fit items-center gap-1.5 rounded-xl bg-[#001f3f] px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#002a55]">
                    <Plus size={15} /> Assign inspector
                </button>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <Search size={16} className="shrink-0 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by inspection no., vehicle, inspector or seller..." className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
            </div>

            {!isLoading && !isError && items.length > 0 && (
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [&::-webkit-scrollbar]:hidden">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${filter === f ? 'border-[#001f3f] bg-[#001f3f] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-[#001f3f]/40'}`}
                        >
                            {f === 'ALL' ? 'All' : STATUS[f].label}
                            <span className={`rounded-full px-1.5 text-[10px] ${filter === f ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{counts[f] || 0}</span>
                        </button>
                    ))}
                </div>
            )}

            {isLoading ? (
                <AdminLoading label="Loading inspections..." />
            ) : isError ? (
                <AdminError error={error} onRetry={refetch} label="Failed to load inspections." />
            ) : visible.length === 0 ? (
                <AdminEmpty icon={ClipboardCheck} title={items.length ? 'No inspections match' : 'No field inspections yet'} text={items.length ? '' : 'Use "Assign inspector" to schedule the first one.'} />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <tr><th className="px-5 py-3">Inspection</th><th className="px-5 py-3">Vehicle / Seller</th><th className="px-5 py-3">Inspector</th><th className="px-5 py-3">Scheduled</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Result</th><th className="px-5 py-3"></th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {visible.map((i) => {
                                const st = STATUS[i.status] || STATUS.PENDING;
                                const res = RESULT[i.result];
                                return (
                                    <tr key={i.id} className="align-top hover:bg-slate-50">
                                        <td className="px-5 py-3.5">
                                            <p className="font-mono text-xs font-semibold text-slate-700">{i.inspectionNo}</p>
                                            <p className={`text-[11px] font-semibold ${PRIORITY_CLS[i.priority] || 'text-slate-500'}`}>{i.priority}</p>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="max-w-[240px] truncate font-semibold text-slate-900">{i.vehicleListing?.title || 'Vehicle'}</p>
                                            <p className="max-w-[240px] truncate text-xs text-slate-500">{i.seller?.fullName || '—'} · {[i.vehicleListing?.city, i.vehicleListing?.state].filter(Boolean).join(', ')}</p>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium text-slate-800">{i.inspector?.fullName || <span className="text-slate-400">Not assigned</span>}</p>
                                            {i.inspector?.phone && <p className="text-xs text-slate-500">{i.inspector.phone}</p>}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3.5 text-slate-600"><span className="inline-flex items-center gap-1"><CalendarClock size={12} className="text-slate-400" /> {when(i.scheduledAt)}</span></td>
                                        <td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span></td>
                                        <td className="max-w-[220px] px-5 py-3.5">
                                            {res ? (
                                                <>
                                                    <p className={`text-xs font-bold ${res.cls}`}>{res.label}{i.finalRating ? ` · ${i.finalRating}/5` : ''}</p>
                                                    <p className="line-clamp-2 text-[11px] text-slate-500" title={i.finalNotes || i.rejectionReason || i.correctionReason || ''}>{i.finalNotes || i.rejectionReason || i.correctionReason}</p>
                                                </>
                                            ) : <span className="text-xs text-slate-400">—</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            {OPEN.includes(i.status) && (
                                                <button onClick={() => setAssigning(i)} className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#001f3f] hover:bg-[#e6f2ff]">
                                                    {i.inspector ? 'Reassign' : 'Assign'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {assigning && <AssignModal preset={assigning === 'new' ? null : assigning} onClose={() => setAssigning(null)} />}
        </div>
    );
};