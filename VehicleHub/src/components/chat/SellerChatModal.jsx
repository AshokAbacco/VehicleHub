import { useEffect, useRef, useState } from 'react';
import { X, Send, Phone, Flag, ShieldCheck, Paperclip, Mic, Search } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

const quickReplies = ['Is this still available?', 'What\'s the best price?', 'Can I schedule a test drive?', 'Please share more photos'];

const inboxKey = 'vh_chat_inbox'; // list of { vehicleId, title, image, price, sellerName, lastMessage, lastSender, time }
const threadKey = (vehicleId) => `vh_chat_${vehicleId}`;

const loadInbox = () => {
    try {
        const raw = localStorage.getItem(inboxKey);
        if (!raw) return [];
        return JSON.parse(raw).map((c) => ({ ...c, time: new Date(c.time) }));
    } catch {
        return [];
    }
};

const saveInbox = (list) => {
    try {
        localStorage.setItem(inboxKey, JSON.stringify(list));
    } catch { /* fail silently */ }
};

const loadThread = (vehicleId) => {
    try {
        const raw = localStorage.getItem(threadKey(vehicleId));
        if (!raw) return null;
        return JSON.parse(raw).map((m) => ({ ...m, time: new Date(m.time) }));
    } catch {
        return null;
    }
};

const saveThread = (vehicleId, messages) => {
    try {
        localStorage.setItem(threadKey(vehicleId), JSON.stringify(messages));
    } catch { /* fail silently */ }
};

const upsertInboxEntry = (vehicle, lastMessage, lastSender, time) => {
    const list = loadInbox();
    const idx = list.findIndex((c) => c.vehicleId === vehicle.id);
    const entry = {
        vehicleId: vehicle.id,
        title: vehicle.title,
        image: vehicle.images?.[0] || vehicle.image,
        price: vehicle.price,
        sellerName: vehicle.sellerName,
        lastMessage,
        lastSender,
        time,
    };
    if (idx >= 0) list[idx] = entry;
    else list.unshift(entry);
    saveInbox(list);
    return list;
};

