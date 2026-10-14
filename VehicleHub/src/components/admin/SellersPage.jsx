import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, ShieldCheck, UserCircle2, Clock, Eye } from 'lucide-react';
import { sellers, allVehicles, pushSellerNotification } from '../../data/adminMockData.js';
import { pendingSellerRegistrations, removePendingSellerRegistration } from '../../data/adminSellerVerification.js';
import { SellerDetailModal } from '../../components/admin/SellerDetailModal.jsx';
import { SellerVerificationModal } from '../../components/admin/SellerVerificationModal.jsx';

export const SellersPage = () => {
    const [tab, setTab] = useState('active'); // 'active' | 'pending'
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [reviewing, setReviewing] = useState(null);
    const [pendingList, setPendingList] = useState(pendingSellerRegistrations);

    const filteredActive = useMemo(
        () => sellers.filter((s) => [s.name, s.email].some((f) => f.toLowerCase().includes(search.trim().toLowerCase()))),
        [search]
    );
    const filteredPending = useMemo(
        () => pendingList.filter((s) => [s.ownerName, s.businessName, s.email].filter(Boolean).some((f) => f.toLowerCase().includes(search.trim().toLowerCase()))),
        [pendingList, search]
    );

    const handleApprove = (seller) => {
        setPendingList((prev) => prev.filter((s) => s.id !== seller.id));
        removePendingSellerRegistration(seller.id);
        pushSellerNotification({
            sellerId: seller.userId,
            type: 'approved',
            title: 'Seller account approved',
            description: `Your seller registration for "${seller.businessName || seller.ownerName}" has been approved. You can now list vehicles.`,
        });
        // In production: add this seller into the real `sellers` list via API/state update here
    };

    const handleReject = (seller, reason) => {
        setPendingList((prev) => prev.filter((s) => s.id !== seller.id));
        removePendingSellerRegistration(seller.id);
        pushSellerNotification({
            sellerId: seller.userId,
            type: 'rejected',
            title: 'Seller registration rejected',
            description: `Your seller registration was rejected. Reason: ${reason}`,
            reason,
        });
    };

    return (
        <div className="space-y-6">
            <Helmet><title>Sellers | Admin</title></Helmet>

            <div className="animate-fadeInUp flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><UserCircle2 size={22} className="text-[#001f3f]" /> Sellers</h1>
                    <p className="text-sm text-slate-500">All registered dealers and individual sellers.</p>
                </div>
                {filteredPending.length > 0 && (
                    <span className="flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700">
                        <Clock size={13} /> {filteredPending.length} pending verification
                    </span>
                )}
            </div>

            {/* Tabs */}
            <div className="animate-fadeInUp flex gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 w-fit">
                <button
                    onClick={() => setTab('active')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === 'active' ? 'bg-[#001f3f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Active Sellers ({sellers.length})
                </button>
                <button
                    onClick={() => setTab('pending')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === 'pending' ? 'bg-[#001f3f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Pending Verification ({pendingList.length})
                </button>
            </div>

            <div className="animate-fadeInUp flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <Search size={16} className="text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sellers..." className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
            </div>

            {tab === 'active' ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredActive.map((s, idx) => {
                        const count = allVehicles.filter((v) => v.sellerId === s.id).length;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setSelected(s)}
                                style={{ animationDelay: `${idx * 60}ms` }}
                                className="animate-fadeInUp group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#001f3f] hover:shadow-xl hover:shadow-[#001f3f]/10"
                            >
                                <span className="absolute inset-x-0 top-0 h-[3px] w-full overflow-hidden">
                                    <span className="block h-full w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
                                </span>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#001f3f] to-[#003366] text-base font-bold text-white">{s.name[0]}</div>
                                        <div>
                                            <p className="flex items-center gap-1 font-semibold text-slate-900">{s.name} {s.verified && <ShieldCheck size={13} className="text-[#001f3f]" />}</p>
                                            <p className="text-xs text-slate-400">{s.type}</p>
                                        </div>
                                    </div>
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">{s.status}</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                                    <div><p className="font-bold text-slate-900">{count}</p><p className="text-[11px] text-slate-400">Listings</p></div>
                                    <div><p className="font-bold text-slate-900">{s.joined}</p><p className="text-[11px] text-slate-400">Joined</p></div>
                                </div>
                            </button>
                        );
                    })}
                    {filteredActive.length === 0 && <p className="col-span-full py-10 text-center text-sm text-slate-400">No sellers match your search.</p>}
                </div>
            ) : (
                <div className="animate-fadeInUp divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {filteredPending.length === 0 ? (
                        <p className="p-10 text-center text-sm text-slate-400">No pending seller registrations.</p>
                    ) : (
                        filteredPending.map((s) => (
                            <div key={s.id} className="flex flex-col gap-3 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-base font-bold text-amber-700">
                                        {(s.businessName || s.ownerName || '?')[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900">{s.businessName || s.ownerName}</p>
                                        <p className="text-xs text-slate-500">{s.ownerName} · {s.sellerType} · {s.email} · {s.submittedAt}</p>
                                        <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">PENDING VERIFICATION</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setReviewing(s)}
                                    className="flex shrink-0 items-center gap-1.5 self-start rounded-full bg-[#001f3f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#002a55] sm:self-auto"
                                >
                                    <Eye size={13} /> Review Application
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {selected && <SellerDetailModal seller={selected} onClose={() => setSelected(null)} />}
            {reviewing && (
                <SellerVerificationModal
                    seller={reviewing}
                    onClose={() => setReviewing(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    );
};