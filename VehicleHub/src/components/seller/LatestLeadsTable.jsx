import { CalendarClock, ChevronRight } from 'lucide-react';

const statusStyles = {
    'Inspection Booked': 'bg-cyan-500/10 text-cyan-300',
    'Offer Pending': 'bg-amber-500/10 text-amber-300',
    'Finance Pending': 'bg-fuchsia-500/10 text-fuchsia-300',
    'Deal Closed': 'bg-emerald-500/10 text-emerald-300',
};

export const LatestLeadsTable = ({ leads }) => (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/60 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:rounded-[32px] sm:p-6">
        <div className="mb-5 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-white">Latest Leads</h2>
                <p className="text-sm text-slate-400">Recent buyer interest and inquiry status.</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 hover:text-cyan-200">
                View all <ChevronRight size={13} />
            </button>
        </div>

        <div className="space-y-2.5">
            {leads.map((lead) => (
                <div
                    key={lead.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-950/60 p-4 transition hover:border-cyan-400/20 sm:flex-row sm:items-center sm:gap-4"
                >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 text-sm font-bold text-white">
                            {lead.buyer[0]}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{lead.buyer}</p>
                            <p className="truncate text-xs text-slate-500">{lead.vehicle}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
                        <div className="text-left sm:text-right">
                            <p className="text-sm font-bold text-white">{lead.price}</p>
                            <p className="flex items-center gap-1 text-[11px] text-slate-500 sm:justify-end">
                                <CalendarClock size={11} /> {lead.inspection}
                            </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[lead.status] || 'bg-slate-700/40 text-slate-300'}`}>
                            {lead.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);