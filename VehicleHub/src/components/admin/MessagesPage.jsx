// VehicleHub/VehicleHub/src/components/admin/MessagesPage.jsx
// Admin conversations with sellers and buyers (real data); click one to open the chat.
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageSquare } from 'lucide-react';
import { useGetAdminConversationsQuery } from '../../services/adminApiSlice.js';
import { AdminMessagesModal, avatarColorFor } from './AdminMessagesModal.jsx';
import { AdminLoading, AdminError, AdminEmpty } from './AdminState.jsx';

const when = (t) => (t ? new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '');

export const MessagesPage = () => {
    const { data, isLoading, isError, error, refetch } = useGetAdminConversationsQuery(undefined, { pollingInterval: 15000 });
    const conversations = data?.data?.conversations || [];
    const [openId, setOpenId] = useState(null);

    return (
        <div className="space-y-6">
            <Helmet><title>Messages | Admin</title></Helmet>
            <div className="animate-fadeInUp">
                <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><MessageSquare size={22} className="text-[#001f3f]" /> Messages</h1>
                <p className="text-sm text-slate-500">Conversations with sellers and buyers.</p>
            </div>

            {isLoading ? (
                <AdminLoading label="Loading conversations..." />
            ) : isError ? (
                <AdminError error={error} onRetry={refetch} label="Failed to load conversations." />
            ) : conversations.length === 0 ? (
                <AdminEmpty icon={MessageSquare} title="No conversations yet" text="Messages with sellers and buyers will appear here." />
            ) : (
                <div className="animate-fadeInUp divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ animationDelay: '100ms' }}>
                    {conversations.map((c) => {
                        const last = c.messages[c.messages.length - 1];
                        return (
                            <button key={c.id} onClick={() => setOpenId(c.id)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50">
                                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColorFor(c.userId || c.id)} text-sm font-bold text-white`}>{c.name?.[0]?.toUpperCase()}</div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-slate-900">{c.name} <span className="ml-1 text-xs font-normal text-slate-400">· {c.role}</span></p>
                                    <p className="truncate text-sm text-slate-500">{last?.text || 'No messages yet'}</p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-[11px] text-slate-400">{when(last?.time || c.updatedAt)}</p>
                                    {c.unread > 0 && (
                                        <span className="mt-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#001f3f] px-1 text-[10px] font-bold text-white">{c.unread}</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {openId && <AdminMessagesModal initialConversationId={openId} onClose={() => setOpenId(null)} />}
        </div>
    );
};