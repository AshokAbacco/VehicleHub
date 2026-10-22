// VehicleHub/VehicleHub/src/components/admin/PlanPaymentsPage.jsx
// Admin — Plan Payments (/admin/dashboard/plan-payments): every plan bought on the Pricing page,
// with plan period, remaining days and account status — GET /api/admin/plan-payments.
// Search, filters, sorting and pagination run on the server.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import {
    BadgeIndianRupee, Users, IndianRupee, CheckCircle2, XCircle, AlarmClock, Search, X, ChevronUp, ChevronDown,
    ChevronsUpDown, ChevronLeft, ChevronRight, RefreshCw, Loader2, CreditCard,
} from 'lucide-react';
import { useGetPlanPaymentsQuery } from '../../services/adminApiSlice.js';
import { AdminLoading, AdminError, AdminEmpty } from './AdminState.jsx';

const rupees = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const PLAN_STATUS = {
    ACTIVE: { label: 'Active', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'border-l-emerald-500' },
    EXPIRING_SOON: { label: 'Expiring soon', badge: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'border-l-amber-500' },
    UPCOMING: { label: 'Upcoming', badge: 'bg-sky-50 text-sky-700 border-sky-200', bar: 'border-l-sky-500' },
    EXPIRED: { label: 'Expired', badge: 'bg-red-50 text-red-700 border-red-200', bar: 'border-l-red-500' },
    NOT_ACTIVE: { label: 'Not active', badge: 'bg-slate-100 text-slate-500 border-slate-200', bar: 'border-l-slate-300' },
};
const PAYMENT_BADGE = {
    SUCCESS: 'bg-emerald-50 text-emerald-700',
    PENDING: 'bg-amber-50 text-amber-700',
    FAILED: 'bg-red-50 text-red-700',
    REFUNDED: 'bg-slate-100 text-slate-500',
};
const ACCOUNT_BADGE = {
    APPROVED: 'text-emerald-700',
    ACTIVE: 'text-emerald-700',
    PENDING_APPROVAL: 'text-amber-700',
    NOT_REGISTERED: 'text-slate-500',
    REJECTED: 'text-red-600',
    SUSPENDED: 'text-red-600',
    BLOCKED: 'text-red-600',
    INACTIVE: 'text-slate-500',
};
const STATUS_TABS = [
    { id: '', label: 'All' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'EXPIRING_SOON', label: 'Expiring soon' },
    { id: 'UPCOMING', label: 'Upcoming' },
    { id: 'EXPIRED', label: 'Expired' },
    { id: 'NOT_ACTIVE', label: 'Not active' },
];
const EMPTY_FILTERS = { planStatus: '', paymentStatus: '', location: '', duration: '', from: '', to: '' };

