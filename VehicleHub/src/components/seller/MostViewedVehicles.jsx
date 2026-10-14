export const MostViewedVehicles = ({ vehicles }) => (
    <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-white">Most Viewed Vehicles</h2>
                <p className="text-sm text-slate-400">Vehicles generating the highest buyer interest.</p>
            </div>
            <button className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Explore</button>
        </div>
        <div className="space-y-3">
            {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 transition hover:border-cyan-500/20">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-semibold text-white">{vehicle.title}</h3>
                            <p className="text-xs text-slate-400">{vehicle.category}</p>
                        </div>
                        <span className="text-xs rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-300">{vehicle.views} views</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
