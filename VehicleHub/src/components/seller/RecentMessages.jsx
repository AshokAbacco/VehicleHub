import { useState } from 'react';
import { X, Search, Send } from 'lucide-react';

const mono = { fontFamily: "'JetBrains Mono', monospace" };

const initials = (name) => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export const RecentMessages = ({ isOpen, onClose, conversations = [] }) => {
    const [threads, setThreads] = useState(conversations);
    const [activeId, setActiveId] = useState(conversations[0]?.id ?? null);
    const [draft, setDraft] = useState('');
    const [query, setQuery] = useState('');

    if (!isOpen) return null;

    const active = threads.find((t) => t.id === activeId) || threads[0];
    const filtered = threads.filter((t) => t.buyer.toLowerCase().includes(query.toLowerCase()));

    const openThread = (id) => {
        setActiveId(id);
        setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
    };

    const sendReply = () => {
        if (!draft.trim() || !active) return;
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString([], { day: 'numeric', month: 'short' });
        setThreads((prev) =>
            prev.map((t) =>
                t.id === active.id
                    ? { ...t, thread: [...t.thread, { id: t.thread.length + 1, sender: 'seller', text: draft.trim(), date, time }] }
                    : t
            )
        );
        setDraft('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex h-[80vh] w-full max-w-4xl overflow-hidden border border-[#2A2D34] bg-[#101216] shadow-2xl shadow-black/50"
            >
                {/* conversation list */}
                <div className="flex w-full max-w-xs flex-col border-r border-[#2A2D34]">
                    <div className="flex items-center justify-between border-b border-[#2A2D34] px-4 py-4">
                        <h2 className="text-base font-semibold text-[#EDEBE4]">Inbox</h2>
                        <button onClick={onClose} className="text-[#90939B] hover:text-[#EDEBE4] sm:hidden"><X size={18} /></button>
                    </div>
                    <div className="flex items-center gap-2 border-b border-[#2A2D34] px-4 py-3">
                        <Search size={14} className="text-[#90939B]" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search buyers..."
                            className="w-full bg-transparent text-sm text-[#EDEBE4] placeholder:text-[#90939B] focus:outline-none"
                        />
                    </div>
                    <div className="flex-1 divide-y divide-[#2A2D34] overflow-y-auto">
                        {filtered.map((t) => {
                            const last = t.thread[t.thread.length - 1];
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => openThread(t.id)}
                                    className={`flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-[#15171C] ${active?.id === t.id ? 'bg-[#15171C]' : ''}`}
                                >
                                    <span style={mono} className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#2A2D34] text-xs text-[#C7A159]">
                                        {initials(t.buyer)}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center justify-between gap-2">
                                            <span className="truncate text-sm font-semibold text-[#EDEBE4]">{t.buyer}</span>
                                            {t.unread > 0 && (
                                                <span style={mono} className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C7A159] px-1 text-[10px] font-semibold text-[#0A0B0D]">
                                                    {t.unread}
                                                </span>
                                            )}
                                        </span>
                                        <span className="mt-0.5 block truncate text-xs text-[#90939B]">{t.vehicle}</span>
                                        <span className="mt-1 block truncate text-xs text-[#90939B]">{last?.text}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* active thread */}
                <div className="flex flex-1 flex-col">
                    <div className="flex items-center justify-between border-b border-[#2A2D34] px-5 py-4">
                        <div>
                            <p className="text-sm font-semibold text-[#EDEBE4]">{active?.buyer}</p>
                            <p style={mono} className="text-[11px] uppercase tracking-[0.15em] text-[#90939B]">{active?.vehicle}</p>
                        </div>
                        <button onClick={onClose} className="text-[#90939B] hover:text-[#EDEBE4]"><X size={18} /></button>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                        {active?.thread.map((m) => (
                            <div key={m.id} className={`flex ${m.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] border px-4 py-2.5 text-sm ${m.sender === 'seller' ? 'border-[#C7A159]/40 bg-[#C7A159]/10 text-[#EDEBE4]' : 'border-[#2A2D34] bg-[#15171C] text-[#EDEBE4]'}`}>
                                    <p>{m.text}</p>
                                    <p style={mono} className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-[#90939B]">{m.date} · {m.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 border-t border-[#2A2D34] px-5 py-4">
                        <input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                            placeholder="Type a reply..."
                            className="flex-1 border border-[#2A2D34] bg-[#0A0B0D] px-4 py-2.5 text-sm text-[#EDEBE4] placeholder:text-[#90939B] focus:border-[#C7A159] focus:outline-none"
                        />
                        <button
                            onClick={sendReply}
                            className="flex h-10 w-10 items-center justify-center border border-[#C7A159] bg-[#C7A159] text-[#0A0B0D] transition hover:bg-transparent hover:text-[#C7A159]"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};