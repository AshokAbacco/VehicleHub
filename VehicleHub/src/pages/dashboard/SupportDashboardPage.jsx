import { AlertCircle, MessageSquareText, ShieldCheck, Ticket } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Card } from '../../components/ui/Card.jsx';
import { initialTickets } from '../../data/mockData.js';

export const SupportDashboardPage = () => (
    <div className="space-y-6">
        <Helmet>
            <title>Support Dashboard | VehicleHub</title>
        </Helmet>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
                { title: 'Open tickets', value: initialTickets.length.toString(), icon: Ticket },
                { title: 'Priority', value: '6', icon: AlertCircle },
                { title: 'Live chats', value: '12', icon: MessageSquareText },
                { title: 'Satisfaction', value: '94%', icon: ShieldCheck },
            ].map((item) => {
                const Icon = item.icon;
                return (
                    <Card key={item.title} className="flex items-center gap-4">
                        <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-300"><Icon size={20} /></div>
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
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Queue</p>
                <div className="mt-4 space-y-3 text-sm text-slate-400">
                    <div className="rounded-2xl bg-slate-950/70 p-4">Buyer refund and ownership transfer issues</div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">Seller document upload blockers</div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">Dealer onboarding and verification escalations</div>
                </div>
            </Card>
            <Card className="p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Knowledge base</p>
                <div className="mt-4 space-y-3 text-sm text-slate-400">
                    <div className="rounded-2xl bg-slate-950/70 p-4">Troubleshooting guides</div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">FAQ automation and updates</div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">Escalation workflow for senior agents</div>
                </div>
            </Card>
        </div>
    </div>
);

export const SupportTicketsPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Support tickets</h2><p className="mt-3 text-sm text-slate-400">Review, assign, and resolve customer, seller, and dealer issues from a unified workspace.</p></div>;
export const SupportChatPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Live chat</h2><p className="mt-3 text-sm text-slate-400">Handle immediate customer support questions with a polished live chat experience.</p></div>;
export const SupportReportsPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Support reports</h2><p className="mt-3 text-sm text-slate-400">Review ticket trends, response times, and SLA performance.</p></div>;
export const SupportSettingsPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Support settings</h2><p className="mt-3 text-sm text-slate-400">Manage routing rules, workspace settings, and knowledge base permissions.</p></div>;
