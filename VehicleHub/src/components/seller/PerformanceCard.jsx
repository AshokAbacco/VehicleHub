export const PerformanceCard = ({ performance }) => (
    <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-white">Performance Score</h2>
                <p className="text-sm text-slate-400">Business health and marketplace readiness.</p>
            </div>
            <div className="rounded-3xl bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{performance.score}%</div>
        </div>
        <div className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Business health</p>
                    <p className="mt-2 text-xl font-semibold text-white">{performance.health}%</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Profile completion</p>
                    <p className="mt-2 text-xl font-semibold text-white">{performance.completion}%</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Customer trust</p>
                    <p className="mt-2 text-xl font-semibold text-white">{performance.score > 90 ? 'Excellent' : 'Healthy'}</p>
                </div>
            </div>
            <div className="space-y-3">
                {performance.tips.map((tip, index) => (
                    <div key={index} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300">
                        <p className="text-slate-300">{tip}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
