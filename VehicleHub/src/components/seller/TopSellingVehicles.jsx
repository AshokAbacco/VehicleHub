export const TopSellingVehicles = ({ vehicles }) => (
    <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-white">Top Selling Vehicles</h2>
                <p className="text-sm text-slate-400">High-demand vehicles across your inventory.</p>
            </div>
            <button className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">View report</button>
        </div>
        <div className="space-y-3">
            {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 transition hover:border-cyan-500/20">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold text-white">{vehicle.title}</p>
                            <p className="text-xs text-slate-400">Revenue: {vehicle.revenue}</p>
                        </div>
                        <div className="text-right text-sm text-slate-400">
                            <p>{vehicle.sold} sold</p>
                            <p>{vehicle.views} views</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);