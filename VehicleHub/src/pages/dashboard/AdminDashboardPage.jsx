// VehicleHub/VehicleHub/src/pages/dashboard/AdminDashboardPage.jsx
// Admin home — every number comes from GET /api/admin/dashboard (no sample data).
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    ChevronRight, TrendingUp, TrendingDown, LayoutGrid, CheckSquare,
    UserCircle2, Users, IndianRupee, XCircle, ShoppingCart, ArrowUpRight, Heart,
} from 'lucide-react';
import { useGetAdminDashboardQuery } from '../../services/adminApiSlice.js';
import { formatINR } from '../../utils/formatCurrency.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { AdminLoading, AdminError } from '../../components/admin/AdminState.jsx';

const greetingFor = () => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};

const nf = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

export const AdminDashboardPage = () => {
    const { user } = useAuth();
    const { data, isLoading, isError, error, refetch } = useGetAdminDashboardQuery(undefined, { pollingInterval: 30000 });
    const dash = data?.data;
    const s = dash?.stats || {};
    const revenue = dash?.revenueSummary;
    const pendingVehicles = dash?.pendingVehicles || [];
    const cartActivity = dash?.cartActivity || [];
    const adminName = user?.name || user?.fullName || 'Admin';

    const statCards = [
        { title: 'Total vehicles', value: nf(s.totalVehicles), subtitle: `${nf(s.liveVehicles)} live on the site`, icon: LayoutGrid, bg: 'bg-[#e6f2ff]', color: 'text-[#001f3f]', to: '/admin/dashboard/all-vehicles' },
        { title: 'Pending approvals', value: nf(s.pendingApprovals), subtitle: 'Vehicles awaiting review', icon: CheckSquare, bg: 'bg-amber-50', color: 'text-amber-600', to: '/admin/dashboard/vehicle-approvals' },
        {
            title: 'Sellers & dealers',
            value: nf((s.activeSellers || 0) + (s.activeDealers || 0)),
            subtitle: `${nf(s.activeSellers || 0)} sellers · ${nf(s.activeDealers || 0)} dealers${s.pendingSellerApplications ? ` · ${s.pendingSellerApplications} to review` : ''}`,
            icon: UserCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600', to: '/admin/dashboard/sellers' },
        { title: 'Total buyers', value: nf(s.totalBuyers), subtitle: 'Registered users', icon: Users, bg: 'bg-violet-50', color: 'text-violet-600', to: '/admin/dashboard/buyers' },
        { title: 'This month sales', value: formatINR(s.thisMonthRevenue), subtitle: `${formatINR(s.thisMonthCommission)} commission`, icon: IndianRupee, bg: 'bg-emerald-50', color: 'text-emerald-600', to: '/admin/dashboard/revenue' },
        { title: 'Rejected listings', value: nf(s.rejectedListings), subtitle: 'Needs seller action', icon: XCircle, bg: 'bg-red-50', color: 'text-red-600', to: '/admin/dashboard/all-vehicles' },
    ];

    const monthly = revenue?.monthlyBreakdown || [];
    const maxRevenue = Math.max(0, ...monthly.map((m) => m.revenue));
    const growth = revenue?.monthlyGrowth;

    return (
        <div className="space-y-6">
            <Helmet><title>Admin Dashboard | VehicleHub</title></Helmet>

            <div className="animate-fadeInUp flex items-center gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-[#001f3f] to-[#1b79d6] p-5 text-white shadow-lg sm:p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-xl font-bold">
                    {String(adminName).trim().charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-white/70">{greetingFor()}, {adminName} 👋</p>
                    <h1 className="text-xl font-extrabold sm:text-2xl">Here's what's happening on VehicleHub today</h1>
                </div>
            </div>

            {isLoading ? (
                <AdminLoading height="h-40" label="Loading dashboard..." />
            ) : isError ? (
                <AdminError error={error} onRetry={refetch} label="Failed to load the dashboard." />
            ) : (
                <>
                    {/* Stat cards */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
                        {statCards.map((c, idx) => {
                            const Icon = c.icon;
                            return (
                                <Link
                                    key={c.title}
                                    to={c.to}
                                    style={{ animationDelay: `${idx * 60}ms` }}
                                    className="group animate-fadeInUp relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#001f3f]/20 hover:shadow-lg"
                                >
                                    <span className="absolute inset-x-0 top-0 h-[3px] w-full overflow-hidden">
                                        <span className="block h-full w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-[#001f3f] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
                                    </span>
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.bg} ${c.color} transition-transform duration-300 group-hover:scale-110`}>
                                        <Icon size={17} />
                                    </div>
                                    <p className="mt-3 truncate text-2xl font-extrabold text-slate-900">{c.value}</p>
                                    <p className="mt-0.5 text-xs font-semibold text-slate-700">{c.title}</p>
                                    <p className="truncate text-[11px] text-slate-400">{c.subtitle}</p>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
                        {/* Revenue overview (sales value of vehicles sold) */}
                        <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '150ms' }}>
                            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Revenue Overview</p>
                                    <h2 className="mt-1 text-2xl font-extrabold text-slate-900">{formatINR(revenue?.totalRevenue)}</h2>
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                        {growth === null || growth === undefined ? (
                                            <span className="text-xs text-slate-400">{revenue?.totalSales || 0} vehicle{revenue?.totalSales === 1 ? '' : 's'} sold in total</span>
                                        ) : (
                                            <>
                                                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                    {growth >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {growth >= 0 ? '+' : ''}{growth}%
                                                </span>
                                                <span className="text-xs text-slate-400">vs last month</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-4 text-right">
                                    <div>
                                        <p className="text-lg font-bold text-slate-900">{formatINR(revenue?.commissionEarned)}</p>
                                        <p className="text-[11px] text-slate-400">Commission</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-amber-600">{formatINR(revenue?.pendingPayouts)}</p>
                                        <p className="text-[11px] text-slate-400">Pending payments</p>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly bars (last 6 months) */}
                            <div className="relative flex h-48 items-end justify-between gap-2 sm:gap-3">
                                {monthly.map((m, idx) => {
                                    const heightPct = maxRevenue > 0 ? Math.max((m.revenue / maxRevenue) * 100, 4) : 4;
                                    const isLast = idx === monthly.length - 1;
                                    return (
                                        <div key={`${m.month}-${idx}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                                            <span className="text-[10px] font-bold text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
                                                {formatINR(m.revenue)}
                                            </span>
                                            <div
                                                className={`w-full rounded-t-lg transition-all duration-500 ease-out ${isLast ? 'bg-gradient-to-t from-[#001f3f] to-[#0055aa]' : 'bg-gradient-to-t from-slate-200 to-slate-300 group-hover:from-[#001f3f]/60 group-hover:to-[#0055aa]/60'}`}
                                                style={{ height: `${heightPct}%`, animation: `growBar 0.6s ease-out ${idx * 80}ms both` }}
                                                title={`${m.month}: ${formatINR(m.revenue)} · ${m.sales} sold`}
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
                                        <Link
                                            key={v.id}
                                            to="/admin/dashboard/vehicle-approvals"
                                            style={{ animationDelay: `${250 + idx * 60}ms` }}
                                            className="animate-fadeInUp flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-[#e6f2ff]/50"
                                        >
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm">{v.thumb}</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-slate-900">{v.title}</p>
                                                <p className="truncate text-xs text-slate-400">{v.seller} · {v.submittedAt}</p>
                                            </div>
                                            <ArrowUpRight size={14} className="shrink-0 text-slate-300" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart & wishlist activity */}
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
                        {cartActivity.length === 0 ? (
                            <p className="py-8 text-center text-sm text-slate-400">No cart or wishlist activity yet.</p>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {cartActivity.map((c, idx) => (
                                    <div key={c.id} style={{ animationDelay: `${350 + idx * 60}ms` }} className="animate-fadeInUp flex items-center justify-between gap-3 py-3 text-sm transition hover:bg-slate-50">
                                        <div className="min-w-0">
                                            <p className="flex items-center gap-1.5 truncate font-semibold text-slate-900">
                                                {c.type === 'Wishlist' ? <Heart size={12} className="shrink-0 text-red-400" /> : <ShoppingCart size={12} className="shrink-0 text-[#001f3f]" />}
                                                {c.buyer}
                                            </p>
                                            <p className="truncate text-xs text-slate-400">{c.vehicle} · {c.type} · {c.addedAt}</p>
                                        </div>
                                        <p className="shrink-0 font-bold text-slate-900">{formatINR(c.value)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            <style>{`
                @keyframes growBar {
                    from { height: 0%; }
                }
            `}</style>
        </div>
    );
};