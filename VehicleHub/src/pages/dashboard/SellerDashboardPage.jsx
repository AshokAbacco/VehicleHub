// VehicleHub/VehicleHub/src/pages/dashboard/SellerDashboardPage.jsx
import { Helmet } from 'react-helmet-async';
import { Loader2, LayoutDashboard, TrendingUp } from 'lucide-react';
import { StatsCards } from '../../components/seller/StatsCards.jsx';
import { RecentOrdersTable } from '../../components/seller/RecentOrdersTable.jsx';
import { StatusBreakdownChart } from '../../components/seller/StatusBreakdownChart.jsx';
import { SalesPerformanceChart } from '../../components/seller/SalesPerformanceChart.jsx';
import { PendingInquiriesPanel } from '../../components/seller/PendingInquiriesPanel.jsx';
import {
    useGetSellerStatsQuery,
    useGetSellerInventoryQuery,
    useGetSalesPerformanceQuery,
    useGetSellerInquiriesQuery,
} from '../../services/sellerApiSlice.js';

// Short Indian format so big amounts fit the stat card: ₹85,000 · ₹18.07 L · ₹1.25 Cr
const formatRevenue = (amount) => {
    const n = Number(amount) || 0;
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
};

export const SellerDashboardPage = () => {
    const { data: statsData, isLoading: statsLoading } = useGetSellerStatsQuery();
    const { data: inventoryData, isLoading: inventoryLoading } = useGetSellerInventoryQuery();
    const { data: salesData, isLoading: salesLoading } = useGetSalesPerformanceQuery();
    const { data: inquiryData, isLoading: inquiryLoading } = useGetSellerInquiriesQuery();

    const vehicles = Array.isArray(inventoryData) ? inventoryData : inventoryData?.vehicles || [];
    const stats = statsData?.stats;
    const salesPerformance = salesData?.data || [];
    const inquiries = inquiryData?.inquiries || [];

    const statCards = [
        { label: 'Total Listings', value: stats?.total ?? '—', to: '/seller/dashboard/inventory?stage=all' },
        { label: 'Approved', value: stats?.approved ?? '—', to: '/seller/dashboard/inventory?stage=approved' },
        { label: 'Pending', value: stats?.pending ?? '—', to: '/seller/dashboard/inventory?stage=pending' },
        { label: 'Sold', value: stats?.sold ?? '—', to: '/seller/dashboard/inventory?stage=sold' },
        { label: 'Rejected', value: stats?.rejected ?? '—', to: '/seller/dashboard/inventory?stage=rejected' },
        { label: 'Pending Inquiries', value: stats?.pendingInquiries ?? '—', to: '/seller/dashboard/purchase-requests' },
        { label: 'Total Revenue', value: formatRevenue(stats?.totalRevenue) },
    ];

    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            <Helmet>
                <title>Seller Dashboard | VehicleHub</title>
            </Helmet>

            {/* Gradient hero header */}
            <div className="animate-fadeInUp relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001f3f] via-[#002a55] to-[#003d7a] p-6 shadow-lg shadow-[#001f3f]/20 sm:p-7">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-white/5" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                            <LayoutDashboard size={13} /> {greeting}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Seller Dashboard</h1>
                        <p className="mt-1 text-sm text-white/70">Track your listings, sales, and buyer interest.</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-white backdrop-blur-sm">
                        <TrendingUp size={16} className="text-emerald-300" />
                        <span className="text-sm font-semibold">{stats?.sold ?? 0} vehicles sold</span>
                    </div>
                </div>
            </div>

            {statsLoading ? (
                <div className="flex h-20 items-center justify-center rounded-2xl border border-slate-200 bg-white sm:h-24">
                    <Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" />
                </div>
            ) : (
                <StatsCards stats={statCards} />
            )}

            {/* Donut + Sales Performance — stack on mobile/tablet, side-by-side on large screens */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                <div className="animate-fadeInUp opacity-0 lg:col-span-1" style={{ animationDelay: '120ms' }}>
                    <StatusBreakdownChart stats={stats} />
                </div>
                <div className="animate-fadeInUp opacity-0 lg:col-span-2" style={{ animationDelay: '180ms' }}>
                    <SalesPerformanceChart data={salesPerformance} isLoading={salesLoading} />
                </div>
            </div>

            {/* Recent orders + Pending inquiries — stack on mobile/tablet, side-by-side on large screens */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                <div className="animate-fadeInUp opacity-0 lg:col-span-2" style={{ animationDelay: '240ms' }}>
                    {inventoryLoading ? (
                        <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                            <Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" />
                        </div>
                    ) : (
                        <RecentOrdersTable vehicles={vehicles} />
                    )}
                </div>
                <div className="animate-fadeInUp opacity-0 lg:col-span-1" style={{ animationDelay: '300ms' }}>
                    <PendingInquiriesPanel inquiries={inquiries} isLoading={inquiryLoading} />
                </div>
            </div>
        </div>
    );
};