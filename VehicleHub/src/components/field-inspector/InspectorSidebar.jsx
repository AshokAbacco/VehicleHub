import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ClipboardList, Clock, CalendarCheck, Hourglass, CheckCircle2,
    Calendar, FileBarChart, Bell, MessageCircle, UserCircle, Settings, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const groups = [
    {
        label: 'MAIN',
        items: [{ label: 'Dashboard', to: '/field-inspector/dashboard', icon: LayoutDashboard }],
    },
    {
        label: 'INSPECTIONS',
        items: [
            { label: 'My Inspections', to: '/field-inspector/inspections', icon: ClipboardList },
            { label: 'Pending', to: '/field-inspector/inspections/pending', icon: Clock },
            { label: "Today's Inspections", to: '/field-inspector/inspections/today', icon: CalendarCheck },
            { label: 'In Progress', to: '/field-inspector/inspections/in-progress', icon: Hourglass },
            { label: 'Completed', to: '/field-inspector/inspections/completed', icon: CheckCircle2 },
            { label: 'Calendar', to: '/field-inspector/calendar', icon: Calendar },
        ],
    },
    {
        label: 'REPORTS',
        items: [{ label: 'Verification Reports', to: '/field-inspector/reports', icon: FileBarChart }],
    },
    {
        label: 'COMMUNICATION',
        items: [
            { label: 'Notifications', to: '/field-inspector/notifications', icon: Bell },
            // { label: 'Messages', to: '/field-inspector/messages', icon: MessageCircle },
        ],
    },
    {
        label: 'ACCOUNT',
        items: [
            { label: 'Profile', to: '/field-inspector/profile', icon: UserCircle },
            // { label: 'Settings', to: '/field-inspector/settings', icon: Settings },
        ],
    },
];

export const InspectorSidebar = ({ mobileOpen, onCloseMobile }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout?.();
        window.location.replace('/');
    };

    const linkClasses = ({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
            ? 'bg-gradient-to-r from-[#001f3f] to-[#0f305f] text-white shadow-md shadow-[#001f3f]/15 ring-1 ring-[#001f3f]/10'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`;

    const content = (
        <div className="flex h-full flex-col border-r border-slate-200 bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between px-5 py-5">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#001f3f] to-[#1d4ed8] text-sm font-bold text-white shadow-lg shadow-[#001f3f]/20">
                        FI
                    </div>
                    <span className="text-sm font-bold tracking-wide text-slate-900">INSPECTOR</span>
                </div>
                <button onClick={onCloseMobile} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden">
                    <X size={18} />
                </button>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
                {groups.map((group) => (
                    <div key={group.label}>
                        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">{group.label}</p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink key={item.to} to={item.to} className={linkClasses} onClick={onCloseMobile}>
                                        <Icon size={17} className="shrink-0" />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-slate-200 p-3">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                    <LogOut size={17} /> Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop fixed sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-slate-200 bg-white/80 backdrop-blur-xl lg:block">
                {content}
            </aside>

            {/* Mobile slide-out */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCloseMobile} />
                    <aside className="absolute inset-y-0 left-0 w-[260px] shadow-2xl shadow-slate-200">{content}</aside>
                </div>
            )}
        </>
    );
};