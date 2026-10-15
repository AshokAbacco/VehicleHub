// VehicleHub/VehicleHub/src/components/admin/AdminNotificationsModal.jsx
// Bell panel: seller applications waiting for review + the admin's real notifications.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, UserPlus, Bell as BellIcon, Loader2 } from "lucide-react";
import {
    useGetPendingSellersQuery,
    useGetAdminNotificationsQuery,
    useMarkAdminNotificationReadMutation,
    useMarkAllAdminNotificationsReadMutation,
} from "../../services/adminApiSlice.js";
import { SellerReviewModal } from "./SellerReviewModal.jsx";
import { adminNotificationTarget } from "./adminNotificationLinks.js";

export const AdminNotificationsModal = ({ onClose }) => {
    const navigate = useNavigate();
    const { data: sellersData } = useGetPendingSellersQuery(undefined, { pollingInterval: 30000 });
    const { data: notifData, isLoading } = useGetAdminNotificationsQuery(undefined, { pollingInterval: 30000 });
    const [markRead] = useMarkAdminNotificationReadMutation();
    const [markAllRead, { isLoading: markingAll }] = useMarkAllAdminNotificationsReadMutation();
    const pendingSellers = sellersData?.data?.sellers || sellersData?.sellers || [];
    const notifications = notifData?.data?.notifications || [];
    const unreadCount = notifData?.data?.unreadCount || 0;
    const [reviewingId, setReviewingId] = useState(null);

    const openNotification = (n) => {
        if (!n.isRead) markRead(n.id);
        const target = adminNotificationTarget(n);
        if (target.sellerId) return setReviewingId(target.sellerId);
        if (target.to) {
            onClose();
            navigate(target.to);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-start justify-end p-3 sm:p-6">
                <div className="absolute inset-0 bg-black/30" onClick={onClose} />
                <div className="relative mt-16 flex max-h-[75vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                        <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button onClick={() => markAllRead()} disabled={markingAll} className="text-xs font-semibold text-[#001f3f] hover:underline disabled:opacity-60">
                                    Mark all read
                                </button>
                            )}
                            <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Seller registrations awaiting approval */}
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
                                                Wants to become a seller · {[s.city, s.state].filter(Boolean).join(", ")}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                {s.submittedAt ? new Date(s.submittedAt).toLocaleString("en-IN") : ""}
                                            </p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                            Pending
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* The admin's notifications */}
                        <div>
                            {pendingSellers.length > 0 && notifications.length > 0 && (
                                <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">General</p>
                            )}
                            {isLoading ? (
                                <div className="flex h-24 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-[#001f3f]" /></div>
                            ) : (
                                notifications.slice(0, 30).map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => openNotification(n)}
                                        className={`flex w-full items-start gap-3 border-b border-slate-50 p-3.5 text-left hover:bg-slate-50 ${!n.isRead ? 'bg-[#e6f2ff]/40' : ''}`}
                                    >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                            <BellIcon size={16} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                                                <span className="truncate">{n.title}</span>
                                                {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-[#001f3f]" />}
                                            </p>
                                            <p className="line-clamp-2 text-xs text-slate-500">{n.message}</p>
                                            <p className="mt-0.5 text-[11px] text-slate-400">{n.time}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        {!isLoading && pendingSellers.length === 0 && notifications.length === 0 && (
                            <p className="p-6 text-center text-sm text-slate-400">You're all caught up 🎉</p>
                        )}
                    </div>

                    <button
                        onClick={() => { onClose(); navigate('/admin/dashboard/notifications'); }}
                        className="border-t border-slate-100 py-2.5 text-xs font-semibold text-[#001f3f] hover:bg-slate-50"
                    >
                        View all notifications
                    </button>
                </div>
            </div>

            {reviewingId && (
                <SellerReviewModal sellerId={reviewingId} onClose={() => setReviewingId(null)} onDecided={() => setReviewingId(null)} />
            )}
        </>
    );
};