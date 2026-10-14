import { useEffect, useRef, useState } from 'react';
import { X, ShoppingCart, MessageCircle, CheckCircle2, CalendarCheck, CreditCard, XCircle, Bell } from 'lucide-react';

const typeConfig = {
    purchase_request: { icon: ShoppingCart, color: 'bg-fuchsia-50 text-fuchsia-600 ring-1 ring-fuchsia-200', dot: 'bg-fuchsia-500', label: 'Purchase request' },
    message: { icon: MessageCircle, color: 'bg-sky-50 text-sky-600 ring-1 ring-sky-200', dot: 'bg-sky-500', label: 'Message' },
    approval: { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200', dot: 'bg-emerald-500', label: 'Approval' },
    inspection: { icon: CalendarCheck, color: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200', dot: 'bg-amber-500', label: 'Inspection' },
    payment: { icon: CreditCard, color: 'bg-violet-50 text-violet-600 ring-1 ring-violet-200', dot: 'bg-violet-500', label: 'Payment' },
    rejection: { icon: XCircle, color: 'bg-red-50 text-red-600 ring-1 ring-red-200', dot: 'bg-red-500', label: 'Rejection' },
};

const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'purchase_request', label: 'Purchase requests' },
    { id: 'message', label: 'Messages' },
];

export const NotificationsModal = ({ notifications, onClose, onMarkAllRead }) => {
    const [filter, setFilter] = useState('all');
    const [items, setItems] = useState(notifications);
    const modalRef = useRef(null);

    // Lock background scroll while modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const filtered = items.filter((n) => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    const unreadCount = items.filter((n) => !n.read).length;

    const markRead = (id) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const markAll = () => {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        onMarkAllRead?.();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-y-auto p-3 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

            <div
                ref={modalRef}
                className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl"
            >
                {/* Header with a subtle colorful gradient strip */}
                <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-[#001f3f] via-[#0a2f5c] to-[#001f3f] px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
                                <Bell size={17} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white">Notifications</h2>
                                {unreadCount > 0 && (
                                    <p className="text-[11px] font-medium text-white/60">{unreadCount} unread</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={markAll} className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white">
                                Mark all read
                            </button>
                            <button onClick={onClose} className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Close">
                                <X size={17} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50/50 px-5 py-3 [&::-webkit-scrollbar]:hidden">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${filter === tab.id
                                ? 'bg-[#001f3f] text-white shadow-sm'
                                : 'border border-slate-200 bg-white text-slate-500 hover:border-[#001f3f]/30 hover:text-slate-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notification list */}
                <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 p-10 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                                <Bell size={22} />
                            </div>
                            <p className="text-sm text-slate-400">No notifications here.</p>
                        </div>
                    ) : (
                        filtered.map((n) => {
                            const config = typeConfig[n.type] || typeConfig.message;
                            const Icon = config.icon;
                            return (
                                <button
                                    key={n.id}
                                    onClick={() => markRead(n.id)}
                                    className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50 ${!n.read ? 'bg-[#f0f7ff]' : ''}`}
                                >
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.color}`}>
                                        <Icon size={17} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-bold text-slate-900">{n.title}</p>
                                            {!n.read && <span className={`h-2 w-2 shrink-0 rounded-full ${config.dot}`} />}
                                        </div>
                                        <p className="mt-0.5 text-xs text-slate-500">{n.description}</p>
                                        <p className="mt-1 text-[11px] font-medium text-slate-400">{n.time}</p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};