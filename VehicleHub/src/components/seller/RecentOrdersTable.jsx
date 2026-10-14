import { useState } from 'react';
import { Download, ChevronRight, ChevronLeft, Eye, ShoppingBag } from 'lucide-react';
import { OrderDetailModal } from './OrderDetailModal.jsx';
import { formatCurrency } from '../../utils/formatters.js';

const statusStyles = {
    SOLD: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    REJECTED: 'bg-red-100 text-red-700',
};

export const RecentOrdersTable = ({ vehicles = [] }) => {
    const ITEMS_PER_PAGE = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    // Only sold vehicles count as "orders" — most recent sale first
    const orders = [...vehicles]
        .filter((v) => String(v.status || '').toUpperCase() === 'SOLD')
        .sort((a, b) => new Date(b.soldAt || b.updatedAt) - new Date(a.soldAt || a.updatedAt));

    const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));
    const currentOrders = orders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const shortId = (id) => `#${String(id).slice(0, 8).toUpperCase()}`;

    return (
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-slate-900 sm:text-lg">Recent Orders</h2>
                    <p className="text-xs text-slate-500 sm:text-sm">Your most recently sold vehicles.</p>
                </div>
                <button className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-[#001f3f] transition hover:bg-slate-100">
                    <Download size={13} /> <span className="hidden xs:inline">Export</span>
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-12 text-slate-400">
                    <ShoppingBag size={22} />
                    <p className="text-sm font-medium">No sales yet.</p>
                </div>
            ) : (
                <>
                    {/* Desktop table — full width */}
                    <div className="hidden w-full overflow-hidden rounded-xl border border-slate-200 sm:block">
                        <table className="w-full table-fixed divide-y divide-slate-100 text-left text-sm text-slate-700">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="w-[12%] px-4 py-3">Order</th>
                                    <th className="w-[20%] px-4 py-3">Buyer</th>
                                    <th className="w-[28%] px-4 py-3">Vehicle</th>
                                    <th className="w-[15%] px-4 py-3">Amount</th>
                                    <th className="w-[13%] px-4 py-3">Status</th>
                                    <th className="w-[12%] px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {currentOrders.map((v) => (
                                    <tr key={v.id} className="transition hover:bg-slate-50">
                                        <td className="px-4 py-4 font-mono text-xs font-medium text-[#001f3f]">{shortId(v.id)}</td>
                                        <td className="truncate px-4 py-4 font-semibold text-slate-900">{v.soldToName || '—'}</td>
                                        <td className="truncate px-4 py-4 text-slate-500">{v.title}</td>
                                        <td className="px-4 py-4 font-bold text-slate-900">{formatCurrency(v.soldPrice || v.price)}</td>
                                        <td className="px-4 py-4">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles.SOLD}`}>Sold</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => setSelectedVehicle(v)}
                                                className="flex items-center gap-1.5 rounded-full border border-[#001f3f]/20 bg-[#e6f2ff] px-3 py-1.5 text-xs font-semibold text-[#001f3f] transition hover:bg-[#d5eaff]"
                                            >
                                                <Eye size={13} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-2.5 sm:hidden">
                        {currentOrders.map((v) => (
                            <div key={v.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-medium text-[#001f3f]">{shortId(v.id)}</span>
                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles.SOLD}`}>Sold</span>
                                </div>
                                <p className="mt-2 text-sm font-semibold text-slate-900">{v.soldToName || 'Buyer not recorded'}</p>
                                <p className="text-xs text-slate-500">{v.title}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-sm font-bold text-slate-900">{formatCurrency(v.soldPrice || v.price)}</p>
                                    <button
                                        onClick={() => setSelectedVehicle(v)}
                                        className="flex items-center gap-1.5 rounded-full border border-[#001f3f]/20 bg-[#e6f2ff] px-3 py-1.5 text-xs font-semibold text-[#001f3f]"
                                    >
                                        <Eye size={13} /> View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                        <p className="text-xs text-slate-500 sm:text-sm">Page {currentPage} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                            >
                                <ChevronLeft size={14} /> Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 rounded-lg bg-[#001f3f] px-3.5 py-2 text-xs font-medium text-white transition hover:bg-[#002a55] disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {selectedVehicle && (
                <OrderDetailModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
            )}
        </div>
    );
};