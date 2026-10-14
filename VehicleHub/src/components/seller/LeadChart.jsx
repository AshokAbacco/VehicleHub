import { motion } from 'framer-motion';

export const LeadChart = ({ leads }) => (
    // <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
    //     <div className="flex items-center justify-between">
    //         <div>
    //             <h2 className="text-lg font-semibold text-white">Monthly Leads</h2>
    //             <p className="text-sm text-slate-400">Inbound buyer interest trends.</p>
    //         </div>
    //         <span className="rounded-full bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-300">Conversion focus</span>
    //     </div>
    //     <div className="mt-5 h-48 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 p-4">
    //         <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
    //             <div className="grid h-full grid-cols-7 gap-2 items-end">
    //                 {leads.map((item) => (
    //                     <div key={item.month} className="space-y-2 text-center">
    //                         <div className="mx-auto h-full w-full rounded-3xl bg-gradient-to-t from-fuchsia-500 to-slate-700" style={{ height: `${item.value}%` }} />
    //                         <p className="text-[11px] text-slate-500">{item.month}</p>
    //                     </div>
    //                 ))}
    //             </div>
    //         </motion.div>
    //     </div>
    // </div>
);
