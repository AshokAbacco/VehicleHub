// VehicleHub/VehicleHub/src/components/admin/AdminMessagesModal.jsx
// Admin chat window: real conversations (GET /api/admin/conversations), replies are saved.
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { X, Send, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import {
    useGetAdminConversationsQuery,
    useSendAdminMessageMutation,
    useMarkAdminConversationReadMutation,
} from '../../services/adminApiSlice.js';

// Avatar colours live in the frontend so Tailwind always generates these classes
const AVATAR_COLORS = ['from-[#001f3f] to-[#2d6cdf]', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-violet-500 to-purple-600', 'from-rose-500 to-pink-600'];
export const avatarColorFor = (key = '') => AVATAR_COLORS[[...String(key)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 0) % AVATAR_COLORS.length];

const timeLabel = (t) => (t ? new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '');

export const AdminMessagesModal = ({ onClose, initialConversationId }) => {
    const { data, isLoading } = useGetAdminConversationsQuery(undefined, { pollingInterval: 15000 });
    const [sendMessage, { isLoading: sending }] = useSendAdminMessageMutation();
    const [markRead] = useMarkAdminConversationReadMutation();
    const convos = useMemo(() => data?.data?.conversations || [], [data]);
    const [activeId, setActiveId] = useState(initialConversationId || null);
    const [draft, setDraft] = useState('');
    const [showList, setShowList] = useState(!initialConversationId);
    const bottomRef = useRef(null);
    const active = convos.find((c) => c.id === activeId) || (activeId ? null : convos[0]);

    // Mark the open conversation as read
    useEffect(() => {
        if (active?.id && active.unread > 0) markRead(active.id);
    }, [active?.id, active?.unread, markRead]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: 'end' });
    }, [active?.id, active?.messages?.length]);

    const send = async () => {
        const text = draft.trim();
        if (!text || !active) return;
        try {
            await sendMessage({ conversationId: active.id, text }).unwrap();
            setDraft('');
        } catch (err) {
            toast.error(err?.data?.message || 'Message not sent');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative flex h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className={`w-full shrink-0 flex-col border-r border-slate-100 sm:flex sm:w-64 ${showList ? 'flex' : 'hidden'}`}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                        <h2 className="text-sm font-bold text-slate-900">Messages</h2>
                        <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 sm:hidden" aria-label="Close"><X size={16} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex h-24 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-[#001f3f]" /></div>
                        ) : convos.length === 0 ? (
                            <p className="p-6 text-center text-sm text-slate-400">No conversations yet.</p>
                        ) : (
                            convos.map((c) => {
                                const last = c.messages[c.messages.length - 1];
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => { setActiveId(c.id); setShowList(false); }}
                                        className={`flex w-full items-center gap-3 border-b border-slate-50 p-3 text-left hover:bg-slate-50 ${active?.id === c.id ? 'bg-[#e6f2ff]/40' : ''}`}
                                    >
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColorFor(c.userId || c.id)} text-sm font-bold text-white`}>{c.name?.[0]?.toUpperCase()}</div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                                            <p className="truncate text-[11px] text-slate-400">{c.role} · {last?.text || 'No messages yet'}</p>
                                        </div>
                                        {c.unread > 0 && (
                                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#001f3f] px-1 text-[10px] font-bold text-white">{c.unread}</span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className={`flex min-w-0 flex-1 flex-col ${showList ? 'hidden sm:flex' : 'flex'}`}>
                    {active ? (
                        <>
                            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
                                <button onClick={() => setShowList(true)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 sm:hidden" aria-label="Back"><ArrowLeft size={16} /></button>
                                <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${avatarColorFor(active.userId || active.id)} text-sm font-bold text-white`}>{active.name?.[0]?.toUpperCase()}</div>
                                <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{active.name}</p><p className="text-xs text-slate-400">{active.role}</p></div>
                                <button onClick={onClose} className="ml-auto hidden rounded-full p-1.5 text-slate-400 hover:bg-slate-100 sm:block" aria-label="Close"><X size={17} /></button>
                            </div>
                            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4">
                                {active.messages.map((m) => (
                                    <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${m.sender === 'admin' ? 'rounded-br-sm bg-[#001f3f] text-white' : 'rounded-bl-sm bg-white text-slate-800 shadow-sm'}`}>
                                            <p className="whitespace-pre-line break-words">{m.text}</p>
                                            <p className={`mt-1 text-[10px] ${m.sender === 'admin' ? 'text-white/60' : 'text-slate-400'}`}>{timeLabel(m.time)}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 border-t border-slate-100 p-3">
                                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Reply..." className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-[#001f3f] focus:outline-none" />
                                <button type="submit" disabled={sending || !draft.trim()} className="rounded-full bg-[#001f3f] p-2.5 text-white hover:bg-[#002a55] disabled:opacity-50" aria-label="Send">
                                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-slate-400">
                            <MessageSquare size={24} />
                            <p className="text-sm">Select a conversation</p>
                            <button onClick={onClose} className="mt-2 hidden rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:block">Close</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};