export const SellerChatModal = ({ vehicle, onClose }) => {
    const [inbox, setInbox] = useState(() => loadInbox());
    const [activeVehicleId, setActiveVehicleId] = useState(vehicle.id);
    const [showInboxOnMobile, setShowInboxOnMobile] = useState(false);
    const [messages, setMessages] = useState(() => {
        const existing = loadThread(vehicle.id);
        if (existing?.length) return existing;
        return [{ id: 'm1', sender: 'buyer', text: `Hi, I am interested in your ad for the ${vehicle.title}.`, time: new Date() }];
    });
    const [draft, setDraft] = useState('');
    const [sellerTyping, setSellerTyping] = useState(false);
    const scrollRef = useRef(null);

    // The vehicle data for whichever conversation is active (could differ from the one this modal was opened for)
    const activeVehicle = activeVehicleId === vehicle.id
        ? vehicle
        : inbox.find((c) => c.vehicleId === activeVehicleId) || vehicle;

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, sellerTyping]);

    // Seed the inbox with this vehicle's thread on first open
    useEffect(() => {
        const last = messages[messages.length - 1];
        const updated = upsertInboxEntry(vehicle, last.text, last.sender, last.time);
        setInbox(updated);
        saveThread(vehicle.id, messages);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const switchConversation = (vehicleId) => {
        setActiveVehicleId(vehicleId);
        const thread = loadThread(vehicleId);
        setMessages(thread?.length ? thread : []);
        setShowInboxOnMobile(false);
    };

    const sendMessage = (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const buyerMsg = { id: crypto.randomUUID(), sender: 'buyer', text: trimmed, time: new Date() };
        const next = [...messages, buyerMsg];
        setMessages(next);
        saveThread(activeVehicleId, next);
        setInbox(upsertInboxEntry(activeVehicle, trimmed, 'buyer', buyerMsg.time));
        setDraft('');

    };

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative flex h-[88vh] w-full max-w-3xl overflow-hidden rounded-t-[28px] border border-white/10 bg-slate-900 shadow-2xl sm:h-[620px] sm:rounded-[28px]">

                {/* LEFT — Inbox list */}
                <div className={`w-full shrink-0 flex-col border-r border-white/10 bg-slate-950/60 sm:flex sm:w-72 ${showInboxOnMobile ? 'flex' : 'hidden'}`}>
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
                        <h2 className="text-sm font-bold text-white">Inbox</h2>
                        <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-white/5 hover:text-white sm:hidden">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="border-b border-white/10 p-3">
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900 px-3 py-2">
                            <Search size={14} className="text-slate-500" />
                            <input placeholder="Search chats" className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {inbox.length === 0 ? (
                            <p className="p-4 text-center text-xs text-slate-500">No conversations yet.</p>
                        ) : (
                            inbox.map((conv) => (
                                <button
                                    key={conv.vehicleId}
                                    onClick={() => switchConversation(conv.vehicleId)}
                                    className={`flex w-full items-center gap-3 border-b border-white/5 p-3 text-left transition hover:bg-white/5 ${activeVehicleId === conv.vehicleId ? 'bg-cyan-500/10' : ''
                                        }`}
                                >
                                    <img src={conv.image} alt={conv.title} className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-white">{conv.title}</p>
                                        <p className="truncate text-xs text-slate-400">
                                            {conv.lastSender === 'buyer' ? 'You: ' : ''}{conv.lastMessage}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-[10px] text-slate-500">
                                        {conv.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT — Active conversation */}
                <div className={`flex min-w-0 flex-1 flex-col ${showInboxOnMobile ? 'hidden sm:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/60 px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                onClick={() => setShowInboxOnMobile(true)}
                                className="rounded-full p-1.5 text-slate-400 hover:bg-white/5 hover:text-white sm:hidden"
                                aria-label="Back to inbox"
                            >
                                <X size={16} className="rotate-45" />
                            </button>
                            <div className="relative shrink-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 text-sm font-bold text-white">
                                    {activeVehicle.sellerName?.[0] || 'S'}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="flex items-center gap-1 truncate text-sm font-semibold text-white">
                                    {activeVehicle.sellerName}
                                    <ShieldCheck size={13} className="shrink-0 text-cyan-400" />
                                </p>
                                <p className="truncate text-xs text-emerald-400">Online · Usually replies in 10 min</p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <a
                                href={activeVehicle.mobileNumber ? `tel:${activeVehicle.mobileNumber}` : undefined}
                                className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                                aria-label="Call seller"
                            >
                                <Phone size={16} />
                            </a>
                            <button className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Report">
                                <Flag size={16} />
                            </button>
                            <button onClick={onClose} className="hidden rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white sm:block" aria-label="Close chat">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Listing strip */}
                    <div className="flex items-center gap-3 border-b border-white/10 bg-slate-900/80 px-4 py-2.5">
                        <img src={activeVehicle.images?.[0] || activeVehicle.image} alt={activeVehicle.title} className="h-10 w-14 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-slate-200">{activeVehicle.title}</p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-cyan-300">{formatCurrency(activeVehicle.price)}</p>
                    </div>

                    <div className="bg-amber-500/10 px-4 py-2 text-center text-xs font-medium text-amber-300">
                        Never pay in advance. Meet, inspect, then pay.
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-950/30 px-4 py-4">
                        <p className="text-center text-[11px] uppercase tracking-widest text-slate-500">
                            {messages.length > 1 ? 'Conversation' : 'Today'}
                        </p>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.sender === 'buyer'
                                        ? 'rounded-br-sm bg-cyan-500 text-white'
                                        : 'rounded-bl-sm bg-slate-800 text-slate-100'
                                        }`}
                                >
                                    {msg.text}
                                    <span className={`mt-1 block text-[10px] ${msg.sender === 'buyer' ? 'text-cyan-100/80' : 'text-slate-400'}`}>
                                        {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {sellerTyping && (
                            <div className="flex justify-start">
                                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-slate-800 px-4 py-3">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick replies */}
                    <div className="flex gap-2 overflow-x-auto border-t border-white/10 bg-slate-900/80 px-4 py-2.5 [&::-webkit-scrollbar]:hidden">
                        {quickReplies.map((reply) => (
                            <button
                                key={reply}
                                onClick={() => sendMessage(reply)}
                                className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-400/40 hover:text-cyan-300"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); sendMessage(draft); }}
                        className="flex items-center gap-2 border-t border-white/10 bg-slate-950/60 px-3 py-3"
                    >
                        <button type="button" className="shrink-0 rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Attach file">
                            <Paperclip size={18} />
                        </button>
                        <input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Type a message"
                            className="flex-1 rounded-full border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                        />
                        {draft.trim() ? (
                            <button type="submit" className="shrink-0 rounded-full bg-cyan-500 p-2.5 text-white hover:bg-cyan-400" aria-label="Send message">
                                <Send size={16} />
                            </button>
                        ) : (
                            <button type="button" className="shrink-0 rounded-full p-2.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Record voice message">
                                <Mic size={18} />
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};