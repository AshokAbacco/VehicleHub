import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useGetMyPurchaseRequestsQuery } from '../../services/buyerApiSlice.js';
import { formatCurrency } from '../../utils/formatters.js';

const statusColor = { INTERESTED: 'bg-amber-50 text-amber-700', PURCHASED: 'bg-emerald-50 text-emerald-700', LOST_INTEREST: 'bg-slate-100 text-slate-500' };

export const BuyerInquiriesPage = () => {
    const { data, isLoading } = useGetMyPurchaseRequestsQuery();
    const inquiries = data?.data || [];

    return (
        <div className="space-y-6">
            <Helmet><title>My Inquiries | VehicleHub</title></Helmet>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Inquiries</h1>
                <p className="mt-1 text-sm text-slate-500">Every vehicle you've contacted a seller about.</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                ) : inquiries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                        <MessageSquare size={26} /><p className="text-sm font-medium">No inquiries yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {inquiries.map((inq) => (
                            <Link key={inq.id} to={`/vehicle/${inq.vehicleListingId}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50 sm:p-5">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-900">{inq.vehicleListing?.title}</p>
                                    <p className="text-xs text-slate-500">{formatCurrency(inq.vehicleListing?.price)} · {new Date(inq.createdAt).toLocaleDateString('en-IN')}</p>
                                </div>
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[inq.status] || 'bg-slate-100'}`}>{inq.status.replace('_', ' ')}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};