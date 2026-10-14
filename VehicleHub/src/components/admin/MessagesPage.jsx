// MessagesPage.jsx
import { Helmet } from 'react-helmet-async';
import { MessageSquare } from 'lucide-react';
import { adminConversations } from '../../data/adminMockData.js';

export const MessagesPage = () => (
    <div className="space-y-6">
        <Helmet><title>Messages | Admin</title></Helmet>
        <div className="animate-fadeInUp">
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><MessageSquare size={22} className="text-[#001f3f]" /> Messages</h1>
            <p className="text-sm text-slate-500">Conversations with sellers and buyers.</p>
        </div>
        <div className="animate-fadeInUp divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ animationDelay: '100ms' }}>
            {adminConversations.map((c) => {
                const last = c.messages[c.messages.length - 1];
                return (
                    <div key={c.id} className="flex items-center gap-3 p-4 transition hover:bg-slate-50">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${c.avatarColor} text-sm font-bold text-white`}>{c.name[0]}</div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900">{c.name} <span className="ml-1 text-xs font-normal text-slate-400">· {c.role}</span></p>
                            <p className="truncate text-sm text-slate-500">{last.text}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);