// VehicleHub/VehicleHub/src/components/admin/NotificationsPage.jsx
// All of the admin's notifications (seller registrations, vehicle submissions, inspections…).
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import {
    useGetAdminNotificationsQuery,
    useMarkAdminNotificationReadMutation,
    useMarkAllAdminNotificationsReadMutation,
} from '../../services/adminApiSlice.js';
import { SellerReviewModal } from './SellerReviewModal.jsx';
import { adminNotificationTarget } from './adminNotificationLinks.js';
import { AdminLoading, AdminError, AdminEmpty } from './AdminState.jsx';

export const NotificationsPage = () => {
    const navigate = useNavigate();
    const { data, isLoading, isError, error, refetch } = useGetAdminNotificationsQuery(undefined, { pollingInterval: 30000 });
    const [markRead] = useMarkAdminNotificationReadMutation();
    const [markAllRead, { isLoading: markingAll }] = useMarkAllAdminNotificationsReadMutation();
    const notifications = data?.data?.notifications || [];
    const unreadCount = data?.data?.unreadCount || 0;
    const [reviewingId, setReviewingId] = useState(null);

    const open = (n) => {
        if (!n.isRead) markRead(n.id);
        const target = adminNotificationTarget(n);
        if (target.sellerId) setReviewingId(target.sellerId);
        else if (target.to) navigate(target.to);
    };

    return (
        <div className="space-y-6">
            <Helmet><title>Notifications | Admin</title></Helmet>
            <div className="animate-fadeInUp flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><Bell size={22} className="text-[#001f3f]" /> Notifications</h1>
                    <p className="text-sm text-slate-500">All platform activity and alerts.</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllRead()}
                        disabled={markingAll}
                        className="flex w-fit items-center gap-1.5 rounded-full bg-[#001f3f] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#002a55] disabled:opacity-60"
                    >
                        <CheckCheck size={13} /> Mark all read ({unreadCount})
                    </button>
                )}
            </div>

            {isLoading ? (
                <AdminLoading label="Loading notifications..." />
            ) : isError ? (
                <AdminError error={error} onRetry={refetch} label="Failed to load notifications." />
            ) : notifications.length === 0 ? (
                <AdminEmpty icon={Bell} title="You're all caught up" text="New activity will appear here." />
            ) : (
                <div className="animate-fadeInUp divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ animationDelay: '100ms' }}>
                    {notifications.map((n) => (
                        <button key={n.id} onClick={() => open(n)} className={`block w-full p-4 text-left transition hover:bg-slate-50 ${!n.isRead ? 'bg-[#e6f2ff]/30' : ''}`}>
                            <p className="flex items-center gap-2 font-semibold text-slate-900">
                                {n.title}
                                {!n.isRead && <span className="h-2 w-2 rounded-full bg-[#001f3f]" />}
                            </p>
                            <p className="text-sm text-slate-500">{n.message}</p>
                            <p className="mt-1 text-xs text-slate-400">{n.time}</p>
                        </button>
                    ))}
                </div>
            )}

            {reviewingId && <SellerReviewModal sellerId={reviewingId} onClose={() => setReviewingId(null)} onDecided={() => setReviewingId(null)} />}
        </div>
    );
};