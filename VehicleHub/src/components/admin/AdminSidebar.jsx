import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, CheckSquare, Car, Users, UserCircle2, IndianRupee,
    ShoppingCart, MessageSquare, Bell, Settings, ShieldCheck, LogOut, X, PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const sections = [
    { title: 'Overview', items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
    { title: 'Approvals', items: [{ to: '/admin/dashboard/vehicle-approvals', label: 'Vehicle Approvals', icon: CheckSquare, badgeKey: 'pending' }] },
    {
        title: 'Marketplace',
        items: [
            { to: '/admin/dashboard/all-vehicles', label: 'All Vehicles', icon: Car },
            { to: '/admin/dashboard/add-vehicle', label: 'Add Vehicle', icon: PlusCircle },
            { to: '/admin/dashboard/sellers', label: 'Sellers', icon: UserCircle2 },
            { to: '/admin/dashboard/buyers', label: 'Buyers', icon: Users },
            { to: '/admin/dashboard/carts', label: 'Carts & Wishlist', icon: ShoppingCart },
        ],
    },
    { title: 'Finance', items: [{ to: '/admin/dashboard/revenue', label: 'Revenue', icon: IndianRupee }] },
    {
        title: 'Engagement',
        items: [
            { to: '/admin/dashboard/messages', label: 'Messages', icon: MessageSquare },
            { to: '/admin/dashboard/notifications', label: 'Notifications', icon: Bell },
        ],
    },
    { title: 'System', items: [{ to: '/admin/dashboard/settings', label: 'Settings', icon: Settings }] },
];

export const AdminSidebar = ({ pendingCount = 0, forceExpanded = false, isMobile = false, onNavigate, onClose }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [hoverExpanded, setHoverExpanded] = useState(false);
    const expanded = forceExpanded || hoverExpanded;

    const handleLinkClick = () => {
        onNavigate?.();
    };

    const handleLogout = () => {
        handleLinkClick();
        logout?.();
        window.location.replace('/');
    };

    return (
        <aside
            onMouseEnter={() => !forceExpanded && setHoverExpanded(true)}
            onMouseLeave={() => !forceExpanded && setHoverExpanded(false)}
            className={`${isMobile ? 'relative w-full' : 'fixed inset-y-0 left-0 z-40'} flex h-full flex-col bg-white ${isMobile ? '' : 'border-r border-slate-200 shadow-xl shadow-slate-900/5 transition-all duration-200'
                } ${expanded ? 'w-[264px]' : 'w-[76px]'}`}
        >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#001f3f] text-white">
                    <ShieldCheck size={18} />
                </div>
                {expanded && (
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Admin panel</p>
                        <h2 className="truncate text-sm font-extrabold text-slate-900">VehicleHub Admin</h2>
                    </div>
                )}
                {isMobile && (
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                        aria-label="Close menu"
                    >
                        <X size={17} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
                {sections.map((section) => (
                    <div key={section.title} className="mb-5 px-1.5">
                        {expanded && (
                            <p className="mb-2 truncate px-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">{section.title}</p>
                        )}
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const badge = item.badgeKey === 'pending' ? pendingCount : null;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        onClick={handleLinkClick}
                                        title={!expanded ? item.label : undefined}
                                        className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${expanded ? '' : 'justify-center'
                                            } ${isActive ? 'bg-[#001f3f] text-white shadow-md shadow-[#001f3f]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                    >
                                        <span className="relative shrink-0">
                                            <Icon size={18} />
                                            {badge > 0 && (
                                                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                                                    {badge}
                                                </span>
                                            )}
                                        </span>
                                        {expanded && <span className="truncate">{item.label}</span>}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-slate-100 px-3 py-3">
                <button
                    onClick={handleLogout}
                    title={!expanded ? 'Logout' : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 ${expanded ? '' : 'justify-center'}`}
                >
                    <LogOut size={17} className="shrink-0" />
                    {expanded && 'Logout'}
                </button>
            </div>
        </aside>
    );
};