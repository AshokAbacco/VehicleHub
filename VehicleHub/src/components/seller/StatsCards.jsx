import { useNavigate } from 'react-router-dom';
import { LayoutGrid, CheckCircle2, Clock, Car, XCircle, MessageCircleQuestion, IndianRupee } from 'lucide-react';

const iconMap = {
    'Total Listings': { icon: LayoutGrid, bg: 'bg-blue-50', color: 'text-blue-600' },
    'Approved': { icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    'Pending': { icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
    'Sold': { icon: Car, bg: 'bg-purple-50', color: 'text-purple-600' },
    'Rejected': { icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' },
    'Pending Inquiries': { icon: MessageCircleQuestion, bg: 'bg-cyan-50', color: 'text-cyan-600' },
    'Total Revenue': { icon: IndianRupee, bg: 'bg-green-50', color: 'text-green-600' },
};

export const StatsCards = ({ stats = [] }) => {
    const navigate = useNavigate();
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-7">
            {stats.map((stat, idx) => {
                const meta = iconMap[stat.label] || { icon: LayoutGrid, bg: 'bg-slate-50', color: 'text-slate-600' };
                const Icon = meta.icon;
                return (
                    <button
                        key={stat.label}
                        type="button"
                        onClick={() => stat.to && navigate(stat.to)}
                        style={{ animationDelay: `${idx * 60}ms` }}
                        className={`group animate-fadeInUp opacity-0 relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#001f3f]/30 hover:shadow-lg sm:p-5 ${stat.to ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                        <span className="absolute inset-x-0 top-0 h-[3px] w-full overflow-hidden">
                            <span className="block h-full w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-[#001f3f] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
                        </span>
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${meta.bg} ${meta.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                            <Icon size={17} />
                        </span>
                        <p className="mt-3 truncate text-xl font-extrabold text-slate-900 transition-transform duration-300 group-hover:translate-x-0.5 sm:mt-4 sm:text-2xl">
                            {stat.value}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-medium text-slate-500 sm:text-sm">{stat.label}</p>
                    </button>
                );
            })}
        </div>
    );
};