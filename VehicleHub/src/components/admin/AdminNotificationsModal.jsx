// components/admin/AdminNotificationsModal.jsx
import { useState } from "react";
import { X, UserPlus, Bell as BellIcon } from "lucide-react";
import { useGetPendingSellersQuery } from "../../services/adminApiSlice.js";
import { SellerReviewModal } from "./SellerReviewModal.jsx";

export const AdminNotificationsModal = ({ notifications, onClose, onMarkAllRead }) => {
    const { data, refetch } = useGetPendingSellersQuery(undefined, { pollingInterval: 15000 });
    const pendingSellers = data?.sellers || [];
    const [reviewingId, setReviewingId] = useState(null);

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-start justify-end p-3 sm:p-6">
                <div className="absolute inset-0 bg-black/30" onClick={onClose} />
                <div className="relative mt-16 flex max-h-[75vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                        <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={onMarkAllRead} className="text-xs font-semibold text-[#001f3f] hover:underline">
                                Mark all read
                            </button>
                            <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Live: seller registrations awaiting approval */}
                        {pendingSellers.length > 0 && (
                            <div>
                                <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Seller Registrations ({pendingSellers.length})
                                </p>
                                {pendingSellers.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setReviewingId(s.id)}
                                        className="flex w-full items-start gap-3 border-b border-slate-50 p-3.5 text-left hover:bg-slate-50"
                                    >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                            <UserPlus size={16} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                {s.ownerName} {s.businessName && `— ${s.businessName}`}
                                            </p>
                                            <p className="truncate text-xs text-slate-500">
                                                Wants to become a seller · {s.city}, {s.state}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : ""}
                                            </p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                            Pending
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Existing generic/mock notifications */}
                        <div>
                            {pendingSellers.length > 0 && (
                                <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    General
                                </p>
                            )}
                            {notifications.map((n) => (
                                <div key={n.id} className="flex items-start gap-3 border-b border-slate-50 p-3.5">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                        <BellIcon size={16} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-900">{n.title}</p>
                                        <p className="truncate text-xs text-slate-500">{n.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pendingSellers.length === 0 && notifications.length === 0 && (
                            <p className="p-6 text-center text-sm text-slate-400">You're all caught up 🎉</p>
                        )}
                    </div>
                </div>
            </div>

            {reviewingId && (
                <SellerReviewModal
                    sellerId={reviewingId}
                    onClose={() => setReviewingId(null)}
                    onDecided={() => refetch()}
                />
            )}
        </>
    );
};