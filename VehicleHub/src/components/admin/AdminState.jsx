// VehicleHub/VehicleHub/src/components/admin/AdminState.jsx
// Loading / error / empty states shared by the admin pages (same look everywhere).
import { Loader2, XCircle, RefreshCw, Inbox } from 'lucide-react';

export const AdminLoading = ({ height = 'h-48', label }) => (
    <div className={`flex ${height} flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm`}>
        <Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" />
        {label && <p className="text-sm font-medium">{label}</p>}
    </div>
);

export const AdminError = ({ error, onRetry, label = 'Failed to load data.', height = 'h-48' }) => (
    <div className={`flex ${height} flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 px-4 text-center text-red-600`}>
        <XCircle size={22} />
        <p className="text-sm font-medium">{error?.data?.message || label}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
                <RefreshCw size={12} /> Try again
            </button>
        )}
    </div>
);

export const AdminEmpty = ({ icon: Icon = Inbox, title, text, height = 'h-48' }) => (
    <div className={`flex ${height} flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white px-4 text-center text-slate-400`}>
        <Icon size={24} />
        {title && <p className="text-sm font-semibold text-slate-600">{title}</p>}
        {text && <p className="text-xs">{text}</p>}
    </div>
);