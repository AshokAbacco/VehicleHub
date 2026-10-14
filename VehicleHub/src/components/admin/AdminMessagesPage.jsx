import { Helmet } from 'react-helmet-async';
import { MessageSquare } from 'lucide-react';

export const AdminMessagesPage = () => (
  <div className="space-y-6">
    <Helmet>
      <title>Admin Messages | VehicleHub</title>
    </Helmet>
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Messages</h1>
      <p className="text-sm text-slate-500">Manage internal messages, alerts, and communication feeds.</p>
    </div>
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <MessageSquare size={20} className="text-slate-500" />
        <div>
          <p className="text-sm font-semibold text-slate-900">No unread admin messages.</p>
          <p className="text-sm text-slate-500">All conversations are stable and up to date.</p>
        </div>
      </div>
    </div>
  </div>
);
