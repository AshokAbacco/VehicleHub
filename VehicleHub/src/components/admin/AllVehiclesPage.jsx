// VehicleHub/VehicleHub/src/components/admin/AllVehiclesPage.jsx
// Every listing on the platform (GET /api/admin/vehicles). Delete archives a vehicle that
// already has orders/inspections linked to it.
import { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, Eye, Trash2, Car } from 'lucide-react';
import { useGetAdminVehiclesQuery, useDeleteAdminVehicleMutation } from '../../services/adminApiSlice.js';
import { VehicleDetailModal } from '../../components/admin/VehicleDetailModal.jsx';
import { AdminConfirmDeleteModal } from '../../components/admin/AdminConfirmDeleteModal.jsx';
import { AdminLoading, AdminError, AdminEmpty } from './AdminState.jsx';
import { formatINR } from '../../utils/formatCurrency.js';
import { isUnverifiedListing } from '../../utils/listingVerification.js';

const statusColors = {
    live: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    sold: 'bg-violet-100 text-violet-700',
    rejected: 'bg-red-100 text-red-700',
    draft: 'bg-slate-100 text-slate-600',
    archived: 'bg-slate-100 text-slate-500',
};
const FILTERS = ['all', 'live', 'pending', 'sold', 'rejected', 'draft', 'archived'];

export const AllVehiclesPage = () => {
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [filter, setFilter] = useState('all');
    const [viewing, setViewing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    // Navbar search sends ?search=…
    useEffect(() => { setSearch(searchParams.get('search') || ''); }, [searchParams]);

    const { data, isLoading, isError, error, refetch } = useGetAdminVehiclesQuery();
    const [deleteVehicle, { isLoading: deletingNow }] = useDeleteAdminVehicleMutation();
    const items = useMemo(() => data?.data?.vehicles || [], [data]);

    const counts = useMemo(() => items.reduce((acc, v) => ({ ...acc, [v.status]: (acc[v.status] || 0) + 1 }), { all: items.length }), [items]);
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items
            .filter((v) => filter === 'all' || v.status === filter)
            .filter((v) => !q || [v.title, v.seller, v.category, v.brand, v.registrationNumber].filter(Boolean).some((f) => String(f).toLowerCase().includes(q)));
    }, [items, search, filter]);

    const confirmDelete = async () => {
        try {
            const res = await deleteVehicle(deleting.id).unwrap();
            toast.success(res?.message || 'Vehicle deleted');
            setDeleting(null);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete vehicle');
        }
    };

    return (
        <div className="space-y-6">
            <Helmet><title>All Vehicles | Admin</title></Helmet>
            <div className="animate-fadeInUp flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><Car size={22} className="text-[#001f3f]" /> All Vehicles</h1>
                    <p className="text-sm text-slate-500">Every listing across every seller on the platform.</p>
                </div>
                <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">{filtered.length} vehicles</span>
            </div>

            <div className="animate-fadeInUp flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <Search size={16} className="shrink-0 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by vehicle, seller, category or registration no..." className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
            </div>

            {!isLoading && !isError && items.length > 0 && (
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [&::-webkit-scrollbar]:hidden">
                    {FILTERS.filter((f) => f === 'all' || counts[f]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition ${filter === f ? 'border-[#001f3f] bg-[#001f3f] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-[#001f3f]/40'}`}
                        >
                            {f}
                            <span className={`rounded-full px-1.5 text-[10px] ${filter === f ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{counts[f] || 0}</span>
                        </button>
                    ))}
                </div>
            )}

            {isLoading ? (
                <AdminLoading label="Loading vehicles..." />
            ) : isError ? (
                <AdminError error={error} onRetry={refetch} label="Failed to load vehicles." />
            ) : filtered.length === 0 ? (
                <AdminEmpty icon={Car} title={items.length ? 'No vehicles match your search' : 'No vehicles listed yet'} />
            ) : (
                <div className="animate-fadeInUp overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <tr><th className="px-5 py-3">Vehicle</th><th className="px-5 py-3">Seller</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Views</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((v) => (
                                <tr key={v.id} className="transition hover:bg-slate-50">
                                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                                        <div className="flex items-center gap-2.5"><span className="text-lg">{v.thumb}</span> <span className="max-w-[260px] truncate">{v.title}</span></div>
                                    </td>
                                    <td className="max-w-[180px] truncate px-5 py-3.5 text-slate-600">{v.seller}</td>
                                    <td className="px-5 py-3.5 text-slate-600">{v.category || '—'}</td>
                                    <td className="px-5 py-3.5 font-semibold text-slate-900">{formatINR(v.price)}</td>
                                    <td className="px-5 py-3.5 text-slate-500">{v.views ?? 0}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[v.status] || statusColors.draft}`}>{v.status}</span>
                                            {isUnverifiedListing(v) && (
                                                <span title="Published by the seller without admin verification" className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">Unverified</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => setViewing(v)} title="View details" className="rounded-full p-1.5 text-slate-400 hover:bg-[#e6f2ff] hover:text-[#001f3f]"><Eye size={15} /></button>
                                            <button onClick={() => setDeleting(v)} title="Delete" className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {viewing && <VehicleDetailModal vehicle={viewing} onClose={() => setViewing(null)} />}
            {deleting && (
                <AdminConfirmDeleteModal
                    itemName={deleting.title}
                    onCancel={() => !deletingNow && setDeleting(null)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    );
};