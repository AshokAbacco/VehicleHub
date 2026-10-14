import { Helmet } from 'react-helmet-async';
import {
    Bell, CheckCircle2, Clock, XCircle, AlertTriangle, Loader2, UserCheck, PlayCircle, FileCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    useGetNotificationsQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
} from '../../services/fieldInspectorApiSlice.js';

const iconFor = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('assigned')) return { icon: Bell, bg: 'bg-[#e6f2ff]', color: 'text-[#001f3f]' };
    if (t.includes('reject')) return { icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' };
    if (t.includes('correction')) return { icon: AlertTriangle, bg: 'bg-amber-50', color: 'text-amber-600' };
    if (t.includes('accept')) return { icon: UserCheck, bg: 'bg-blue-50', color: 'text-blue-600' };
    if (t.includes('start')) return { icon: PlayCircle, bg: 'bg-[#e6f2ff]', color: 'text-[#001f3f]' };
    if (t.includes('submit') || t.includes('verified') || t.includes('passed')) return { icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' };
    return { icon: Clock, bg: 'bg-slate-100', color: 'text-slate-500' };
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

export const FieldInspectorNotifications = () => {
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetNotificationsQuery(undefined, { pollingInterval: 15000 });
    const [markRead] = useMarkNotificationReadMutation();
    const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

    const notifications = data?.data?.notifications || [];
    const unreadCount = data?.data?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

    const handleClick = (n) => {
        if (!n.isRead) markRead(n.id);
        if (n.inspectionId) navigate(`/field-inspector/inspections/${n.inspectionId}`);
    };

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>Notifications | VehicleHub Inspector</title></Helmet>

            <div className="animate-fadeInUp flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#001f3f]">Field Inspector</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Notifications</h1>
                    <p className="mt-1 text-sm text-slate-500">Updates on your assignments and reports.</p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <span className="rounded-full bg-[#e6f2ff] px-3 py-1.5 text-xs font-bold text-[#001f3f]">
                            {unreadCount} unread
                        </span>
                    )}
                    {notifications.some((n) => !n.isRead) && (
                        <button
                            onClick={() => markAllRead()}
                            disabled={markingAll}
                            className="flex items-center gap-1.5 rounded-full border border-[#001f3f]/20 bg-[#e6f2ff] px-3.5 py-2 text-xs font-semibold text-[#001f3f] transition hover:bg-[#d5eaff] disabled:opacity-60"
                        >
                            {markingAll ? <Loader2 size={13} className="animate-spin" /> : <FileCheck size={13} />}
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            <div className="animate-fadeInUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex h-48 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" />
                    </div>
                ) : isError ? (
                    <div className="flex h-48 flex-col items-center justify-center gap-2 text-red-500">
                        <XCircle size={22} />
                        <p className="text-sm font-medium">Failed to load notifications.</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-400">
                        <Bell size={24} />
                        <p className="text-sm font-medium">You're all caught up.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((n) => {
                            const meta = iconFor(n.title);
                            const Icon = meta.icon;
                            return (
                                <button
                                    key={n.id}
                                    onClick={() => handleClick(n)}
                                    className={`group flex w-full items-start gap-3.5 p-4 text-left transition hover:bg-slate-50 sm:p-5 ${!n.isRead ? 'bg-[#f7fbff]' : ''}`}
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
                                        <p className="mt-1.5 text-[11px] font-medium text-slate-400">{timeAgo(n.createdAt)}</p>
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