// VehicleHub/VehicleHub/src/pages/dashboard/BuyerDashboardPage.jsx
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
    Heart, MessageSquare, ShoppingBag, Eye,
    LayoutDashboard, ArrowRight, Loader2, Search, ShieldCheck,
} from 'lucide-react';
import {
    useGetBuyerStatsQuery, useGetWishlistQuery, useGetMyPurchaseRequestsQuery, useGetMyInquiriesQuery,
} from '../../services/buyerApiSlice.js';
import { formatCurrency } from '../../utils/formatters.js';

// 8 stat cards, 4 per row — matches the Field Inspector dashboard layout exactly
const statCardConfig = [
    { key: 'wishlistCount', label: 'Wishlist', desc: 'Vehicles you have saved', icon: Heart, bg: 'bg-red-50', color: 'text-red-500', to: '/buyer/dashboard/wishlist' },
    { key: 'inquiriesCount', label: 'My Inquiries', desc: 'Sellers you have contacted', icon: MessageSquare, bg: 'bg-[#e6f2ff]', color: 'text-[#001f3f]', to: '/buyer/dashboard/inquiries' },
    { key: 'interestedCount', label: 'Interested', desc: 'Inquiries awaiting reply', icon: Eye, bg: 'bg-amber-50', color: 'text-amber-600', to: '/buyer/dashboard/inquiries' },
    { key: 'purchasedCount', label: 'Purchased', desc: 'Vehicles you bought', icon: ShoppingBag, bg: 'bg-emerald-50', color: 'text-emerald-600', to: '/buyer/dashboard/orders' },
];

const statusBadge = {
    INTERESTED: 'bg-amber-50 text-amber-700',
    PURCHASED: 'bg-emerald-50 text-emerald-700',
    LOST_INTEREST: 'bg-slate-100 text-slate-500',
};
const statusDot = {
    INTERESTED: 'bg-amber-500',
    PURCHASED: 'bg-emerald-500',
    LOST_INTEREST: 'bg-slate-400',
};

export const BuyerDashboardPage = () => {
    const navigate = useNavigate();
    const { data: statsData, isLoading: statsLoading } = useGetBuyerStatsQuery();
    const { data: wishlistData, isLoading: wishlistLoading } = useGetWishlistQuery();
    const { data: purchaseRequestsData, isLoading: purchaseRequestsLoading } = useGetMyPurchaseRequestsQuery();
    const { data: inquiriesData, isLoading: inqLoading } = useGetMyInquiriesQuery();

    const stats = statsData?.data || {};
    const wishlist = (wishlistData?.data || []).slice(0, 4);
    const purchaseRequests = (purchaseRequestsData?.data || []).slice(0, 4);
    const inquiries = (inquiriesData?.data || []).slice(0, 6);

    // Derive an "interested" count from raw inquiries so we don't need a new backend field
    const interestedCount = (inquiriesData?.data || []).filter((i) => i.status === 'INTERESTED').length;
    const statsWithDerived = { ...stats, interestedCount };

    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>Dashboard | VehicleHub Buyer</title></Helmet>

            {/* Gradient hero header */}
            <div className="animate-fadeInUp relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001f3f] via-[#002a55] to-[#003d7a] p-6 shadow-lg shadow-[#001f3f]/20 sm:p-7">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-white/5" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                            <LayoutDashboard size={13} /> {greeting}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Buyer Dashboard</h1>
                        <p className="mt-1 text-sm text-white/70">Manage your saved vehicles and inquiries.</p>
                    </div>
                    <button
                        onClick={() => navigate('/search')}
                        className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
                    >
                        <Search size={16} />
                        <span className="text-sm font-semibold">Browse vehicles</span>
                    </button>
                </div>
            </div>

            {/* Stat cards — 4-column grid, shimmer-on-hover, matching Field Inspector exactly */}
            {statsLoading ? (
                <div className="flex h-24 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                    {statCardConfig.map((cfg, idx) => {
                        const Icon = cfg.icon;
                        return (
                            <button
                                key={cfg.key}
                                onClick={() => navigate(cfg.to)}
                                style={{ animationDelay: `${idx * 60}ms` }}
                                className="group relative min-w-0 animate-fadeInUp opacity-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#001f3f]/30 hover:shadow-lg sm:p-5"
                            >
                                <span className="absolute inset-x-0 top-0 h-[3px] w-full overflow-hidden">
                                    <span className="block h-full w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-[#001f3f] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
                                </span>
                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg} ${cfg.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                    <Icon size={18} />
                                </span>
                                <p className="mt-3 text-2xl font-extrabold text-slate-900 transition-transform duration-300 group-hover:translate-x-0.5 sm:mt-4">{statsWithDerived[cfg.key] ?? 0}</p>
                                <p className="mt-0.5 text-xs font-semibold text-slate-700 sm:text-sm">{cfg.label}</p>
                                <p className="mt-0.5 truncate text-[11px] text-slate-400">{cfg.desc}</p>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                {/* Recent Inquiries */}
                <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5 sm:p-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Recent Inquiries</h2>
                            <p className="text-sm text-slate-500">Sellers you've recently contacted.</p>
                        </div>
                        {purchaseRequests.length > 0 && (
                            <span className="rounded-full bg-[#e6f2ff] px-3 py-1 text-xs font-bold text-[#001f3f]">{purchaseRequests.length}</span>
                        )}
                    </div>

                    <div className="p-5 sm:p-6">
                        {inqLoading ? (
                            <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                        ) : purchaseRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
                                <MessageSquare size={22} />
                                <p className="text-sm font-medium">No purchase requests yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {purchaseRequests.map((req, idx) => (
                                    <Link
                                        key={req.id}
                                        to={`/vehicle/${req.vehicleListingId}`}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                        className="animate-fadeInUp opacity-0 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#001f3f]/20 hover:bg-white hover:shadow-sm"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">{req.vehicleListing?.title}</p>
                                            <p className="text-xs text-slate-500">{formatCurrency(req.vehicleListing?.price)}</p>
                                        </div>
                                        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge[req.status] || 'bg-slate-100 text-slate-600'}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${statusDot[req.status] || 'bg-slate-400'}`} />
                                            {req.status.replace('_', ' ')}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Wishlist preview */}
                <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5 sm:p-6">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                                <ShieldCheck size={17} className="text-[#001f3f]" /> Wishlist
                            </h2>
                            <p className="text-sm text-slate-500">Saved for later.</p>
                        </div>
                        <Link to="/buyer/dashboard/wishlist" className="flex items-center gap-1 text-xs font-semibold text-[#001f3f] hover:underline">
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="p-5 sm:p-6">
                        {wishlistLoading ? (
                            <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                        ) : wishlist.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
                                <Heart size={22} />
                                <p className="text-sm font-medium">Your wishlist is empty.</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {wishlist.map((w, idx) => (
                                    <Link
                                        key={w.id}
                                        to={`/vehicle/${w.vehicleListingId}`}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                        className="animate-fadeInUp opacity-0 group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#001f3f]/20 hover:bg-white hover:shadow-sm"
                                    >
                                        {w.vehicleListing?.images?.[0] ? (
                                            <img src={w.vehicleListing.images[0]} className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 object-cover" alt="" />
                                        ) : (
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ff] text-lg">🚘</span>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">{w.vehicleListing?.title}</p>
                                            <p className="text-xs font-bold text-[#001f3f]">{formatCurrency(w.vehicleListing?.price)}</p>
                                        </div>
                                        <Eye size={14} className="shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#001f3f]" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};