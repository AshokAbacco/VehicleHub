// VehicleHub/VehicleHub/src/components/admin/SellersPage.jsx
// Approved sellers + seller registrations waiting for review (real data).
// Approve -> the applicant's account becomes SELLER (individual application, one vehicle) or
//            DEALER (dealer application, shop with many vehicles) and that dashboard opens.
// Reject  -> they stay a buyer, see the reason, and can correct and re-apply.
import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Search, ShieldCheck, UserCircle2, Clock, Eye, XCircle } from 'lucide-react';
import { useGetAdminSellersQuery, useApproveSellerMutation, useRejectSellerMutation } from '../../services/adminApiSlice.js';
import { SellerDetailModal } from '../../components/admin/SellerDetailModal.jsx';
import { SellerVerificationModal } from '../../components/admin/SellerVerificationModal.jsx';
import { AdminLoading, AdminError, AdminEmpty } from './AdminState.jsx';
import { formatINR } from '../../utils/formatCurrency.js';

const TABS = [
    { id: 'APPROVED', label: 'Active' },
    { id: 'PENDING', label: 'Pending Verification' },
    { id: 'REJECTED', label: 'Rejected' },
];

const TYPES = [
    { id: 'ALL', label: 'All' },
    { id: 'Seller', label: 'Sellers' },
    { id: 'Dealer', label: 'Dealers' },
];

