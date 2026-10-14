import { Building2, CreditCard, MessageSquare, Package } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Card } from '../../components/ui/Card.jsx';
import { dashboardStats } from '../../data/mockData.js';
import { formatCurrency } from '../../utils/formatters.js';

export const DealerDashboardPage = () => (
    <div className="space-y-6">
        <Helmet>
            <title>Dealer Dashboard | VehicleHub</title>
        </Helmet>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
                { title: 'Inventory', value: '64 vehicles', icon: Package },
                { title: 'Branches', value: '4 units', icon: Building2 },
                { title: 'Leads', value: '42 leads', icon: MessageSquare },
                { title: 'Revenue', value: formatCurrency(dashboardStats.revenue), icon: CreditCard },
            ].map((item) => {
                const Icon = item.icon;
                return (
                    <Card key={item.title} className="flex items-center gap-4">
                        <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-300"><Icon size={20} /></div>
                        <div>
                            <p className="text-sm text-slate-400">{item.title}</p>
                            <p className="text-xl font-semibold text-white">{item.value}</p>
                        </div>
                    </Card>
                );
            })}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Dealer operations</p>
                <div className="mt-4 space-y-3 text-sm text-slate-400">
                    <div className="rounded-2xl bg-slate-950/70 p-4">Bulk upload, inventory transfers, and branch stock sync</div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">CRM handoff for qualified leads and customer follow-up</div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">Dealer verification, documentation, and subscription management</div>
                </div>
            </Card>
            <Card className="p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Reports</p>
                <div className="mt-4 space-y-3 text-sm text-slate-400">
                    <div className="rounded-2xl bg-slate-950/70 p-4">Monthly sales analytics</div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">Payments and subscriptions</div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">Branch-level revenue review</div>
                </div>
            </Card>
        </div>
    </div>
);

export const DealerInventoryPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Dealer inventory</h2><p className="mt-3 text-sm text-slate-400">Manage stock across branches, update prices, and coordinate vehicle transfers.</p></div>;
export const DealerLeadsPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Dealer leads</h2><p className="mt-3 text-sm text-slate-400">Track dealer leads from discovery to negotiation and close.</p></div>;
export const DealerAnalyticsPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Dealer analytics</h2><p className="mt-3 text-sm text-slate-400">Review sales performance, average ticket size, and conversion metrics.</p></div>;
export const DealerSettingsPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Dealer settings</h2><p className="mt-3 text-sm text-slate-400">Update company profile, policies, staff roles, and branch information.</p></div>;
