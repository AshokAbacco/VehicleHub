import { useState } from 'react';
import { X, MessageCircle, ShoppingCart, CheckCircle2, Info, AlertTriangle, BellOff } from 'lucide-react';

const mono = { fontFamily: "'JetBrains Mono', monospace" };

const typeMeta = {
    buy_request: { icon: ShoppingCart, color: '#C7A159' },
    message: { icon: MessageCircle, color: '#6C93B8' },
    success: { icon: CheckCircle2, color: '#4FA695' },
    info: { icon: Info, color: '#6C93B8' },
    warning: { icon: AlertTriangle, color: '#D9A441' },
};

export const NotificationsPanel = ({ isOpen, onClose, notifications = [] }) => {
    const [items, setItems] = useState(notifications);

    if (!isOpen) return null;

    const unreadCount = items.filter((n) => !n.read).length;
    const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    const markRead = (id) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-24 backdrop-blur-sm sm:items-start sm:justify-end sm:pr-8" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md border border-[#2A2D34] bg-[#101216] shadow-2xl shadow-black/50"
            >
                <div className="flex items-center justify-between border-b border-[#2A2D34] px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-[#EDEBE4]">Notifications</h2>
                        <p style={mono} className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-[#90939B]">{unreadCount} unread</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={markAllRead} style={mono} className="text-[11px] uppercase tracking-[0.2em] text-[#C7A159] hover:underline">Mark all read</button>
                        <button onClick={onClose} className="text-[#90939B] hover:text-[#EDEBE4]"><X size={18} /></button>
                    </div>
                </div>

                <div className="max-h-[70vh] divide-y divide-[#2A2D34] overflow-y-auto">
                    {items.length === 0 && (
                        <div className="flex flex-col items-center gap-2 py-14 text-[#90939B]">
                            <BellOff size={22} />
                            <p className="text-sm">You're all caught up</p>
                        </div>
                    )}
                    {items.map((n) => {
                        const meta = typeMeta[n.type] || typeMeta.info;
                        const Icon = meta.icon;
                        return (
                            <button
                                key={n.id}
                                onClick={() => markRead(n.id)}
                                className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-[#15171C] ${!n.read ? 'bg-[#15171C]' : ''}`}
                            >
                                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-[#2A2D34]" style={{ color: meta.color }}>
                                    <Icon size={16} />
                                </span>
                                <span className="flex-1">
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold text-[#EDEBE4]">{n.title}</span>
                                        {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#C7A159]" />}
                                    </span>
                                    <span className="mt-1 block text-sm text-[#90939B]">{n.description}</span>
                                    <span style={mono} className="mt-1.5 block text-[11px] uppercase tracking-[0.15em] text-[#90939B]/70">{n.time}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

