import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Eye, Loader2, AlertCircle, ShoppingBag, Search } from 'lucide-react';
import { VehicleDetailModal } from '../../components/seller/VehicleDetailModal.jsx';
import { useGetSellerInventoryQuery } from '../../services/sellerApiSlice.js';
import { formatCurrency } from '../../utils/formatters.js';

export const SoldVehiclesPage = () => {
    const [search, setSearch] = useState('');
    const [modalListing, setModalListing] = useState(null);

    const { data, isLoading, isError, error } = useGetSellerInventoryQuery('SOLD');
    const vehicles = Array.isArray(data) ? data : data?.vehicles || [];

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return vehicles;
        return vehicles.filter((v) =>
            [v.title, v.brand, v.model, v.category, v.soldToName].some((f) => f && String(f).toLowerCase().includes(term))
        );
    }, [vehicles, search]);

    return (
        <div className="space-y-6">
            <Helmet><title>Sold Vehicles | VehicleHub Seller</title></Helmet>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Header — matches InventoryOverviewTable */}
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Sold Vehicles</h3>
                        <p className="mt-0.5 text-xs text-slate-500">Vehicles you've marked as sold, with buyer details.</p>
                    </div>
                    <span className="w-fit rounded-full border border-slate-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                        {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
                    </span>
                </div>

                {/* Search — matches InventoryOverviewTable */}
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-[#001f3f]/30 focus-within:bg-white">
                        <Search size={15} className="shrink-0 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by vehicle, buyer, or category..."
                            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        />
                    </div>
                </div>

                {isLoading && (
                    <div className="flex h-64 w-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#001f3f]" />
                        <span className="ml-3 text-sm font-medium text-slate-600">Loading sold vehicles...</span>
                    </div>
                )}

                {isError && (
                    <div className="flex flex-col items-center justify-center p-8">
                        <AlertCircle size={22} className="mb-2 text-red-500" />
                        <p className="text-sm font-semibold text-red-500">{error?.data?.message || 'Failed to load sold vehicles.'}</p>
                    </div>
                )}

                {!isLoading && !isError && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th scope="col" className="px-5 py-3.5">Vehicle</th>
                                    <th scope="col" className="px-5 py-3.5">Category</th>
                                    <th scope="col" className="px-5 py-3.5">Sold Price</th>
                                    <th scope="col" className="px-5 py-3.5">Buyer</th>
                                    <th scope="col" className="px-5 py-3.5">Sold On</th>
                                    <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <ShoppingBag size={22} className="text-slate-300" />
                                                No sold vehicles yet.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((v) => (
                                        <tr key={v.id} className="transition hover:bg-slate-50/80">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {v.images?.[0] ? (
                                                        <img src={v.images[0]} alt={v.title} className="h-10 w-10 rounded-xl border border-slate-100 object-cover" />
                                                    ) : (
                                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">🚘</span>
                                                    )}
                                                    <p className="font-semibold text-slate-900">{v.title}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-xs font-medium text-slate-600">{v.category}</td>
                                            <td className="px-5 py-4 font-semibold text-slate-900">
                                                {formatCurrency(v.soldPrice || v.price)}
                                            </td>
                                            <td className="px-5 py-4">
                                                {v.soldToName || v.soldToPhone || v.soldToEmail ? (
                                                    <div className="space-y-1">
                                                        {v.soldToName && <div className="font-medium text-slate-800">{v.soldToName}</div>}
                                                        {v.soldToPhone && <div className="text-[11px] text-slate-500">{v.soldToPhone}</div>}
                                                        {v.soldToEmail && <div className="text-[11px] text-slate-500">{v.soldToEmail}</div>}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Not recorded</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500">
                                                {v.soldAt
                                                    ? new Date(v.soldAt).toLocaleString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })
                                                    : v.updatedAt
                                                        ? new Date(v.updatedAt).toLocaleString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })
                                                        : '—'}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() => setModalListing(v)}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-200"
                                                >
                                                    <Eye size={13} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalListing && (
                <VehicleDetailModal
                    listing={modalListing}
                    onClose={() => setModalListing(null)}
                />
            )}
        </div>
    );
};