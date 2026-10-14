import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Heart, ArrowUpRight, Clock } from 'lucide-react';
import { cartActivity, buyers } from '../../data/adminMockData.js';
import { BuyerDetailModal } from '../../components/admin/BuyerDetailModal.jsx';

export const CartsPage = () => {
    const [viewing, setViewing] = useState(null);
    const cartCount = cartActivity.filter((c) => c.type === 'Cart').length;
    const wishlistCount = cartActivity.filter((c) => c.type === 'Wishlist').length;

    return (
        <div className="space-y-6">
            <Helmet><title>Carts & Wishlist | Admin</title></Helmet>

            <div className="animate-fadeInUp">
                <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
                    <ShoppingCart size={22} className="text-[#001f3f]" /> Carts & Wishlist
                </h1>
                <p className="text-sm text-slate-500">Live buyer intent — click any entry to see full buyer activity.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" style={{ animationDelay: '60ms' }}>
                    <div className="flex items-center gap-2 text-[#001f3f]"><ShoppingCart size={16} /><p className="text-xs font-semibold uppercase text-slate-400">In Cart</p></div>
                    <p className="mt-1.5 text-2xl font-extrabold text-slate-900">{cartCount}</p>
                </div>
                <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" style={{ animationDelay: '120ms' }}>
                    <div className="flex items-center gap-2 text-red-500"><Heart size={16} /><p className="text-xs font-semibold uppercase text-slate-400">Wishlisted</p></div>
                    <p className="mt-1.5 text-2xl font-extrabold text-slate-900">{wishlistCount}</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cartActivity.map((c, idx) => (
                    <button
                        key={c.id}
                        onClick={() => { const b = buyers.find((x) => x.id === c.buyerId); if (b) setViewing(b); }}
                        style={{ animationDelay: `${180 + idx * 70}ms` }}
                        className="animate-fadeInUp group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#001f3f] hover:shadow-xl hover:shadow-[#001f3f]/10"
                    >
                        <span className="absolute inset-x-0 top-0 h-[3px] w-full overflow-hidden">
                            <span className={`block h-full w-1/2 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%] ${c.type === 'Cart' ? 'via-[#001f3f]' : 'via-red-400'}`} />
                        </span>

                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${c.type === 'Cart' ? 'bg-[#e6f2ff] text-[#001f3f]' : 'bg-red-50 text-red-500'}`}>
                                    {c.type === 'Cart' ? <ShoppingCart size={18} /> : <Heart size={18} />}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{c.buyer}</p>
                                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${c.type === 'Cart' ? 'bg-[#e6f2ff] text-[#001f3f]' : 'bg-red-50 text-red-600'}`}>
                                        {c.type}
                                    </span>
                                </div>
                            </div>
                            <ArrowUpRight size={16} className="shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#001f3f]" />
                        </div>

                        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
                            <p className="font-semibold text-slate-800">{c.vehicle}</p>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={11} /> {c.addedAt}</span>
                                <span className="font-bold text-slate-900">₹{(c.value / 100000).toFixed(1)}L</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {viewing && <BuyerDetailModal buyer={viewing} onClose={() => setViewing(null)} />}
        </div>
    );
};