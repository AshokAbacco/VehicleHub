import { Helmet } from 'react-helmet-async';
import { Bell, CheckCircle2, Clock, Loader2, PackageCheck, ShieldAlert, Sparkles, XCircle } from 'lucide-react';
import {
    useGetBuyerNotificationsQuery,
    useMarkBuyerNotificationReadMutation,
    useMarkAllBuyerNotificationsReadMutation,
} from '../../services/buyerApiSlice.js';

const iconFor = (notification = {}) => {
    const text = `${notification.title || ''} ${notification.type || ''}`.toLowerCase();
    if (text.includes('offer') || text.includes('purchase') || text.includes('order')) return { icon: PackageCheck, bg: 'bg-emerald-50', color: 'text-emerald-600' };
    if (text.includes('reject') || text.includes('declin') || text.includes('cancel')) return { icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' };
    if (text.includes('security') || text.includes('alert')) return { icon: ShieldAlert, bg: 'bg-amber-50', color: 'text-amber-600' };
    if (text.includes('success') || text.includes('accept') || text.includes('verified')) return { icon: CheckCircle2, bg: 'bg-blue-50', color: 'text-blue-600' };
    if (text.includes('welcome') || text.includes('update')) return { icon: Sparkles, bg: 'bg-[#e6f2ff]', color: 'text-[#001f3f]' };
    return { icon: Bell, bg: 'bg-slate-100', color: 'text-slate-500' };
};

const timeAgo = (date) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const BuyerNotification = () => {
    const { data, isLoading, isError } = useGetBuyerNotificationsQuery(undefined, { pollingInterval: 15000 });
    const [markRead] = useMarkBuyerNotificationReadMutation();
    const [markAllRead, { isLoading: markingAll }] = useMarkAllBuyerNotificationsReadMutation();
    const notifications = data?.data?.notifications || [];
    const unreadCount = data?.data?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>Notifications | VehicleHub Buyer</title></Helmet>

            <div className="animate-fadeInUp flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#001f3f]">Buyer centre</p>
                    <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Notifications</h1>
                    <p className="mt-1 text-sm text-slate-500">Stay updated on your requests, vehicles, and account.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#e6f2ff] px-3 py-1.5 text-xs font-bold text-[#001f3f]">
                        <Bell size={13} /> {unreadCount} unread
                    </span>
                    {unreadCount > 0 && <button onClick={() => markAllRead()} disabled={markingAll} className="rounded-full bg-[#001f3f] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">Mark all read</button>}
                </div>
            </div>

            <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                ) : isError ? (
                    <div className="flex h-48 flex-col items-center justify-center gap-2 text-red-500"><XCircle size={22} /><p className="text-sm font-medium">Failed to load notifications.</p></div>
                ) : notifications.length === 0 ? (
                    <div className="flex h-56 flex-col items-center justify-center gap-3 text-slate-400">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100"><Bell size={23} /></span>
                        <div className="text-center"><p className="text-sm font-semibold text-slate-600">You&apos;re all caught up</p><p className="mt-1 text-xs text-slate-400">New updates will appear here.</p></div>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((notification) => {
                            const meta = iconFor(notification);
                            const Icon = meta.icon;
                            const message = notification.body || notification.message || 'You have a new update.';
                            return (
                                <button key={notification.id} onClick={() => !notification.isRead && markRead(notification.id)} className={`group flex w-full items-start gap-3.5 p-4 text-left transition hover:bg-slate-50 sm:p-5 ${!notification.isRead ? 'bg-[#f7fbff]' : ''}`}>
                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color} transition-transform duration-200 group-hover:scale-105`}><Icon size={17} /></span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2"><p className="truncate text-sm font-bold text-slate-900">{notification.title || 'Notification'}</p>{!notification.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-[#001f3f]" />}</div>
                                        <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">{message}</p>
                                        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-slate-400"><Clock size={11} /> {notification.createdAt ? timeAgo(notification.createdAt) : notification.time || 'Recently'}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export { BuyerNotification as BuyerNotifications };
