import { motion } from 'framer-motion';

export const RevenueChart = ({ revenue }) => (
    // <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
    //     <div className="flex items-center justify-between">
    //         <div>
    //             <h2 className="text-lg font-semibold text-white">Monthly Revenue</h2>
    //             <p className="text-sm text-slate-400">Revenue performance over the last 7 months.</p>
    //         </div>
    //         <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Net growth</span>
    //     </div>
    //     {/* <div className="mt-6 space-y-3">
    //         <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    //             {revenue.map((item) => (
    //                 <div key={item.month} className="rounded-3xl bg-slate-950/80 p-4 text-center">
    //                     <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{item.month}</p>
    //                     <p className="mt-3 text-xl font-semibold text-white">₹{item.value}K</p>
    //                 </div>
    //             ))}
    //         </div>
    //         <div className="mt-4 h-44 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 p-4">
    //             <motion.div
    //                 className="h-full w-full"
    //                 initial={{ opacity: 0, y: 16 }}
    //                 animate={{ opacity: 1, y: 0 }}
    //                 transition={{ duration: 0.5 }}
    //             >
    //                 <div className="relative h-full">
    //                     <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400" />
    //                     <div className="flex h-full items-end gap-2 pt-6">
    //                         {revenue.map((item) => (
    //                             <div key={item.month} className="flex-1">
    //                                 <div className="mx-auto h-full w-10 rounded-3xl bg-gradient-to-t from-cyan-500 to-slate-700" style={{ height: `${item.value}%` }} />
    //                                 <p className="mt-3 text-center text-xs text-slate-500">{item.month}</p>
    //                             </div>
    //                         ))}
    //                     </div>
    //                 </div>
    //             </motion.div>
    //         </div>
    //     </div> */}
    // </div>
);
