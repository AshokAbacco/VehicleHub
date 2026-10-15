// VehicleHub/VehicleHub/src/components/admin/AdminPaymentsPage.jsx
// Orders & Sales (route /admin/dashboard/orders, also /payments): which buyer bought which
// vehicle from which seller, every purchase request, and payment records — GET /api/admin/orders.
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Receipt, Search, ShoppingBag, CreditCard, Handshake, ArrowRight } from 'lucide-react';
import { useGetAdminOrdersQuery } from '../../services/adminApiSlice.js';
import { AdminLoading, AdminError, AdminEmpty } from './AdminState.jsx';
import { formatINR } from '../../utils/formatCurrency.js';

const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

const requestBadge = {
    PENDING: 'bg-amber-50 text-amber-700',
    ACCEPTED: 'bg-emerald-50 text-emerald-700',
    REJECTED: 'bg-red-50 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-500',
};
const paymentBadge = {
    SUCCESS: 'bg-emerald-50 text-emerald-700',
    PENDING: 'bg-amber-50 text-amber-700',
    FAILED: 'bg-red-50 text-red-700',
    REFUNDED: 'bg-slate-100 text-slate-500',
};
const saleBadge = { Paid: 'bg-emerald-50 text-emerald-700', 'Part paid': 'bg-amber-50 text-amber-700', Unpaid: 'bg-red-50 text-red-700', 'Settled offline': 'bg-slate-100 text-slate-600' };

const TABS = [
    { id: 'sales', label: 'Completed Sales', icon: Handshake },
    { id: 'requests', label: 'Purchase Requests', icon: ShoppingBag },
    { id: 'payments', label: 'Payments', icon: CreditCard },
];

const Person = ({ label, person }) => (
    <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800">{person?.name || '—'}</p>
        {(person?.phone || person?.email) && <p className="truncate text-xs text-slate-500">{person.phone || person.email}</p>}
    </div>
);

