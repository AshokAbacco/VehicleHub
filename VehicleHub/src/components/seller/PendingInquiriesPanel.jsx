// VehicleHub/VehicleHub/src/components/seller/PendingInquiriesPanel.jsx
import { useNavigate } from 'react-router-dom';
import { MessageCircleQuestion, User, Clock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

const timeAgo = (date) => {
    const diffMs = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export const PendingInquiriesPanel = ({ inquiries = [], isLoading }) => {
    const navigate = useNavigate();

    return (
        <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 sm:h-8 sm:w-8">
                        <MessageCircleQuestion size={14} />
                    </div>
                    <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">Pending Inquiries</h2>
                </div>
                {inquiries.length > 0 && (
                    <span className="shrink-0 rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-bold text-cyan-700">
                        {inquiries.length}
                    </span>
                )}
            </div>
            <p className="mb-3 text-xs text-slate-500 sm:mb-4 sm:text-sm">Buyers currently interested in your listings.</p>

            <div className="max-h-72 flex-1 space-y-2 overflow-y-auto sm:max-h-80 lg:max-h-none">
                {isLoading ? (
                    <div className="flex h-32 items-center justify-center text-sm text-slate-400 sm:h-40">Loading...</div>
                ) : inquiries.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center gap-1 text-slate-400 sm:h-40">
                        <MessageCircleQuestion size={20} />
                        <p className="text-sm font-medium">No pending inquiries.</p>
                    </div>
                ) : (
                    inquiries.map((inq) => (
                        <button
                            key={inq.id}
                            onClick={() => navigate('/seller/dashboard/purchase-requests')}
                            className="flex w-full items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-[#001f3f]/20 hover:bg-white sm:gap-3"
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e6f2ff] text-[#001f3f] sm:h-9 sm:w-9">
                                <User size={14} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900">{inq.buyerName}</p>
                                <p className="truncate text-xs text-slate-500">{inq.vehicleListing?.title || 'Vehicle listing'}</p>
                            </div>
                            <div className="hidden shrink-0 text-right xs:block">
                                <p className="flex items-center justify-end gap-1 text-xs font-medium text-slate-400">
                                    <Clock size={10} /> {timeAgo(inq.createdAt)}
                                </p>
                                {inq.vehicleListing?.price && (
                                    <p className="text-xs font-bold text-slate-700">{formatCurrency(inq.vehicleListing.price)}</p>
                                )}
                            </div>
                            <ArrowRight size={13} className="hidden shrink-0 text-slate-300 sm:block" />
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};