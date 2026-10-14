import { motion } from 'framer-motion';

export const VehicleStatusChart = ({ items }) => (
    <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-white">Inventory Status</h2>
                <p className="text-sm text-slate-400">Live view of active, pending and draft vehicles.</p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Snapshot</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {items.map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.title}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 0.75 }}
                        />
                    </div>
                </div>
            ))}
        </div>
    </div>
);
