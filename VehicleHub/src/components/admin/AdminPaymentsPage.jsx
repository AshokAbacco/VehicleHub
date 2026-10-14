import { Helmet } from 'react-helmet-async';
import { CreditCard } from 'lucide-react';

export const AdminPaymentsPage = () => (
  <div className="space-y-6">
    <Helmet>
      <title>Admin Payments | VehicleHub</title>
    </Helmet>
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Payments</h1>
      <p className="text-sm text-slate-500">Review invoices, payouts, and fee settlements.</p>
    </div>
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <CreditCard size={20} className="text-slate-500" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Payment workflows are configured.</p>
          <p className="text-sm text-slate-500">No outstanding issues detected for the current period.</p>
        </div>
      </div>
    </div>
  </div>
);
