import { TrendingUp } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency.js';

export const RevenueOverviewCard = ({ revenueSummary }) => {
    const data = revenueSummary.monthlyBreakdown;
    const max = Math.max(...data.map((d) => d.revenue));
    const min = Math.min(...data.map((d) => d.revenue));
    const range = max - min || 1;

    // Build an SVG sparkline path from the monthly data points
    const width = 280;
    const height = 60;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.revenue - min) / range) * height;
        return `${x},${y}`;
    });
    const linePath = `M${points.join(' L')}`;
    const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

    return (
        <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Revenue Overview</p>
                    <h2 className="mt-1 text-3xl font-extrabold text-slate-900">{formatINR(revenueSummary.totalRevenue)}</h2>
                    <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                            <TrendingUp size={11} /> +{revenueSummary.monthlyGrowth}%
                        </span>
                        <span className="text-xs text-slate-400">vs last month</span>
                    </div>
                </div>
                <div className="flex gap-4 text-right">
                    <div>
                        <p className="text-lg font-bold text-slate-900">{formatINR(revenueSummary.commissionEarned)}</p>
                        <p className="text-[11px] text-slate-400">Commission</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-amber-600">{formatINR(revenueSummary.pendingPayouts)}</p>
                        <p className="text-[11px] text-slate-400">Pending payout</p>
                    </div>
                </div>
            </div>

            {/* Sparkline chart — this replaces the flat "₹148.0L" text you were seeing */}
            <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#001f3f" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#001f3f" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#revGrad)" />
                    <path d={linePath} fill="none" stroke="#001f3f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => {
                        const [x, y] = p.split(',');
                        return <circle key={i} cx={x} cy={y} r="2.5" fill="#001f3f" />;
                    })}
                </svg>
                <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-400">
                    {data.map((d) => <span key={d.month}>{d.month}</span>)}
                </div>
            </div>
        </div>
    );
};