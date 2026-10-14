import { AlertTriangle, BarChart3, Database, FileText, KeyRound, ShieldCheck, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Card } from '../../components/ui/Card.jsx';
import { dashboardStats } from '../../data/mockData.js';
import { formatCurrency, formatNumber } from '../../utils/formatters.js';

export const SuperAdminDashboardPage = () => (
  <div className="space-y-6">
    <Helmet><title>Super Admin Dashboard | VehicleHub</title></Helmet>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[{ title: 'Active users', value: formatNumber(dashboardStats.totalUsers), icon: Users }, { title: 'Revenue', value: formatCurrency(dashboardStats.revenue), icon: BarChart3 }, { title: 'Security events', value: '24', icon: ShieldCheck }, { title: 'System health', value: '99.9%', icon: Database }].map((item) => { const Icon = item.icon; return <Card key={item.title} className="flex items-center gap-4"><div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300"><Icon size={20} /></div><div><p className="text-sm text-slate-400">{item.title}</p><p className="text-xl font-semibold text-white">{item.value}</p></div></Card>; })}
    </div>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-6"><p className="text-sm uppercase tracking-[0.35em] text-slate-400">Platform operations</p><div className="mt-4 space-y-3 text-sm text-slate-400"><div className="rounded-2xl bg-slate-950/70 p-4">RBAC controls, feature flags, and role governance</div><div className="rounded-2xl bg-slate-950/70 p-4">Global notifications and backup restore workflows</div><div className="rounded-2xl bg-slate-950/70 p-4">Server health and API monitoring dashboards</div></div></Card>
      <Card className="p-6"><p className="text-sm uppercase tracking-[0.35em] text-slate-400">Critical actions</p><div className="mt-4 space-y-3 text-sm text-slate-400"><div className="rounded-2xl bg-slate-950/70 p-4 flex items-center gap-3"><KeyRound size={16} className="text-amber-300"/>Manage permissions</div><div className="rounded-2xl bg-slate-950/70 p-4 flex items-center gap-3"><FileText size={16} className="text-amber-300"/>Audit trails</div><div className="rounded-2xl bg-slate-950/70 p-4 flex items-center gap-3"><AlertTriangle size={16} className="text-amber-300"/>Security incidents</div></div></Card>
    </div>
  </div>
);

export const SuperAdminUsersPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">User administration</h2><p className="mt-3 text-sm text-slate-400">Manage buyers, sellers, admins, dealers, inspectors, finance, and support roles from one secure control center.</p></div>;
export const SuperAdminSecurityPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Security center</h2><p className="mt-3 text-sm text-slate-400">Review sessions, device access, permissions, and suspicious activity in real time.</p></div>;
export const SuperAdminAnalyticsPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Platform intelligence</h2><p className="mt-3 text-sm text-slate-400">Monitor revenue, growth, churn, and operational health at the platform level.</p></div>;
export const SuperAdminSettingsPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">System settings</h2><p className="mt-3 text-sm text-slate-400">Configure SMTP, SMS, storage, maintenance mode, and backup policies.</p></div>;
