import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Eye, Trash2, Car } from 'lucide-react';
import { allVehicles as initial } from '../../data/adminMockData.js';
import { VehicleDetailModal } from '../../components/admin/VehicleDetailModal.jsx';
import { AdminConfirmDeleteModal } from '../../components/admin/AdminConfirmDeleteModal.jsx';

const statusColors = { live: 'bg-emerald-100 text-emerald-700', sold: 'bg-violet-100 text-violet-700', rejected: 'bg-red-100 text-red-700' };

export const AllVehiclesPage = () => {
    const [search, setSearch] = useState('');
    const [items, setItems] = useState(initial);
    const [viewing, setViewing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const filtered = useMemo(() => items.filter((v) => [v.title, v.seller, v.category].some((f) => f.toLowerCase().includes(search.trim().toLowerCase()))), [items, search]);

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
                <Search size={16} className="text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by vehicle, seller, or category..." className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
            </div>

            <div className="animate-fadeInUp overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[750px] text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr><th className="px-5 py-3">Vehicle</th><th className="px-5 py-3">Seller</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Views</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map((v) => (
                            <tr key={v.id} className="transition hover:bg-slate-50">
                                <td className="flex items-center gap-2.5 px-5 py-3.5 font-semibold text-slate-900"><span className="text-lg">{v.thumb}</span> {v.title}</td>
                                <td className="px-5 py-3.5 text-slate-600">{v.seller}</td>
                                <td className="px-5 py-3.5 text-slate-600">{v.category}</td>
                                <td className="px-5 py-3.5 font-semibold text-slate-900">₹{(v.price / 100000).toFixed(2)}L</td>
                                <td className="px-5 py-3.5 text-slate-500">{v.views}</td>
                                <td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[v.status]}`}>{v.status}</span></td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => setViewing(v)} className="rounded-full p-1.5 text-slate-400 hover:bg-[#e6f2ff] hover:text-[#001f3f]"><Eye size={15} /></button>
                                        <button onClick={() => setDeleting(v)} className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {viewing && <VehicleDetailModal vehicle={viewing} onClose={() => setViewing(null)} />}
            {deleting && (
                <AdminConfirmDeleteModal
                    itemName={deleting.title}
                    onCancel={() => setDeleting(null)}
                    onConfirm={() => { setItems((prev) => prev.filter((v) => v.id !== deleting.id)); setDeleting(null); }}
                />
            )}
        </div>
    );
};