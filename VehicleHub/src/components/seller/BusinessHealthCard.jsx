export const BusinessHealthCard = ({ health }) => (
    <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
            <div>
                <h2 className="text-lg font-semibold text-white">Business Health</h2>
                <p className="text-sm text-slate-400">Your marketplace performance summary.</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Stable</span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Health score</p>
                <p className="mt-3 text-3xl font-semibold text-white">{health.score}%</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Listing completeness</p>
                <p className="mt-3 text-3xl font-semibold text-white">{health.listingCompletion}%</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Trust score</p>
                <p className="mt-3 text-3xl font-semibold text-white">{health.trustScore}%</p>
            </div>
        </div>
        <div className="mt-5 space-y-3 text-sm text-slate-400">
            {health.notes.map((note, index) => (
                <div key={index} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">{note}</div>
            ))}
        </div>
    </div>
);