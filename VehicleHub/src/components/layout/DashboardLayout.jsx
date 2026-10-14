import { BarChart3, Bell, Compass, CreditCard, Home, MessageSquare, Search, Settings, ShieldCheck, ShoppingBag, UserCircle, Wallet } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { roleLabels } from '../../utils/roleAccess.js';
import { Button } from '../ui/Button.jsx';

const menuByRole = {
    'super-admin': [
        { to: '/super-admin/dashboard', label: 'Overview', icon: Home },
        { to: '/super-admin/dashboard/users', label: 'Users', icon: UserCircle },
        { to: '/super-admin/dashboard/security', label: 'Security', icon: ShieldCheck },
        { to: '/super-admin/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
        { to: '/super-admin/dashboard/settings', label: 'Settings', icon: Settings },
    ],
    admin: [
        { to: '/admin/dashboard', label: 'Overview', icon: Home },
        { to: '/admin/dashboard/approvals', label: 'Approvals', icon: ShoppingBag },
        { to: '/admin/dashboard/payments', label: 'Payments', icon: CreditCard },
        { to: '/admin/dashboard/messages', label: 'Messages', icon: MessageSquare },
        { to: '/admin/dashboard/settings', label: 'Settings', icon: Settings },
    ],
    seller: [
        { to: '/seller/dashboard', label: 'Overview', icon: Home },
        { to: '/seller/dashboard/add-vehicle', label: 'Add Vehicle', icon: ShoppingBag },
        { to: '/seller/dashboard/leads', label: 'Leads', icon: MessageSquare },
        { to: '/seller/dashboard/earnings', label: 'Earnings', icon: Wallet },
        { to: '/seller/dashboard/settings', label: 'Settings', icon: Settings },
    ],
    buyer: [
        { to: '/buyer/dashboard', label: 'Overview', icon: Home },
        { to: '/buyer/dashboard/wishlist', label: 'Wishlist', icon: ShoppingBag },
        { to: '/buyer/dashboard/inquiries', label: 'Inquiries', icon: MessageSquare },
        { to: '/buyer/dashboard/orders', label: 'Orders', icon: CreditCard },
        { to: '/buyer/dashboard/settings', label: 'Settings', icon: Settings },
    ],
    dealer: [
        { to: '/dealer/dashboard', label: 'Overview', icon: Home },
        { to: '/dealer/dashboard/inventory', label: 'Inventory', icon: ShoppingBag },
        { to: '/dealer/dashboard/leads', label: 'Leads', icon: MessageSquare },
        { to: '/dealer/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    ],
    inspector: [
        { to: '/inspector/dashboard', label: 'Overview', icon: Home },
        { to: '/inspector/dashboard/inspections', label: 'Inspections', icon: Compass },
        { to: '/inspector/dashboard/reports', label: 'Reports', icon: BarChart3 },
    ],
    finance: [
        { to: '/finance/dashboard', label: 'Overview', icon: Home },
        { to: '/finance/dashboard/loans', label: 'Loans', icon: CreditCard },
        { to: '/finance/dashboard/payments', label: 'Payments', icon: Wallet },
    ],
    support: [
        { to: '/support/dashboard', label: 'Overview', icon: Home },
        { to: '/support/dashboard/tickets', label: 'Tickets', icon: MessageSquare },
        { to: '/support/dashboard/chat', label: 'Live Chat', icon: Bell },
    ],
};

export const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const menu = menuByRole[user?.role] || menuByRole.buyer;

    const handleLogout = () => {
        logout?.();
        window.location.replace('/');
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(192,132,252,0.16),_transparent_25%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
                <aside className="rounded-[32px] border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:w-72">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Signed in as</p>
                            <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
                        </div>
                        <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                            {roleLabels[user?.role]}
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {menu.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'}`}>
                                    <Icon size={16} />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>

                    <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                        <p className="text-sm text-slate-400">Need quick support?</p>
                        <Link to="/contact" className="mt-3 inline-flex">
                            <Button variant="secondary" className="w-full justify-center">Contact team</Button>
                        </Link>
                    </div>

                    <button onClick={handleLogout} className="mt-6 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/15">
                        Logout
                    </button>
                </aside>

                <main className="flex-1 space-y-6">
                    <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">VehicleHub command center</p>
                                <h2 className="text-xl font-semibold text-white">{roleLabels[user?.role] || 'Workspace'} overview</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-300">
                                    <Search size={16} /> Global search
                                </div>
                                <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">
                                    <Bell size={16} /> 12 alerts
                                </div>
                            </div>
                        </div>
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
};
