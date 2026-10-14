import { useEffect, useRef, useMemo } from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { allVehicles } from '../../data/adminMockData.js';

export const SellerDetailModal = ({ seller, onClose }) => {
    const ref = useRef(null);
    useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [onClose]);

    const sellerVehicles = useMemo(() => allVehicles.filter((v) => v.sellerId === seller.id), [seller.id]);
    const live = sellerVehicles.filter((v) => v.status === 'live');
    const sold = sellerVehicles.filter((v) => v.status === 'sold');
    const rejected = sellerVehicles.filter((v) => v.status === 'rejected');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div ref={ref} className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#001f3f] to-[#003366] text-base font-bold text-white">{seller.name[0]}</div>
                        <div>
                            <p className="flex items-center gap-1.5 text-lg font-bold text-slate-900">{seller.name} {seller.verified && <ShieldCheck size={15} className="text-[#001f3f]" />}</p>
                            <p className="text-xs text-slate-400">{seller.type} · Joined {seller.joined}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl bg-[#e6f2ff] p-3 text-center"><p className="text-xl font-extrabold text-[#001f3f]">{sellerVehicles.length}</p><p className="text-[11px] text-slate-500">Total Posted</p></div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-center"><p className="text-xl font-extrabold text-emerald-600">{live.length}</p><p className="text-[11px] text-slate-500">Live</p></div>
                        <div className="rounded-xl bg-violet-50 p-3 text-center"><p className="text-xl font-extrabold text-violet-600">{sold.length}</p><p className="text-[11px] text-slate-500">Sold</p></div>
                        <div className="rounded-xl bg-red-50 p-3 text-center"><p className="text-xl font-extrabold text-red-600">{rejected.length}</p><p className="text-[11px] text-slate-500">Rejected</p></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <p className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400">Email:</span> <span className="font-semibold text-slate-800">{seller.email}</span></p>
                        <p className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400">Phone:</span> <span className="font-semibold text-slate-800">{seller.phone}</span></p>
                    </div>

                    {live.length > 0 && (
                        <div>
                            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900"><CheckCircle2 size={14} className="text-emerald-600" /> Live listings</h3>
                            {live.map((v) => (
                                <div key={v.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                                    <span>{v.thumb} {v.title}</span><span className="font-semibold text-slate-700">₹{(v.price / 100000).toFixed(2)}L</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {sold.length > 0 && (
                        <div>
                            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900"><TrendingUp size={14} className="text-violet-600" /> Sold vehicles</h3>
                            {sold.map((v) => (
                                <div key={v.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                                    <span>{v.thumb} {v.title}</span><span className="text-slate-500">Sold to {v.soldTo} on {v.soldOn}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {rejected.length > 0 && (
                        <div>
                            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900"><XCircle size={14} className="text-red-600" /> Rejected listings</h3>
                            {rejected.map((v) => (
                                <div key={v.id} className="rounded-lg bg-red-50 px-3 py-2 text-sm">
                                    <p className="font-medium text-slate-800">{v.thumb} {v.title}</p>
                                    <p className="text-xs text-red-600">Reason: {v.rejectedReason}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {sellerVehicles.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No listings from this seller yet.</p>}
                </div>
            </div>
        </div>
    );
};