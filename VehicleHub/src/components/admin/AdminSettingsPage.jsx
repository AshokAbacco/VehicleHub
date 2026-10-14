import { Helmet } from 'react-helmet-async';
import { Settings } from 'lucide-react';

export const AdminSettingsPage = () => (
  <div className="space-y-6">
    <Helmet>
      <title>Admin Settings | VehicleHub</title>
    </Helmet>
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
      <p className="text-sm text-slate-500">Configure admin-level system and moderation preferences.</p>
    </div>
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Settings size={20} className="text-slate-500" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Administrative settings are available here.</p>
          <p className="text-sm text-slate-500">Use this section to tune platform controls and access rights.</p>
        </div>
      </div>
    </div>
  </div>
);
