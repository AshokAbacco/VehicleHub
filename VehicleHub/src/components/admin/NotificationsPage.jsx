// NotificationsPage.jsx
import { Helmet } from 'react-helmet-async';
import { Bell } from 'lucide-react';
import { adminNotifications } from '../../data/adminMockData.js';

export const NotificationsPage = () => (
    <div className="space-y-6">
        <Helmet><title>Notifications | Admin</title></Helmet>
        <div className="animate-fadeInUp">
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><Bell size={22} className="text-[#001f3f]" /> Notifications</h1>
            <p className="text-sm text-slate-500">All platform activity and alerts.</p>
        </div>
        <div className="animate-fadeInUp divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ animationDelay: '100ms' }}>
            {adminNotifications.map((n) => (
                <div key={n.id} className={`p-4 transition hover:bg-slate-50 ${!n.read ? 'bg-[#e6f2ff]/30' : ''}`}>
                    <p className="font-semibold text-slate-900">{n.title}</p>
                    <p className="text-sm text-slate-500">{n.description}</p>
                    <p className="mt-1 text-xs text-slate-400">{n.time}</p>
                </div>
            ))}
        </div>
    </div>
);