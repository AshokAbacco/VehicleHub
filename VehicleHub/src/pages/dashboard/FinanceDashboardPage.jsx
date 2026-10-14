import { BadgeDollarSign, CreditCard, FileText, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Card } from '../../components/ui/Card.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const FinanceDashboardPage = () => (
    <div className="space-y-6">
        <Helmet>
            <title>Finance Dashboard | VehicleHub</title>
        </Helmet>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
                { title: 'Loan applications', value: '18', icon: BadgeDollarSign },
                { title: 'Pending approvals', value: '5', icon: FileText },
                { title: 'Approved loans', value: '12', icon: ShieldCheck },
                { title: 'Revenue', value: formatCurrency(14200000), icon: CreditCard },
            ].map((item) => {
                const Icon = item.icon;
                return (
                    <Card key={item.title} className="flex items-center gap-4">
                        <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-300"><Icon size={20} /></div>
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
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Operations</p>
                <div className="mt-4 space-y-3 text-sm text-slate-400">
                    <div className="rounded-2xl bg-slate-950/70 p-4">Review financing eligibility and customer documents</div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">Verify payment status and EMI schedules</div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">Support both lender and buyer workflows</div>
                </div>
            </Card>
            <Card className="p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Reports</p>
                <div className="mt-4 space-y-3 text-sm text-slate-400">
                    <div className="rounded-2xl bg-slate-950/70 p-4">EMI calculator and payment plan insights</div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">Finance reports and approval analytics</div>
                    <div className="rounded-2xl bg-slate-950/70 p-4">Customer verification and revenue reporting</div>
                </div>
            </Card>
        </div>
    </div>
);

export const FinanceLoansPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Loan operations</h2><p className="mt-3 text-sm text-slate-400">Review financing applications, risk profile, and decision status.</p></div>;
export const FinancePaymentsPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Payments</h2><p className="mt-3 text-sm text-slate-400">Monitor payout schedules, down payment verification, and loan disbursal progress.</p></div>;
export const FinanceReportsPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Finance reports</h2><p className="mt-3 text-sm text-slate-400">Generate EMI, approval, and recovery summaries for finance leadership.</p></div>;
export const FinanceSettingsPage = () => <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-8 text-slate-300"><h2 className="text-xl font-semibold text-white">Finance settings</h2><p className="mt-3 text-sm text-slate-400">Manage lender plans, approval templates, and communication preferences.</p></div>;