const selectClass = 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-[#001f3f] focus:outline-none';

const RemainingDays = ({ row }) => {
    if (!row.planExpiry || row.planStatus === 'EXPIRED') return <span className="text-slate-400">0 days</span>;
    const color = row.planStatus === 'EXPIRING_SOON' ? 'text-amber-700' : row.planStatus === 'UPCOMING' ? 'text-sky-700' : 'text-slate-900';
    return <span className={`font-bold ${color}`}>{row.remainingDays} day{row.remainingDays === 1 ? '' : 's'}</span>;
};

const Detail = ({ label, children }) => (
    <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <div className="mt-0.5 break-words text-sm font-semibold text-slate-800">{children || '—'}</div>
    </div>
);

const DetailsModal = ({ row, onClose }) => {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    const st = PLAN_STATUS[row.planStatus] || PLAN_STATUS.NOT_ACTIVE;
    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label="Plan payment details" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
                    <div className="min-w-0">
                        <p className="truncate text-lg font-extrabold text-slate-900">{row.name}</p>
                        <p className="truncate text-sm text-slate-500">{row.shopName}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                    <Detail label="Email">{row.email}</Detail>
                    <Detail label="Phone">{row.phone}</Detail>
                    <Detail label="Plan">{row.planName}</Detail>
                    <Detail label="Amount">{rupees(row.amount)}</Detail>
                    <Detail label="Payment date">{day(row.paidAt)}</Detail>
                    <Detail label="Payment status"><span className={`rounded-full px-2 py-0.5 text-xs ${PAYMENT_BADGE[row.paymentStatus] || PAYMENT_BADGE.PENDING}`}>{row.paymentStatus}</span></Detail>
                    <Detail label="Plan start">{day(row.planStart)}</Detail>
                    <Detail label="Plan expiry">{day(row.planExpiry)}</Detail>
                    <Detail label="Remaining">{<RemainingDays row={row} />}</Detail>
                    <Detail label="Plan status">
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${st.badge}`}>{st.label}</span>
                        {row.renewed && <span className="ml-1.5 text-xs font-medium text-sky-700">Renewed</span>}
                    </Detail>
                    <Detail label="Account status"><span className={ACCOUNT_BADGE[row.accountStatus?.code]}>{row.accountStatus?.label}</span></Detail>
                    <Detail label="Account type">{row.role ? row.role.charAt(0) + row.role.slice(1).toLowerCase() : 'No account yet'}</Detail>
                    <Detail label="Invoice">{row.invoiceNumber ? `${row.invoiceNumber} · email ${String(row.invoiceEmailStatus || '').toLowerCase()}` : '—'}</Detail>
                    <Detail label="Razorpay payment ID"><span className="font-mono text-xs">{row.razorpayPaymentId}</span></Detail>
                    <Detail label="Razorpay order ID"><span className="font-mono text-xs">{row.razorpayOrderId}</span></Detail>
                </div>
            </div>
        </div>,
        document.body,
    );
};

const SortHeader = ({ id, label, sort, order, onSort, className = '' }) => {
    const active = sort === id;
    const Icon = !active ? ChevronsUpDown : order === 'asc' ? ChevronUp : ChevronDown;
    return (
        <th className={`px-4 py-3 ${className}`} aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <button type="button" onClick={() => onSort(id)} className={`inline-flex items-center gap-1 uppercase tracking-wide transition hover:text-slate-800 ${active ? 'text-[#001f3f]' : ''}`}>
                {label} <Icon size={13} />
            </button>
        </th>
    );
};

export const PlanPaymentsPage = () => {
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [sort, setSort] = useState({ sort: 'paidAt', order: 'desc' });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selected, setSelected] = useState(null);

    // search waits for the admin to stop typing
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350);
        return () => clearTimeout(t);
    }, [searchInput]);

    const { data, isLoading, isFetching, isError, error, refetch } = useGetPlanPaymentsQuery(
        { search, ...filters, ...sort, page, limit },
        { pollingInterval: 60000 },
    );
    const d = data?.data;
    const s = d?.summary || {};
    const rows = d?.payments || [];
    const pg = d?.pagination || { page: 1, pages: 1, total: 0, limit };
    const counts = d?.statusCounts || {};
    const hasFilters = Boolean(search) || Object.values(filters).some(Boolean);

    const setFilter = (key, value) => {
        setFilters((f) => ({ ...f, [key]: value }));
        setPage(1);
    };
    const clearAll = () => {
        setFilters(EMPTY_FILTERS);
        setSearchInput('');
        setSearch('');
        setPage(1);
    };
    const onSort = (id) => {
        setSort((cur) => ({ sort: id, order: cur.sort === id && cur.order === 'desc' ? 'asc' : 'desc' }));
        setPage(1);
    };

    const cards = [
        { label: 'Total Users', value: s.totalUsers ?? 0, sub: 'with a paid plan', icon: Users, tone: 'bg-[#e6f2ff] text-[#001f3f]', onClick: clearAll },
        { label: 'Total Payments Received', value: rupees(s.totalPaymentsReceived), sub: `${s.paymentsCount ?? 0} successful payment${s.paymentsCount === 1 ? '' : 's'}`, icon: IndianRupee, tone: 'bg-indigo-50 text-indigo-700', onClick: () => { clearAll(); setFilter('paymentStatus', 'SUCCESS'); } },
        { label: 'Active Plans', value: s.activePlans ?? 0, sub: 'users with a running plan', icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700', onClick: () => setFilter('planStatus', 'ACTIVE') },
        { label: 'Expired Plans', value: s.expiredPlans ?? 0, sub: 'users with no running plan', icon: XCircle, tone: 'bg-red-50 text-red-600', onClick: () => setFilter('planStatus', 'EXPIRED') },
        { label: 'Upcoming Expirations', value: s.expiringSoon ?? 0, sub: `within ${s.expiringSoonDays ?? 7} days`, icon: AlarmClock, tone: 'bg-amber-50 text-amber-700', onClick: () => setFilter('planStatus', 'EXPIRING_SOON') },
    ];

    const from = pg.total ? (pg.page - 1) * pg.limit + 1 : 0;
    const to = Math.min(pg.page * pg.limit, pg.total);
    const pageNumbers = Array.from({ length: pg.pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pg.pages || Math.abs(n - pg.page) <= 1);

    return (
        <div className="space-y-6">
            <Helmet><title>Plan Payments | Admin</title></Helmet>
            <div className="flex flex-wrap items-end justify-between gap-3 animate-fadeInUp">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><BadgeIndianRupee size={22} className="text-[#001f3f]" /> Plan Payments</h1>
                    <p className="text-sm text-slate-500">Plans bought on the Pricing page — payments, plan periods and who is active, expiring or expired.</p>
                </div>
                <button type="button" onClick={refetch} disabled={isFetching} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60">
                    <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {isLoading ? (
                <AdminLoading label="Loading plan payments..." />
            ) : isError && !d ? (
                <AdminError error={error} onRetry={refetch} label="Failed to load plan payments." />
            ) : (
                <>
                    {/* Summary cards (click to filter) */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                        {cards.map((c, idx) => {
                            const Icon = c.icon;
                            return (
                                <button
                                    key={c.label}
                                    type="button"
                                    onClick={c.onClick}
                                    style={{ animationDelay: `${idx * 60}ms` }}
                                    className={`animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#001f3f]/20 hover:shadow-md ${idx === 0 ? 'col-span-2 sm:col-span-1' : ''}`}
                                >
                                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.tone}`}><Icon size={17} /></span>
                                    <p className="mt-3 text-xs font-semibold uppercase text-slate-400">{c.label}</p>
                                    <p className="mt-1 text-2xl font-extrabold text-slate-900">{c.value}</p>
                                    <p className="mt-0.5 text-xs text-slate-500">{c.sub}</p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Plan status tabs */}
                    <div className="-mx-1 flex gap-1 overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden">
                        <div className="flex w-fit shrink-0 gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                            {STATUS_TABS.map((t) => {
                                const n = t.id ? counts[t.id] ?? 0 : Object.values(counts).reduce((a, b) => a + b, 0);
                                return (
                                    <button
                                        key={t.id || 'all'}
                                        type="button"
                                        onClick={() => setFilter('planStatus', t.id)}
                                        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${filters.planStatus === t.id ? 'bg-[#001f3f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        {t.label} ({n})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Search + filters */}
                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                            <Search size={16} className="shrink-0 text-slate-400" />
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search name, shop, email, phone, invoice or payment ID..."
                                aria-label="Search plan payments"
                                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            />
                            {searchInput && <button type="button" onClick={() => setSearchInput('')} aria-label="Clear search" className="text-slate-400 hover:text-slate-700"><X size={15} /></button>}
                        </div>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
                            <select value={filters.paymentStatus} onChange={(e) => setFilter('paymentStatus', e.target.value)} aria-label="Payment status" className={selectClass}>
                                <option value="">All payments</option>
                                <option value="SUCCESS">Successful</option>
                                <option value="PENDING">Pending</option>
                                <option value="FAILED">Failed</option>
                                <option value="REFUNDED">Refunded</option>
                            </select>
                            <select value={filters.location} onChange={(e) => setFilter('location', e.target.value)} aria-label="Location" className={selectClass}>
                                <option value="">Urban & Rural</option>
                                <option value="URBAN">Urban</option>
                                <option value="RURAL">Rural</option>
                            </select>
                            <select value={filters.duration} onChange={(e) => setFilter('duration', e.target.value)} aria-label="Plan duration" className={selectClass}>
                                <option value="">All durations</option>
                                <option value="1">1 month</option>
                                <option value="3">3 months</option>
                                <option value="6">6 months</option>
                                <option value="12">12 months</option>
                            </select>
                            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">
                                From
                                <input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => setFilter('from', e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 focus:outline-none" />
                            </label>
                            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">
                                To
                                <input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => setFilter('to', e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 focus:outline-none" />
                            </label>
                            <button type="button" onClick={clearAll} disabled={!hasFilters} className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                                <X size={14} /> Clear filters
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    {rows.length === 0 ? (
                        <AdminEmpty
                            icon={CreditCard}
                            title={hasFilters ? 'No payments match these filters' : 'No plan payments yet'}
                            text={hasFilters ? 'Try other filters or clear them.' : 'Payments made on the Pricing page will appear here.'}
                        />
                    ) : (
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            {isFetching && (
                                <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs text-slate-500 shadow-sm">
                                    <Loader2 size={12} className="animate-spin" /> Updating
                                </div>
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1280px] text-left text-sm">
                                    <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <SortHeader id="name" label="User" {...sort} onSort={onSort} />
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3">Plan</th>
                                            <SortHeader id="amount" label="Amount" {...sort} onSort={onSort} />
                                            <SortHeader id="paidAt" label="Payment Date" {...sort} onSort={onSort} />
                                            <th className="px-4 py-3">Payment</th>
                                            <th className="px-4 py-3">Start</th>
                                            <SortHeader id="expiry" label="Expiry" {...sort} onSort={onSort} />
                                            <SortHeader id="remainingDays" label="Remaining" {...sort} onSort={onSort} />
                                            <th className="px-4 py-3">Plan / Account</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {rows.map((r) => {
                                            const st = PLAN_STATUS[r.planStatus] || PLAN_STATUS.NOT_ACTIVE;
                                            return (
                                                <tr
                                                    key={r.id}
                                                    onClick={() => setSelected(r)}
                                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSelected(r))}
                                                    tabIndex={0}
                                                    title="View details"
                                                    className={`cursor-pointer border-l-4 transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none ${st.bar} ${r.planStatus === 'EXPIRING_SOON' ? 'bg-amber-50/40' : ''}`}
                                                >
                                                    <td className="px-4 py-3.5">
                                                        <p className="max-w-[180px] truncate font-semibold text-slate-900">{r.name}</p>
                                                        <p className="max-w-[180px] truncate text-xs text-slate-500">{r.shopName}</p>
                                                    </td>
                                                    <td className="max-w-[200px] truncate px-4 py-3.5 text-slate-700">{r.email}</td>
                                                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">{r.phone}</td>
                                                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">{r.planName}</td>
                                                    <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900">{rupees(r.amount)}</td>
                                                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{day(r.paidAt)}</td>
                                                    <td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_BADGE[r.paymentStatus] || PAYMENT_BADGE.PENDING}`}>{r.paymentStatus}</span></td>
                                                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{day(r.planStart)}</td>
                                                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{day(r.planExpiry)}</td>
                                                    <td className="whitespace-nowrap px-4 py-3.5"><RemainingDays row={r} /></td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${st.badge}`}>{st.label}</span>
                                                        {r.renewed && <span className="ml-1 text-[11px] font-medium text-sky-700">Renewed</span>}
                                                        <p className={`mt-1 whitespace-nowrap text-xs font-medium ${ACCOUNT_BADGE[r.accountStatus?.code] || 'text-slate-500'}`}>{r.accountStatus?.label}</p>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span>Showing <strong className="text-slate-800">{from}–{to}</strong> of <strong className="text-slate-800">{pg.total}</strong></span>
                                    <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} aria-label="Rows per page" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm">
                                        {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button type="button" onClick={() => setPage(pg.page - 1)} disabled={pg.page <= 1} aria-label="Previous page" className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
                                    {pageNumbers.map((n, i) => (
                                        <span key={n} className="flex items-center">
                                            {i > 0 && n - pageNumbers[i - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
                                            <button
                                                type="button"
                                                onClick={() => setPage(n)}
                                                aria-current={n === pg.page ? 'page' : undefined}
                                                className={`min-w-8 rounded-lg px-2.5 py-1 text-sm font-semibold ${n === pg.page ? 'bg-[#001f3f] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                            >
                                                {n}
                                            </button>
                                        </span>
                                    ))}
                                    <button type="button" onClick={() => setPage(pg.page + 1)} disabled={pg.page >= pg.pages} aria-label="Next page" className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-slate-400">
                        A plan starts on its payment date. If a user renews before the plan ends, the new plan starts when the current one ends.
                        "Expiring soon" means {s.expiringSoonDays ?? 7} days or less left with no renewal.
                    </p>
                </>
            )}

            {selected && <DetailsModal row={selected} onClose={() => setSelected(null)} />}
        </div>
    );
};