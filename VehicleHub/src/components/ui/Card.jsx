export const Card = ({ children, className = '' }) => (
    <div className={`rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl ${className}`}>{children}</div>
);
