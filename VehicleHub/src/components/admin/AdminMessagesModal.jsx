import { useState } from 'react';
import { X, Send, ArrowLeft } from 'lucide-react';

export const AdminMessagesModal = ({ conversations, onClose }) => {
    const [convos, setConvos] = useState(conversations);
    const [activeId, setActiveId] = useState(conversations[0]?.id);
    const [draft, setDraft] = useState('');
    const [showList, setShowList] = useState(true);
    const active = convos.find((c) => c.id === activeId);

    const send = () => {
        if (!draft.trim() || !active) return;
        setConvos((prev) => prev.map((c) => c.id === active.id
            ? { ...c, messages: [...c.messages, { id: crypto.randomUUID(), sender: 'admin', text: draft, time: new Date().toISOString() }] }
            : c));
        setDraft('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative flex h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className={`w-full shrink-0 flex-col border-r border-slate-100 sm:flex sm:w-64 ${showList ? 'flex' : 'hidden'}`}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                        <h2 className="text-sm font-bold text-slate-900">Messages</h2>
                        <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 sm:hidden"><X size={16} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {convos.map((c) => {
                            const last = c.messages[c.messages.length - 1];
                            return (
                                <button key={c.id} onClick={() => { setActiveId(c.id); setShowList(false); }} className={`flex w-full items-center gap-3 border-b border-slate-50 p-3 text-left hover:bg-slate-50 ${activeId === c.id ? 'bg-[#e6f2ff]/40' : ''}`}>
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${c.avatarColor} text-sm font-bold text-white`}>{c.name[0]}</div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                                        <p className="truncate text-[11px] text-slate-400">{c.role} · {last.text}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={`flex min-w-0 flex-1 flex-col ${showList ? 'hidden sm:flex' : 'flex'}`}>
                    {active && (
                        <>
                            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
                                <button onClick={() => setShowList(true)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 sm:hidden"><ArrowLeft size={16} /></button>
                                <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${active.avatarColor} text-sm font-bold text-white`}>{active.name[0]}</div>
                                <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{active.name}</p><p className="text-xs text-slate-400">{active.role}</p></div>
                                <button onClick={onClose} className="ml-auto hidden rounded-full p-1.5 text-slate-400 hover:bg-slate-100 sm:block"><X size={17} /></button>
                            </div>
                            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4">
                                {active.messages.map((m) => (
                                    <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${m.sender === 'admin' ? 'rounded-br-sm bg-[#001f3f] text-white' : 'rounded-bl-sm bg-white text-slate-800 shadow-sm'}`}>{m.text}</div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 border-t border-slate-100 p-3">
                                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Reply..." className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:border-[#001f3f] focus:outline-none" />
                                <button type="submit" className="rounded-full bg-[#001f3f] p-2.5 text-white hover:bg-[#002a55]"><Send size={16} /></button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};