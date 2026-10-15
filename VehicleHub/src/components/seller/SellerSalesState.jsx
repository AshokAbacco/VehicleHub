// VehicleHub/VehicleHub/src/components/seller/SellerSalesState.jsx
// Loading / error states + status pill shared by the seller Payments and Invoices pages.
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const PILL = {
    COMPLETED: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    SUCCESS: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    CONFIRMED: 'bg-blue-50 text-blue-600 border border-blue-200',
    PENDING: 'bg-amber-50 text-amber-600 border border-amber-200',
    CANCELLED: 'bg-slate-100 text-slate-500 border border-slate-200',
    REFUNDED: 'bg-violet-50 text-violet-600 border border-violet-200',
    FAILED: 'bg-red-50 text-red-600 border border-red-200',
};
const LABEL = { SUCCESS: 'Paid', COMPLETED: 'Completed', CONFIRMED: 'Confirmed', PENDING: 'Pending', CANCELLED: 'Cancelled', REFUNDED: 'Refunded', FAILED: 'Failed' };

export const SalesStatusPill = ({ status }) => (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${PILL[status] || 'bg-slate-100 text-slate-600'}`}>
        {LABEL[status] || status}
    </span>
);

export const SalesLoading = ({ text }) => (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-16 text-slate-400">
        <Loader2 size={24} className="animate-spin" />
        <p className="text-sm font-medium">{text}</p>
    </div>
);

export const SalesError = ({ error, onRetry, retrying }) => (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-16 text-red-600">
        <AlertCircle size={24} />
        <p className="text-sm font-medium">{error?.data?.message || 'Failed to load your sales.'}</p>
        <button
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
        >
            <RefreshCw size={13} className={retrying ? 'animate-spin' : ''} /> Try again
        </button>
    </div>
);