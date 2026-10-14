export const Select = ({ label, options = [], ...props }) => (
    <label className="block text-sm text-slate-300">
        <span className="mb-2 block">{label}</span>
        <select
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
            {...props}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </label>
);
