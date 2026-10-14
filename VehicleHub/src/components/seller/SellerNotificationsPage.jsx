import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    Bell, CheckCircle2, XCircle, ShoppingBag, MessageCircleQuestion, Clock,
    Loader2, Trash2, CheckCheck,
} from 'lucide-react';
import {
    useGetSellerNotificationsQuery,
    useMarkSellerNotificationReadMutation,
    useMarkAllSellerNotificationsReadMutation,
    useDeleteSellerNotificationMutation,
} from '../../services/sellerApiSlice.js';

const typeMeta = {
    SELLER_STATUS: { icon: CheckCircle2, bg: 'bg-[#e6f2ff]', color: 'text-[#001f3f]' },
    VEHICLE_APPROVED: { icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    VEHICLE_REJECTED: { icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' },
    VEHICLE_UNDER_VERIFICATION: { icon: Clock, bg: 'bg-blue-50', color: 'text-blue-600' },
    VEHICLE_SOLD: { icon: ShoppingBag, bg: 'bg-purple-50', color: 'text-purple-600' },
    INQUIRY: { icon: MessageCircleQuestion, bg: 'bg-cyan-50', color: 'text-cyan-600' },
    GENERAL: { icon: Bell, bg: 'bg-slate-100', color: 'text-slate-500' },
};

const timeAgo = (date) => {
    const diffMs = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const SellerNotificationsPage = () => {
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetSellerNotificationsQuery(undefined, { pollingInterval: 15000 });
    const [markRead] = useMarkSellerNotificationReadMutation();
    const [markAllRead, { isLoading: markingAll }] = useMarkAllSellerNotificationsReadMutation();
    const [deleteNotification] = useDeleteSellerNotificationMutation();

    const notifications = data?.data?.notifications || [];
    const unreadCount = data?.data?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

    const handleClick = (n) => {
        if (!n.isRead) markRead(n.id);
        if (n.link) navigate(n.link);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteNotification(id).unwrap();
            toast.success('Notification removed');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete');
        }
    };

    return (
        <div className="space-y-6">
            <Helmet><title>Notifications | VehicleHub Seller</title></Helmet>

            {/* Gradient hero header */}
            <div className="animate-fadeInUp relative overflow-hidden rounded-2xl bg-linear-to-br from-[#001f3f] via-[#002a55] to-[#003d7a] p-6 shadow-lg shadow-[#001f3f]/20 sm:p-7">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-white/5" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                            <Bell size={13} /> Seller Panel
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Notifications</h1>
                        <p className="mt-1 text-sm text-white/70">Updates on your listings, sales, and buyer activity.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <span className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm">
                                {unreadCount} unread
                            </span>
                        )}
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllRead()}
                                disabled={markingAll}
                                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#001f3f] shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
                            >
                                {markingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Notification list */}
            <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex h-56 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" />
                    </div>
                ) : isError ? (
                    <div className="flex h-56 flex-col items-center justify-center gap-2 text-red-500">
                        <XCircle size={22} />
                        <p className="text-sm font-medium">Failed to load notifications.</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex h-56 flex-col items-center justify-center gap-2 text-slate-400">
                        <Bell size={26} />
                        <p className="text-sm font-medium">You're all caught up.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((n, idx) => {
                            const meta = typeMeta[n.type] || typeMeta.GENERAL;
                            const Icon = meta.icon;
                            return (
                                <div
                                    key={n.id}
                                    onClick={() => handleClick(n)}
                                    style={{ animationDelay: `${Math.min(idx, 10) * 40}ms` }}
                                    className={`group animate-fadeInUp flex w-full items-start gap-3.5 p-4 text-left transition-colors duration-150 hover:bg-slate-50 sm:p-5 ${!n.isRead ? 'bg-[#f7fbff]' : ''
                                        }`}
                                >
                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color} transition-transform duration-200 group-hover:scale-105`}>
                                        <Icon size={17} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`truncate text-sm ${!n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                                {n.title}
                                            </p>
                                            {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-[#001f3f]" />}
                                        </div>
                                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</p>
                                        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                            <Clock size={10} /> {timeAgo(n.createdAt)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, n.id)}
                                        className="shrink-0 rounded-lg p-1.5 text-slate-300 transition-all duration-150 hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                                        aria-label="Delete notification"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};