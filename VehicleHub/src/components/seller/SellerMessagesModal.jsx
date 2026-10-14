import { useEffect, useRef, useState } from 'react';
import { X, Send, ArrowLeft, Search } from 'lucide-react';

const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatDate = (iso) => new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });

export const SellerMessagesModal = ({ conversations, onClose }) => {
    const [convos, setConvos] = useState(conversations);
    const [activeId, setActiveId] = useState(conversations[0]?.id);
    const [draft, setDraft] = useState('');
    const [search, setSearch] = useState('');
    const [showListOnMobile, setShowListOnMobile] = useState(true);
    const scrollRef = useRef(null);
    const modalRef = useRef(null);

    const active = convos.find((c) => c.id === activeId);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [active?.messages?.length]);

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

    // Close on Escape key too
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const filteredConvos = convos.filter((c) =>
        [c.buyer, c.vehicle].some((f) => f.toLowerCase().includes(search.trim().toLowerCase()))
    );

    const selectConvo = (id) => {
        setActiveId(id);
        setShowListOnMobile(false);
    };

    const sendMessage = () => {
        const text = draft.trim();
        if (!text || !active) return;
        setConvos((prev) => prev.map((c) =>
            c.id === active.id
                ? { ...c, messages: [...c.messages, { id: crypto.randomUUID(), sender: 'seller', text, time: new Date().toISOString() }] }
                : c
        ));
        setDraft('');
    };

    return (
        <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-y-auto p-3 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

            <div
                ref={modalRef}
                className="relative flex h-[88vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:h-[38.75rem] sm:rounded-3xl"
            >
                {/* Inbox list */}
                <div className={`w-full shrink-0 flex-col border-r border-slate-200 bg-slate-50 sm:flex sm:w-64 md:w-72 ${showListOnMobile ? 'flex' : 'hidden'}`}>
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3.5 py-3 sm:px-4 sm:py-3.5">
                        <h2 className="text-sm font-bold text-slate-900">Messages</h2>
                        <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:hidden">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="border-b border-slate-200 bg-white p-3">
                        <div className="flex items-center gap-2 rounded-full border-2 border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-[#001f3f] focus-within:bg-white">
                            <Search size={14} className="shrink-0 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search customers"
                                className="w-full min-w-0 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredConvos.length === 0 ? (
                            <p className="p-4 text-center text-xs text-slate-400">No conversations found.</p>
                        ) : (
                            filteredConvos.map((c) => {
                                const last = c.messages[c.messages.length - 1];
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => selectConvo(c.id)}
                                        className={`flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left transition hover:bg-white ${activeId === c.id ? 'bg-[#e6f2ff]' : ''}`}
                                    >
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${c.avatarColor} text-sm font-bold text-white shadow-sm`}>
                                            {c.buyer[0]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">{c.buyer}</p>
                                            <p className="truncate text-xs text-slate-500">
                                                {last.sender === 'seller' ? 'You: ' : ''}{last.text}
                                            </p>
                                        </div>
                                        <div className="hidden shrink-0 text-right sm:block">
                                            <p className="text-[10px] text-slate-400">{formatDate(last.time)}</p>
                                            <p className="text-[10px] text-slate-400">{formatTime(last.time)}</p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Active chat */}
                <div className={`flex min-w-0 flex-1 flex-col bg-white ${showListOnMobile ? 'hidden sm:flex' : 'flex'}`}>
                    {active ? (
                        <>
                            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-3.5 py-3 sm:px-4 sm:py-3.5">
                                <div className="flex min-w-0 items-center gap-3">
                                    <button onClick={() => setShowListOnMobile(true)} className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:hidden">
                                        <ArrowLeft size={16} />
                                    </button>
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${active.avatarColor} text-sm font-bold text-white shadow-sm`}>
                                        {active.buyer[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-900">{active.buyer}</p>
                                        <p className="truncate text-xs text-slate-500">{active.vehicle}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="hidden shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:block">
                                    <X size={17} />
                                </button>
                            </div>

                            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3.5 py-4 sm:px-4">
                                {active.messages.map((msg, idx) => {
                                    const showDate = idx === 0 || formatDate(msg.time) !== formatDate(active.messages[idx - 1].time);
                                    return (
                                        <div key={msg.id}>
                                            {showDate && (
                                                <p className="my-2 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400">{formatDate(msg.time)}</p>
                                            )}
                                            <div className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm sm:max-w-[75%] ${msg.sender === 'seller'
                                                    ? 'rounded-br-sm bg-[#001f3f] text-white'
                                                    : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
                                                    }`}>
                                                    {msg.text}
                                                    <span className={`mt-1 block text-[10px] ${msg.sender === 'seller' ? 'text-white/60' : 'text-slate-400'}`}>
                                                        {formatTime(msg.time)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <form
                                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                                className="flex items-center gap-2 border-t border-slate-200 bg-white px-2.5 py-2.5 sm:px-3 sm:py-3"
                            >
                                <input
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    placeholder="Type a reply..."
                                    className="min-w-0 flex-1 rounded-full border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#001f3f] focus:bg-white focus:outline-none"
                                />
                                <button type="submit" className="shrink-0 rounded-full bg-[#001f3f] p-2.5 text-white transition hover:bg-[#002a55]" aria-label="Send">
                                    <Send size={16} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center bg-slate-50 p-6 text-center text-sm text-slate-400">
                            Select a conversation
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};