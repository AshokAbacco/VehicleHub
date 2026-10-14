import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    ChevronRight, TrendingUp, TrendingDown, LayoutGrid, CheckSquare,
    UserCircle2, Users, IndianRupee, XCircle, ShoppingCart, ArrowUpRight,
} from 'lucide-react';
import { adminStats, revenueSummary, pendingVehicles, cartActivity } from '../../data/adminMockData.js';
import { RevenueOverviewCard } from '../../components/admin/RevenueOverviewCard.jsx';

const statIconMap = [
    { match: /total vehicle/i, icon: LayoutGrid, bg: 'bg-[#e6f2ff]', color: 'text-[#001f3f]' },
    { match: /pending/i, icon: CheckSquare, bg: 'bg-amber-50', color: 'text-amber-600' },
    { match: /active seller/i, icon: UserCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { match: /buyer/i, icon: Users, bg: 'bg-violet-50', color: 'text-violet-600' },
    { match: /revenue/i, icon: IndianRupee, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { match: /rejected/i, icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' },
];
const getStatIcon = (title) => statIconMap.find((e) => e.match.test(title)) || statIconMap[0];

<RevenueOverviewCard revenueSummary={revenueSummary} />

const hour = new Date().getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

export const AdminDashboardPage = () => {
    const maxRevenue = Math.max(...revenueSummary.monthlyBreakdown.map((m) => m.revenue));

    return (
        <div className="space-y-6">
            <Helmet><title>Admin Dashboard | VehicleHub</title></Helmet>

            <div className="animate-fadeInUp flex items-center gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-[#001f3f] to-[#1b79d6] p-5 text-white shadow-lg sm:p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-xl font-bold">A</div>
                <div>
                    <p className="text-sm text-white/70">{greeting}, Admin 👋</p>
                    <h1 className="text-xl font-extrabold sm:text-2xl">Here's what's happening on VehicleHub today</h1>
                </div>
            </div>

            {/* Stats grid with stagger animation */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
                {adminStats.map((s, idx) => {
                    const { icon: Icon, bg, color } = getStatIcon(s.title);
                    return (
                        <div
                            key={s.title}
                            style={{ animationDelay: `${idx * 60}ms` }}
                            className="group animate-fadeInUp relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#001f3f]/20 hover:shadow-lg"
                        >
                            <span className="absolute inset-x-0 top-0 h-[3px] w-full overflow-hidden">
                                <span className="block h-full w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-[#001f3f] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
                            </span>
                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${color} transition-transform duration-300 group-hover:scale-110`}>
                                <Icon size={17} />
                            </div>
                            <p className="mt-3 text-2xl font-extrabold text-slate-900">{s.value}</p>
                            <p className="mt-0.5 text-xs font-semibold text-slate-700">{s.title}</p>
                            <p className="text-[11px] text-slate-400">{s.subtitle}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
                {/* Revenue chart — fixed: explicit pixel height on the bar container so percentage
                    heights on children actually have something to compute against */}
                <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '150ms' }}>
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Revenue Overview</p>
                            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">₹{(revenueSummary.totalRevenue / 100000).toFixed(1)}L</h2>
                            <div className="mt-1.5 flex items-center gap-1.5">
                                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                                    <TrendingUp size={11} /> +{revenueSummary.monthlyGrowth}%
                                </span>
                                <span className="text-xs text-slate-400">vs last month</span>
                            </div>
                        </div>
                        <div className="flex gap-4 text-right">
                            <div>
                                <p className="text-lg font-bold text-slate-900">₹{(revenueSummary.commissionEarned / 100000).toFixed(1)}L</p>
                                <p className="text-[11px] text-slate-400">Commission</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-amber-600">₹{(revenueSummary.pendingPayouts / 100000).toFixed(1)}L</p>
                                <p className="text-[11px] text-slate-400">Pending payout</p>
                            </div>
                        </div>
                    </div>

                    {/* Bar chart — fixed height container is the key fix */}
                    <div className="relative flex h-48 items-end justify-between gap-2 sm:gap-3">
                        {revenueSummary.monthlyBreakdown.map((m, idx) => {
                            const heightPct = maxRevenue > 0 ? Math.max((m.revenue / maxRevenue) * 100, 4) : 4;
                            const isLast = idx === revenueSummary.monthlyBreakdown.length - 1;
                            return (
                                <div key={m.month} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                                    <span className="text-[10px] font-bold text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
                                        ₹{(m.revenue / 100000).toFixed(1)}L
                                    </span>
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-500 ease-out ${isLast ? 'bg-gradient-to-t from-[#001f3f] to-[#0055aa]' : 'bg-gradient-to-t from-slate-200 to-slate-300 group-hover:from-[#001f3f]/60 group-hover:to-[#0055aa]/60'
                                            }`}
                                        style={{ height: `${heightPct}%`, animation: `growBar 0.6s ease-out ${idx * 80}ms both` }}
                                    />
                                    <span className={`text-[11px] font-semibold ${isLast ? 'text-[#001f3f]' : 'text-slate-400'}`}>{m.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pending approvals preview */}
                <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" style={{ animationDelay: '200ms' }}>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-900">Pending Approvals</h2>
                        <Link to="/admin/dashboard/vehicle-approvals" className="flex items-center gap-1 text-xs font-semibold text-[#001f3f] hover:underline">
                            View all <ChevronRight size={12} />
                        </Link>
                    </div>
                    {pendingVehicles.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-400">All caught up!</p>
                    ) : (
                        <div className="space-y-2.5">
                            {pendingVehicles.slice(0, 4).map((v, idx) => (
                                <div key={v.id} style={{ animationDelay: `${250 + idx * 60}ms` }} className="animate-fadeInUp flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-[#e6f2ff]/50">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm">{v.thumb}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-900">{v.title}</p>
                                        <p className="text-xs text-slate-400">{v.seller} · {v.submittedAt}</p>
                                    </div>
                                    <ArrowUpRight size={14} className="shrink-0 text-slate-300" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Cart activity */}
            <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '300ms' }}>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={17} className="text-[#001f3f]" />
                        <h2 className="text-base font-bold text-slate-900">Recent Cart & Wishlist Activity</h2>
                    </div>
                    <Link to="/admin/dashboard/carts" className="flex items-center gap-1 text-xs font-semibold text-[#001f3f] hover:underline">
                        View all <ChevronRight size={12} />
                    </Link>
                </div>
                <div className="divide-y divide-slate-100">
                    {cartActivity.map((c, idx) => (
                        <div key={c.id} style={{ animationDelay: `${350 + idx * 60}ms` }} className="animate-fadeInUp flex items-center justify-between py-3 text-sm transition hover:bg-slate-50">
                            <div>
                                <p className="font-semibold text-slate-900">{c.buyer}</p>
                                <p className="text-xs text-slate-400">{c.vehicle} · {c.addedAt}</p>
                            </div>
                            <p className="font-bold text-slate-900">₹{(c.value / 100000).toFixed(1)}L</p>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes growBar {
                    from { height: 0%; }
                }
            `}</style>
        </div>
    );
};