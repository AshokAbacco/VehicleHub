import { useEffect, useRef } from 'react';
import { X, ShoppingBag, Heart, Clock } from 'lucide-react';

export const BuyerDetailModal = ({ buyer, onClose }) => {
    const ref = useRef(null);
    useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div ref={ref} className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{buyer.name}</h2>
                        <p className="text-xs text-slate-400">{buyer.email} · {buyer.phone} · Joined {buyer.joined}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-emerald-50 p-3 text-center"><p className="text-xl font-extrabold text-emerald-600">{buyer.purchases.length}</p><p className="text-[11px] text-slate-500">Purchases</p></div>
                        <div className="rounded-xl bg-red-50 p-3 text-center"><p className="text-xl font-extrabold text-red-500">{buyer.wishlist.length}</p><p className="text-[11px] text-slate-500">Wishlist</p></div>
                        <div className="rounded-xl bg-amber-50 p-3 text-center"><p className="text-xl font-extrabold text-amber-600">{buyer.pending.length}</p><p className="text-[11px] text-slate-500">Pending</p></div>
                    </div>

                    <div>
                        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900"><ShoppingBag size={14} className="text-emerald-600" /> Purchase History</h3>
                        {buyer.purchases.length === 0 ? <p className="text-sm text-slate-400">No purchases yet.</p> : (
                            <div className="space-y-2">
                                {buyer.purchases.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                                        <div><p className="font-semibold text-slate-900">{p.vehicle}</p><p className="text-xs text-slate-400">From {p.seller} · {p.date}</p></div>
                                        <p className="font-bold text-slate-900">₹{(p.amount / 100000).toFixed(2)}L</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900"><Clock size={14} className="text-amber-600" /> Pending / In-progress</h3>
                        {buyer.pending.length === 0 ? <p className="text-sm text-slate-400">Nothing pending.</p> : (
                            <div className="space-y-2">
                                {buyer.pending.map((p, i) => (
                                    <div key={i} className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm">
                                        <p className="font-semibold text-slate-900">{p.vehicle}</p>
                                        <p className="text-xs text-amber-700">{p.seller} · {p.status}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-900"><Heart size={14} className="text-red-500" /> Wishlist ({buyer.wishlist.length})</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {buyer.wishlist.map((w) => <span key={w} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{w}</span>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};