export const AdminPaymentsPage = () => {
    const [tab, setTab] = useState('sales');
    const [search, setSearch] = useState('');
    const { data, isLoading, isError, error, refetch } = useGetAdminOrdersQuery(undefined, { pollingInterval: 30000 });
    const d = data?.data;
    const totals = d?.totals || {};

    const match = (...fields) => {
        const q = search.trim().toLowerCase();
        return !q || fields.filter(Boolean).some((f) => String(f).toLowerCase().includes(q));
    };
    const sales = useMemo(() => (d?.sales || []).filter((s) => match(s.vehicle, s.buyer?.name, s.seller?.name)), [d, search]); // eslint-disable-line react-hooks/exhaustive-deps
    const requests = useMemo(() => (d?.requests || []).filter((r) => match(r.vehicle, r.buyer?.name, r.seller?.name, r.status)), [d, search]); // eslint-disable-line react-hooks/exhaustive-deps
    const payments = useMemo(() => (d?.payments || []).filter((p) => match(p.vehicle, p.buyer?.name, p.seller, p.reference, p.status)), [d, search]); // eslint-disable-line react-hooks/exhaustive-deps
    const counts = { sales: d?.sales?.length || 0, requests: d?.requests?.length || 0, payments: d?.payments?.length || 0 };

    return (
        <div className="space-y-6">
            <Helmet><title>Orders & Sales | Admin</title></Helmet>
            <div className="animate-fadeInUp">
                <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><Receipt size={22} className="text-[#001f3f]" /> Orders & Sales</h1>
                <p className="text-sm text-slate-500">Which buyer purchased which vehicle from which seller, purchase requests and payments.</p>
            </div>

            {isLoading ? (
                <AdminLoading label="Loading orders..." />
            ) : isError ? (
                <AdminError error={error} onRetry={refetch} label="Failed to load orders and sales." />
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {[
                            { label: 'Vehicles sold', value: totals.sales ?? 0 },
                            { label: 'Sales value', value: formatINR(totals.salesValue) },
                            { label: 'Commission', value: formatINR(totals.commission), color: 'text-emerald-600' },
                            { label: 'Open purchase requests', value: totals.openRequests ?? 0, color: 'text-amber-600' },
                        ].map((c, idx) => (
                            <div key={c.label} style={{ animationDelay: `${idx * 60}ms` }} className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase text-slate-400">{c.label}</p>
                                <p className={`mt-1.5 text-2xl font-extrabold ${c.color || 'text-slate-900'}`}>{c.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="-mx-1 flex gap-1 overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden">
                        <div className="flex w-fit shrink-0 gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                            {TABS.map((t) => {
                                const Icon = t.icon;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setTab(t.id)}
                                        className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t.id ? 'bg-[#001f3f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        <Icon size={14} /> {t.label} ({counts[t.id]})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                        <Search size={16} className="shrink-0 text-slate-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by vehicle, buyer or seller..." className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
                    </div>

                    {tab === 'sales' && (sales.length === 0 ? (
                        <AdminEmpty icon={Handshake} title="No completed sales yet" text="A sale appears here when a seller accepts a purchase request or marks a vehicle sold." />
                    ) : (
                        <div className="space-y-3">
                            {sales.map((s) => (
                                <div key={s.id} className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">{s.thumb}</span>
                                            <div className="min-w-0">
                                                <p className="truncate font-bold text-slate-900">{s.vehicle}</p>
                                                <p className="text-xs text-slate-500">{s.category || 'Vehicle'} · Sold {day(s.soldAt)} · {s.source}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-extrabold text-slate-900">{formatINR(s.amount)}</p>
                                            <p className="text-[11px] text-slate-400">Commission {formatINR(s.commission)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 items-center gap-3 border-t border-slate-100 pt-3 sm:grid-cols-[1fr_auto_1fr_auto]">
                                        <Person label="Seller" person={s.seller} />
                                        <ArrowRight size={16} className="hidden text-slate-300 sm:block" />
                                        <Person label="Buyer" person={s.buyer || { name: 'Not recorded' }} />
                                        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${saleBadge[s.paymentStatus] || saleBadge['Settled offline']}`}>{s.paymentStatus}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                    {tab === 'requests' && (requests.length === 0 ? (
                        <AdminEmpty icon={ShoppingBag} title="No purchase requests yet" />
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <table className="w-full min-w-[820px] text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr><th className="px-5 py-3">Vehicle</th><th className="px-5 py-3">Buyer</th><th className="px-5 py-3">Seller</th><th className="px-5 py-3">Offer / Listed</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {requests.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50">
                                            <td className="max-w-[220px] truncate px-5 py-3.5 font-semibold text-slate-900">{r.vehicle}</td>
                                            <td className="px-5 py-3.5"><p className="font-medium text-slate-800">{r.buyer?.name}</p><p className="text-xs text-slate-500">{r.buyer?.phone || r.buyer?.email}</p></td>
                                            <td className="px-5 py-3.5 text-slate-700">{r.seller?.name || '—'}</td>
                                            <td className="px-5 py-3.5"><p className="font-semibold text-slate-900">{formatINR(r.offerPrice)}</p><p className="text-xs text-slate-400">{r.listedPrice ? formatINR(r.listedPrice) : '—'}</p></td>
                                            <td className="px-5 py-3.5">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${requestBadge[r.status] || requestBadge.PENDING}`}>{r.status === 'REJECTED' ? 'DECLINED' : r.status}</span>
                                                {r.rejectReason && <p className="mt-1 max-w-[200px] truncate text-[11px] text-red-500" title={r.rejectReason}>{r.rejectReason}</p>}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{day(r.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}

                    {tab === 'payments' && (payments.length === 0 ? (
                        <AdminEmpty icon={CreditCard} title="No payment records yet" />
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <table className="w-full min-w-[820px] text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr><th className="px-5 py-3">Reference</th><th className="px-5 py-3">Buyer</th><th className="px-5 py-3">Vehicle</th><th className="px-5 py-3">Seller</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payments.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{p.reference || p.id.slice(-8)}<p className="font-sans text-[11px] text-slate-400">{p.provider}</p></td>
                                            <td className="px-5 py-3.5 font-medium text-slate-800">{p.buyer?.name || '—'}</td>
                                            <td className="max-w-[200px] truncate px-5 py-3.5 text-slate-700">{p.vehicle || '—'}</td>
                                            <td className="px-5 py-3.5 text-slate-700">{p.seller || '—'}</td>
                                            <td className="px-5 py-3.5 font-semibold text-slate-900">{formatINR(p.amount)}</td>
                                            <td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${paymentBadge[p.status] || paymentBadge.PENDING}`}>{p.status}</span></td>
                                            <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{day(p.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};