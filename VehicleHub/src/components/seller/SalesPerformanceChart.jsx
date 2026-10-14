import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const { sales, revenue } = payload[0].payload;
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
            <p className="font-bold text-slate-900">{label}</p>
            <p className="mt-1 text-slate-600">Sales: <span className="font-semibold text-[#001f3f]">{sales}</span></p>
            <p className="text-slate-600">Revenue: <span className="font-semibold text-[#001f3f]">₹{revenue.toLocaleString('en-IN')}</span></p>
        </div>
    );
};

export const SalesPerformanceChart = ({ data = [], isLoading }) => {
    const hasSales = data.some((d) => d.sales > 0);

    return (
        <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="mb-1 flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 sm:h-8 sm:w-8">
                    <TrendingUp size={14} />
                </div>
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">Sales Performance</h2>
            </div>
            <p className="mb-3 text-xs text-slate-500 sm:mb-4 sm:text-sm">Vehicles sold over the last 8 weeks.</p>

            {isLoading ? (
                <div className="flex h-48 items-center justify-center text-sm text-slate-400 sm:h-56 lg:h-64">Loading...</div>
            ) : !hasSales ? (
                <div className="flex h-48 flex-col items-center justify-center gap-1 text-slate-400 sm:h-56 lg:h-64">
                    <TrendingUp size={20} />
                    <p className="text-sm font-medium">No sales in this period yet.</p>
                </div>
            ) : (
                <div className="h-48 sm:h-56 lg:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 8, left: -24, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};