const TypeBadge = ({ type }) => (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${type === 'Dealer' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
        {type === 'Dealer' ? 'DEALER' : 'SELLER'}
    </span>
);

const submittedLabel = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export const SellersPage = () => {
    const [tab, setTab] = useState('APPROVED');
    const [search, setSearch] = useState('');
    const [type, setType] = useState('ALL');
    const [selected, setSelected] = useState(null);
    const [reviewing, setReviewing] = useState(null);

    const { data, isLoading, isError, error, refetch } = useGetAdminSellersQuery({ status: 'ALL' }, { pollingInterval: 30000 });
    const [approveSeller] = useApproveSellerMutation();
    const [rejectSeller] = useRejectSellerMutation();
    const all = useMemo(() => data?.data?.sellers || [], [data]);
    // Seller (individual) vs Dealer (shop) — counts follow the type filter
    const ofType = useMemo(() => all.filter((s) => type === 'ALL' || s.accountType === type), [all, type]);
    const counts = useMemo(() => ofType.reduce((acc, s) => ({ ...acc, [s.verificationStatus]: (acc[s.verificationStatus] || 0) + 1 }), {}), [ofType]);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return ofType
            .filter((s) => s.verificationStatus === tab)
            .filter((s) => !q || [s.name, s.ownerName, s.businessName, s.email, s.phone].filter(Boolean).some((f) => String(f).toLowerCase().includes(q)));
    }, [ofType, tab, search]);

    const handleApprove = async (seller) => {
        try {
            const res = await approveSeller(seller.id).unwrap();
            const asDealer = res?.data?.role === 'DEALER';
            toast.success(`${seller.businessName || seller.ownerName} approved as a ${asDealer ? 'Dealer' : 'Seller'} — the ${asDealer ? 'dealer' : 'seller'} dashboard is now open to them`);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to approve seller');
        }
    };

    const handleReject = async (seller, reason) => {
        try {
            await rejectSeller({ id: seller.id, reason }).unwrap();
            toast.success('Application rejected — the applicant has been notified');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to reject application');
        }
    };

    return (
        <div className="space-y-6">
            <Helmet><title>Sellers | Admin</title></Helmet>

            <div className="animate-fadeInUp flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><UserCircle2 size={22} className="text-[#001f3f]" /> Sellers</h1>
                    <p className="text-sm text-slate-500">Sellers (individuals, one vehicle) and Dealers (shops, many vehicles), plus new registrations to review.</p>
                </div>
                {counts.PENDING > 0 && (
                    <button onClick={() => setTab('PENDING')} className="flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700">
                        <Clock size={13} /> {counts.PENDING} pending verification
                    </button>
                )}
            </div>

            {/* Tabs + account type */}
            <div className="animate-fadeInUp -mx-1 flex flex-wrap gap-2 overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden">
                <div className="flex w-fit shrink-0 gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t.id ? 'bg-[#001f3f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            {t.label} ({counts[t.id] || 0})
                        </button>
                    ))}
                </div>
                <div className="flex w-fit shrink-0 gap-1 rounded-full border border-slate-200 bg-white p-1">
                    {TYPES.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setType(t.id)}
                            className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition ${type === t.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="animate-fadeInUp flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <Search size={16} className="shrink-0 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, business, email or phone..." className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
            </div>

            {isLoading ? (
                <AdminLoading label="Loading sellers..." />
            ) : isError ? (
                <AdminError error={error} onRetry={refetch} label="Failed to load sellers." />
            ) : visible.length === 0 ? (
                <AdminEmpty
                    icon={UserCircle2}
                    title={search ? 'No sellers match your search' : tab === 'PENDING' ? 'No pending registrations' : tab === 'REJECTED' ? 'No rejected applications' : type === 'Dealer' ? 'No approved dealers yet' : type === 'Seller' ? 'No approved sellers yet' : 'No approved sellers or dealers yet'}
                />
            ) : tab === 'APPROVED' ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((s, idx) => (
                        <button
                            key={s.id}
                            onClick={() => setSelected(s)}
                            style={{ animationDelay: `${idx * 60}ms` }}
                            className="animate-fadeInUp group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#001f3f] hover:shadow-xl hover:shadow-[#001f3f]/10"
                        >
                            <span className="absolute inset-x-0 top-0 h-[3px] w-full overflow-hidden">
                                <span className="block h-full w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
                            </span>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#001f3f] to-[#003366] text-base font-bold text-white">{s.name?.[0]?.toUpperCase()}</div>
                                    <div className="min-w-0">
                                        <p className="flex items-center gap-1 truncate font-semibold text-slate-900">{s.name} {s.verified && <ShieldCheck size={13} className="shrink-0 text-[#001f3f]" />} <TypeBadge type={s.accountType} /></p>
                                        <p className="truncate text-xs text-slate-400">{s.type}{s.businessName && s.ownerName ? ` · ${s.ownerName}` : ''}</p>
                                    </div>
                                </div>
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{s.isActive ? s.status : 'Inactive'}</span>
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-sm">
                                <div><p className="font-bold text-slate-900">{s.listings}</p><p className="text-[11px] text-slate-400">Listings</p></div>
                                <div><p className="font-bold text-slate-900">{s.soldCount}</p><p className="text-[11px] text-slate-400">Sold · {formatINR(s.revenue)}</p></div>
                                <div><p className="font-bold text-slate-900">{s.joined}</p><p className="text-[11px] text-slate-400">Joined</p></div>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="animate-fadeInUp divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {visible.map((s) => (
                        <div key={s.id} className="flex flex-col gap-3 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold ${tab === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                    {(s.businessName || s.ownerName || '?')[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="flex items-center gap-1.5 truncate font-semibold text-slate-900">{s.businessName || s.ownerName} <TypeBadge type={s.accountType} /></p>
                                    <p className="truncate text-xs text-slate-500">{s.ownerName} · {s.accountType === 'Dealer' ? 'Dealer application' : 'Seller application'} · {s.email} · {submittedLabel(s.submittedAt)}</p>
                                    {tab === 'PENDING' ? (
                                        <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">PENDING VERIFICATION</span>
                                    ) : (
                                        <p className="mt-1 flex items-start gap-1 text-xs text-red-600"><XCircle size={12} className="mt-0.5 shrink-0" /> {s.rejectReason || 'Rejected'}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setReviewing(s)}
                                className="flex shrink-0 items-center gap-1.5 self-start rounded-full bg-[#001f3f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#002a55] sm:self-auto"
                            >
                                <Eye size={13} /> {tab === 'PENDING' ? 'Review Application' : 'View Application'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {selected && <SellerDetailModal seller={selected} onClose={() => setSelected(null)} />}
            {reviewing && (
                <SellerVerificationModal
                    seller={reviewing}
                    onClose={() => setReviewing(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    readOnly={reviewing.verificationStatus !== 'PENDING'}
                />
            )}
        </div>
    );
};