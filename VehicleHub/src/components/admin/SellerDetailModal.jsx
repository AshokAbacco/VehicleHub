// VehicleHub/VehicleHub/src/components/admin/SellerDetailModal.jsx
// Approved seller details + their real listings (GET /api/admin/sellers/:id).
import { useEffect, useRef } from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { useGetSellerRegistrationDetailQuery } from '../../services/adminApiSlice.js';
import { formatINR } from '../../utils/formatCurrency.js';

export const SellerDetailModal = ({ seller, onClose }) => {
    const ref = useRef(null);
    useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [onClose]);

    const { data, isLoading, isError } = useGetSellerRegistrationDetailQuery(seller.id);
    const detail = data?.seller || seller;
    const sellerVehicles = data?.seller?.vehicles || [];
    const live = sellerVehicles.filter((v) => v.status === 'live');
    const pending = sellerVehicles.filter((v) => v.status === 'pending');
    const sold = sellerVehicles.filter((v) => v.status === 'sold');
    const rejected = sellerVehicles.filter((v) => v.status === 'rejected');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div ref={ref} className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#001f3f] to-[#003366] text-base font-bold text-white">{detail.name?.[0]?.toUpperCase()}</div>
                        <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate text-lg font-bold text-slate-900">{detail.name} {detail.verified && <ShieldCheck size={15} className="shrink-0 text-[#001f3f]" />}</p>
                            <p className="truncate text-xs text-slate-400">{detail.type} · {detail.ownerName} · Joined {detail.joined}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={18} /></button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl bg-[#e6f2ff] p-3 text-center"><p className="text-xl font-extrabold text-[#001f3f]">{isLoading ? '—' : sellerVehicles.length}</p><p className="text-[11px] text-slate-500">Total Posted</p></div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-center"><p className="text-xl font-extrabold text-emerald-600">{isLoading ? '—' : live.length}</p><p className="text-[11px] text-slate-500">Live</p></div>
                        <div className="rounded-xl bg-violet-50 p-3 text-center"><p className="text-xl font-extrabold text-violet-600">{isLoading ? '—' : sold.length}</p><p className="text-[11px] text-slate-500">Sold</p></div>
                        <div className="rounded-xl bg-red-50 p-3 text-center"><p className="text-xl font-extrabold text-red-600">{isLoading ? '—' : rejected.length}</p><p className="text-[11px] text-slate-500">Rejected</p></div>
                    </div>

                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                        <p className="truncate rounded-xl bg-slate-50 p-3"><span className="text-slate-400">Email:</span> <span className="font-semibold text-slate-800">{detail.email}</span></p>
                        <p className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400">Phone:</span> <span className="font-semibold text-slate-800">{detail.phone || '—'}</span></p>
                        <p className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400">Location:</span> <span className="font-semibold text-slate-800">{[detail.city, detail.state].filter(Boolean).join(', ') || '—'}</span></p>
                        <p className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400">Sales value:</span> <span className="font-semibold text-slate-800">{formatINR(detail.revenue)}</span></p>
                    </div>

                    {isLoading && <div className="flex h-24 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-[#001f3f]" /></div>}
                    {isError && <p className="text-center text-sm text-red-500">Failed to load this seller's listings.</p>}

                    {live.length > 0 && (
                        <div>
                            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900"><CheckCircle2 size={14} className="text-emerald-600" /> Live listings</h3>
                            <div className="space-y-1.5">
                                {live.map((v) => (
                                    <div key={v.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                                        <span className="truncate">{v.thumb} {v.title}</span><span className="shrink-0 font-semibold text-slate-700">{formatINR(v.price)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {pending.length > 0 && (
                        <div>
                            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900"><Clock size={14} className="text-amber-600" /> Waiting for approval</h3>
                            <div className="space-y-1.5">
                                {pending.map((v) => (
                                    <div key={v.id} className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2 text-sm">
                                        <span className="truncate">{v.thumb} {v.title}</span><span className="shrink-0 text-slate-500">Posted {v.postedOn}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {sold.length > 0 && (
                        <div>
                            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900"><TrendingUp size={14} className="text-violet-600" /> Sold vehicles</h3>
                            <div className="space-y-1.5">
                                {sold.map((v) => (
                                    <div key={v.id} className="flex flex-col gap-0.5 rounded-lg bg-slate-50 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                                        <span className="truncate">{v.thumb} {v.title}</span>
                                        <span className="shrink-0 text-slate-500">{v.soldTo ? `Sold to ${v.soldTo}` : 'Sold'}{v.soldOn ? ` on ${v.soldOn}` : ''} · {formatINR(v.soldPrice || v.price)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {rejected.length > 0 && (
                        <div>
                            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900"><XCircle size={14} className="text-red-600" /> Rejected listings</h3>
                            <div className="space-y-1.5">
                                {rejected.map((v) => (
                                    <div key={v.id} className="rounded-lg bg-red-50 px-3 py-2 text-sm">
                                        <p className="font-medium text-slate-800">{v.thumb} {v.title}</p>
                                        <p className="text-xs text-red-600">Reason: {v.rejectedReason || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {!isLoading && sellerVehicles.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No listings from this seller yet.</p>}
                </div>
            </div>
        </div>
    );
};