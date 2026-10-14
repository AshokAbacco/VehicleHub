export const RecentActivities = ({ activities }) => (
    <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-white">Recent Activities</h2>
                <p className="text-sm text-slate-400"> latest actions across your seller workspace.</p>
            </div>
            <button className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">See all</button>
        </div>
        <div className="space-y-3">
            {activities.map((activity) => (
                <div key={activity.id} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{activity.title}</p>
                        <span className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{activity.time}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{activity.description}</p>
                </div>
            ))}
        </div>
    </div>
);