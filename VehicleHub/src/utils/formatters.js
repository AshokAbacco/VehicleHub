export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value);

export const getStatusStyle = (status) => {
  const map = {
    Approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'Pending Approval': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    New: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    Scheduled: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    Open: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  };

  return map[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';
};

export const getInitials = (name = '') => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
