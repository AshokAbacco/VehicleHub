import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Loader2, X } from 'lucide-react';
import { useGetMyPurchaseRequestsQuery, useCancelPurchaseRequestMutation } from '../../services/buyerApiSlice.js';
import { formatCurrency } from '../../utils/formatters.js';

const statusBadge = {
    PENDING: 'bg-amber-50 text-amber-700',
    ACCEPTED: 'bg-emerald-50 text-emerald-700',
    REJECTED: 'bg-red-50 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-500',
};

export const BuyerOrdersPage = () => {
    const { data, isLoading } = useGetMyPurchaseRequestsQuery();
    const [cancelRequest] = useCancelPurchaseRequestMutation();
    const requests = data?.data || [];

    const handleCancel = async (id) => {
        try {
            await cancelRequest(id).unwrap();
            toast.success('Request cancelled');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to cancel');
        }
    };

    return (
        <div className="space-y-6">
            <Helmet><title>Orders | VehicleHub Buyer</title></Helmet>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Purchase Requests</h1>
                <p className="mt-1 text-sm text-slate-500">Track your offers and purchase status.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                        <ShoppingBag size={26} />
                        <p className="text-sm font-medium">No purchase requests yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {requests.map((r) => (
                            <div key={r.id} className="flex items-center justify-between gap-3 p-4 sm:p-5">
                                <Link to={`/vehicle/${r.vehicleListingId}`} className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-slate-900 hover:text-[#001f3f]">{r.vehicleListing?.title}</p>
                                    <p className="text-xs text-slate-500">Your offer: {formatCurrency(r.offerPrice)} · {new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                                </Link>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge[r.status]}`}>{r.status}</span>
                                    {r.status === 'PENDING' && (
                                        <button onClick={() => handleCancel(r.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Cancel request">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};