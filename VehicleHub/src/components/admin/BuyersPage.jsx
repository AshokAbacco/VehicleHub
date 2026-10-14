// VehicleHub/VehicleHub/src/components/admin/BuyersPage.jsx
import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Search, Users, Heart, ShoppingBag, Eye, Trash2, Loader2, XCircle, RefreshCw, Clock } from 'lucide-react';
import { useGetAdminBuyersQuery, useDeleteAdminBuyerMutation } from '../../services/adminApiSlice.js';
import { BuyerDetailModal } from '../../components/admin/BuyerDetailModal.jsx';
import { AdminConfirmDeleteModal } from '../../components/admin/AdminConfirmDeleteModal.jsx';

export const BuyersPage = () => {
    const [search, setSearch] = useState('');
    const [viewing, setViewing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    // Real data from GET /api/admin/buyers (was hard-coded adminMockData before)
    const { data, isLoading, isError, error, refetch, isFetching } = useGetAdminBuyersQuery();
    const [deleteBuyer, { isLoading: removing }] = useDeleteAdminBuyerMutation();
    const items = useMemo(() => data?.data?.buyers || [], [data]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter((b) => [b.name, b.email, b.phone].some((f) => String(f || '').toLowerCase().includes(q)));
    }, [items, search]);

    const handleDelete = async () => {
        try {
            await deleteBuyer(deleting.id).unwrap();
            toast.success(`${deleting.name} removed`);
            setDeleting(null);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to remove buyer');
        }
    };

    return (
        <div className="space-y-6">
            <Helmet><title>Buyers | Admin</title></Helmet>
            <div className="animate-fadeInUp flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><Users size={22} className="text-[#001f3f]" /> Buyers</h1>
                    <p className="text-sm text-slate-500">Registered buyers and their engagement.</p>
                </div>
                {!isLoading && !isError && (
                    <span className="w-fit rounded-full bg-[#e6f2ff] px-3 py-1.5 text-xs font-bold text-[#001f3f]">
                        {items.length} buyer{items.length === 1 ? '' : 's'}
                    </span>
                )}
            </div>

            <div className="animate-fadeInUp flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <Search size={16} className="shrink-0 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or phone..." className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
                {isFetching && !isLoading && <Loader2 size={15} className="shrink-0 animate-spin text-slate-400" />}
            </div>

            {isLoading ? (
                <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" />
                </div>
            ) : isError ? (
                <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 text-red-600">
                    <XCircle size={22} />
                    <p className="text-sm font-medium">{error?.data?.message || 'Failed to load buyers.'}</p>
                    <button onClick={refetch} className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                        <RefreshCw size={12} /> Try again
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white text-slate-400">
                    <Users size={24} />
                    <p className="text-sm font-medium">{search ? `No buyers match "${search}".` : 'No buyers registered yet.'}</p>
                </div>
            ) : (
                <div className="animate-fadeInUp overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-5 py-3">Name</th>
                                <th className="px-5 py-3">Contact</th>
                                <th className="px-5 py-3">Purchases</th>
                                <th className="px-5 py-3">Pending</th>
                                <th className="px-5 py-3">Wishlist</th>
                                <th className="px-5 py-3">Joined</th>
                                <th className="px-5 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((b) => (
                                <tr key={b.id} className="transition hover:bg-slate-50">
                                    <td className="px-5 py-3.5 font-semibold text-slate-900">{b.name}</td>
                                    <td className="max-w-[260px] px-5 py-3.5 text-slate-500">
                                        <p className="truncate">{b.email}</p>
                                        <p className="text-xs">{b.phone || '—'}</p>
                                    </td>
                                    <td className="px-5 py-3.5"><span className="flex items-center gap-1 font-semibold text-slate-900"><ShoppingBag size={13} className="text-[#001f3f]" /> {b.purchases.length}</span></td>
                                    <td className="px-5 py-3.5"><span className="flex items-center gap-1 text-slate-600"><Clock size={13} className="text-amber-500" /> {b.pending.length}</span></td>
                                    <td className="px-5 py-3.5"><span className="flex items-center gap-1 text-slate-600"><Heart size={13} className="text-red-400" /> {b.wishlist.length}</span></td>
                                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-400">{b.joined}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => setViewing(b)} title="View details" className="rounded-full p-1.5 text-slate-400 hover:bg-[#e6f2ff] hover:text-[#001f3f]"><Eye size={15} /></button>
                                            <button onClick={() => setDeleting(b)} title="Remove buyer" className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {viewing && <BuyerDetailModal buyer={viewing} onClose={() => setViewing(null)} />}
            {deleting && (
                <AdminConfirmDeleteModal
                    itemName={deleting.name}
                    onCancel={() => !removing && setDeleting(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
};