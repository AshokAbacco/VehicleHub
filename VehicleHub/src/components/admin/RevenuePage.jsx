// VehicleHub/VehicleHub/src/components/admin/RevenuePage.jsx
// Platform revenue from real sales (vehicles marked SOLD) — GET /api/admin/revenue.
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { IndianRupee, PieChart } from 'lucide-react';
import { useGetAdminRevenueQuery } from '../../services/adminApiSlice.js';
import { formatINR } from '../../utils/formatCurrency.js';
import { AdminLoading, AdminError, AdminEmpty } from './AdminState.jsx';

const ranges = [
    { id: 'day', label: 'Daily', dataKey: 'dailyBreakdown' },
    { id: 'week', label: 'Weekly', dataKey: 'weeklyBreakdown' },
    { id: 'month', label: 'Monthly', dataKey: 'monthlyBreakdown' },
];

// Donut chart built from conic-gradient — no external chart library needed
const DonutChart = ({ data }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    let cumulative = 0;
    const stops = data.map((d) => {
        const start = (cumulative / total) * 360;
        cumulative += d.value;
        const end = (cumulative / total) * 360;
        return `${d.color} ${start}deg ${end}deg`;
    });

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
            <div className="relative h-40 w-40 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops.join(', ')})` }}>
                <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
                    <p className="text-lg font-extrabold text-slate-900">{data.length}</p>
                    <p className="text-[10px] text-slate-400">Categories</p>
                </div>
            </div>
            <div className="space-y-1.5">
                {data.map((d) => (
                    <div key={d.label} className="flex items-center gap-2 text-sm">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="font-medium text-slate-700">{d.label}</span>
                        <span className="text-slate-400">{d.value}% · {formatINR(d.amount)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const RevenuePage = () => {
    const [range, setRange] = useState('month');
    const { data, isLoading, isError, error, refetch } = useGetAdminRevenueQuery();
    const summary = data?.data;
    const activeData = summary?.[ranges.find((r) => r.id === range).dataKey] || [];
    const max = Math.max(0, ...activeData.map((m) => m.revenue));

    return (
        <div className="space-y-6">
            <Helmet><title>Revenue | Admin</title></Helmet>
            <div className="animate-fadeInUp">
                <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><IndianRupee size={22} className="text-[#001f3f]" /> Revenue</h1>
                <p className="text-sm text-slate-500">Sales value of vehicles sold on the platform, commission earned and pending payments.</p>
            </div>

            {isLoading ? (
                <AdminLoading label="Loading revenue..." />
            ) : isError ? (
                <AdminError error={error} onRetry={refetch} label="Failed to load revenue." />
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[
                            { label: 'Total Sales Value', value: summary.totalRevenue, color: 'text-slate-900', note: `${summary.totalSales} vehicle${summary.totalSales === 1 ? '' : 's'} sold` },
                            { label: 'Commission Earned', value: summary.commissionEarned, color: 'text-emerald-600', note: `${Math.round((summary.commissionRate || 0) * 1000) / 10}% of each sale` },
                            { label: 'Pending Payments', value: summary.pendingPayouts, color: 'text-amber-600', note: 'Payments not completed yet' },
                        ].map((item, idx) => (
                            <div key={item.label} style={{ animationDelay: `${idx * 80}ms` }} className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase text-slate-400">{item.label}</p>
                                <p className={`mt-2 text-2xl font-extrabold ${item.color}`}>{formatINR(item.value)}</p>
                                <p className="mt-0.5 text-[11px] text-slate-400">{item.note}</p>
                            </div>
                        ))}
                    </div>

                    {/* Bar chart with range toggle */}
                    <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '200ms' }}>
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-base font-bold text-slate-900">Revenue Breakdown</h2>
                            <div className="flex gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                                {ranges.map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setRange(r.id)}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${range === r.id ? 'bg-[#001f3f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex h-52 items-end justify-between gap-3">
                            {activeData.map((m, idx) => (
                                <div key={`${m.label}-${idx}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                                    <span className="text-[10px] font-bold text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">{formatINR(m.revenue)}</span>
                                    <div
                                        className="w-full rounded-t-lg bg-gradient-to-t from-[#001f3f] to-[#0055aa] transition-all"
                                        style={{ height: `${max > 0 ? Math.max((m.revenue / max) * 100, 4) : 4}%`, animation: `growBar 0.6s ease-out ${idx * 60}ms both` }}
                                        title={`${m.label}: ${formatINR(m.revenue)} · ${m.sales} sold`}
                                    />
                                    <span className="text-[11px] font-semibold text-slate-400">{m.label}</span>
                                </div>
                            ))}
                        </div>
                        {max === 0 && <p className="mt-3 text-center text-xs text-slate-400">No sales in this period.</p>}
                    </div>

                    {/* Donut chart by category */}
                    <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '260ms' }}>
                        <h2 className="mb-5 text-base font-bold text-slate-900">Sales by Vehicle Category</h2>
                        {summary.categoryBreakdown?.length ? (
                            <DonutChart data={summary.categoryBreakdown} />
                        ) : (
                            <AdminEmpty icon={PieChart} title="No sales yet" text="Category split appears once vehicles are sold." height="h-40" />
                        )}
                    </div>
                </>
            )}

            <style>{`@keyframes growBar { from { height: 0%; } }`}</style>
        </div>
    );
};