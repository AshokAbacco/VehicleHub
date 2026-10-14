import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
    Approved: '#10b981',
    Pending: '#f59e0b',
    Rejected: '#ef4444',
    Sold: '#8b5cf6',
    Draft: '#06b6d4',
    Archived: '#94a3b8',
};

export const StatusBreakdownChart = ({ stats }) => {
    const data = [
        { name: 'Approved', value: stats?.approved || 0 },
        { name: 'Pending', value: stats?.pending || 0 },
        { name: 'Rejected', value: stats?.rejected || 0 },
        { name: 'Sold', value: stats?.sold || 0 },
        { name: 'Draft', value: stats?.draft || 0 },
        { name: 'Archived', value: stats?.archived || 0 },
    ].filter((d) => d.value > 0);

    return (
        <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">Listing Status Breakdown</h2>
            <p className="mb-2 text-xs text-slate-500 sm:text-sm">Where all your vehicles currently stand.</p>

            {data.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-slate-400 sm:h-56 lg:h-64">
                    No vehicles yet.
                </div>
            ) : (
                <div className="h-48 sm:h-56 lg:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius="55%"
                                outerRadius="80%"
                                paddingAngle={2}
                            >
                                {data.map((entry) => (
                                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                wrapperStyle={{ fontSize: '11px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};