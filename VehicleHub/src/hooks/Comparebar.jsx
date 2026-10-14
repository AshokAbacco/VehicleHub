import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompare } from './useCompare.js';

/**
 * CarDekho/Cars24-style sticky "compare" tray. Renders nothing when the list is empty.
 * Expects `vehicles` (full catalog) so it can resolve thumbnails/titles from stored ids.
 */
export const CompareBar = ({ vehicles = [] }) => {
    const { compareList, removeFromCompare, clearCompare } = useCompare();
    const navigate = useNavigate();

    if (compareList.length === 0) return null;

    const selected = compareList
        .map((id) => vehicles.find((v) => v.id === id))
        .filter(Boolean);

    return (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl lg:inset-x-0">
            <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-white">Compare ({selected.length}/4)</p>
                <div className="flex flex-1 flex-wrap gap-2">
                    {selected.map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center gap-2 rounded-full bg-slate-950/70 py-1 pl-1 pr-3">
                            <img src={vehicle.images?.[0]} alt={vehicle.title} className="h-7 w-7 rounded-full object-cover" />
                            <span className="max-w-[120px] truncate text-xs text-slate-200">{vehicle.title}</span>
                            <button
                                type="button"
                                onClick={() => removeFromCompare(vehicle.id)}
                                aria-label={`Remove ${vehicle.title} from compare`}
                                className="text-slate-400 hover:text-white"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={clearCompare} className="rounded-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-white">
                        Clear
                    </button>
                    <button
                        type="button"
                        disabled={selected.length < 2}
                        onClick={() => navigate(`/compare?ids=${compareList.join(',')}`)}
                        className="rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Compare now
                    </button>
                </div>
            </div>
        </div>
    );
};
