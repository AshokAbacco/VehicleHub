// VehicleHub/VehicleHub/src/components/field-inspector/InspectorSidebar.jsx
// Field Inspector sidebar — same behaviour and colours as the Admin / Seller / Buyer sidebars:
// on desktop it shows icons only (76px) and opens to full width (264px) while the mouse is over it,
// closing again when the mouse leaves. On phones it slides in fully open from the menu button.
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, ClipboardList, Clock, CalendarCheck, Hourglass, CheckCircle2,
    Calendar, FileBarChart, Bell, UserCircle, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const groups = [
    { label: 'Main', accent: 'text-[#001f3f]', items: [{ label: 'Dashboard', to: '/field-inspector/dashboard', icon: LayoutDashboard, end: true }] },
    {
        label: 'Inspections', accent: 'text-emerald-600',
        items: [
            { label: 'My Inspections', to: '/field-inspector/inspections', icon: ClipboardList, end: true },
            { label: 'Pending', to: '/field-inspector/inspections/pending', icon: Clock },
            { label: "Today's Inspections", to: '/field-inspector/inspections/today', icon: CalendarCheck },
            { label: 'In Progress', to: '/field-inspector/inspections/in-progress', icon: Hourglass },
            { label: 'Completed', to: '/field-inspector/inspections/completed', icon: CheckCircle2 },
            { label: 'Calendar', to: '/field-inspector/calendar', icon: Calendar },
        ],
    },
    { label: 'Reports', accent: 'text-violet-600', items: [{ label: 'Verification Reports', to: '/field-inspector/reports', icon: FileBarChart }] },
    { label: 'Communication', accent: 'text-amber-600', items: [{ label: 'Notifications', to: '/field-inspector/notifications', icon: Bell }] },
    { label: 'Account', accent: 'text-slate-500', items: [{ label: 'Profile', to: '/field-inspector/profile', icon: UserCircle }] },
];

const SidebarBody = ({ expanded, isMobile, onNavigate, onClose }) => {
    const { logout, user } = useAuth();

    const handleLogout = () => {
        onNavigate?.();
        logout?.();
        window.location.replace('/');
    };

    return (
        <>
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#001f3f] to-[#003d7a] text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition-transform duration-300 hover:rotate-6">
                    FI
                </div>
                {expanded && (
                    <div className="min-w-0 flex-1 animate-fadeInUp opacity-0" style={{ animationDelay: '50ms' }}>
                        <p className="truncate text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Inspector panel</p>
                        <h2 className="truncate text-sm font-extrabold text-slate-900">{user?.fullName || user?.name || 'Field Inspector'}</h2>
                    </div>
                )}
                {isMobile && (
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        aria-label="Close menu"
                    >
                        <X size={17} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
                {groups.map((group) => (
                    <div key={group.label} className="mb-5 px-1.5">
                        {expanded && (
                            <p className={`mb-2 truncate px-2.5 text-[10px] font-bold uppercase tracking-[0.25em] ${group.accent}`}>{group.label}</p>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        onClick={onNavigate}
                                        title={!expanded ? item.label : undefined}
                                        className={({ isActive }) =>
                                            `group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${expanded ? '' : 'justify-center'
                                            } ${isActive
                                                ? 'bg-gradient-to-r from-[#001f3f] to-[#002a55] text-white shadow-md shadow-[#001f3f]/20'
                                                : 'text-slate-600 hover:translate-x-0.5 hover:bg-slate-50 hover:text-slate-900'
                                            }`
                                        }
                                    >
                                        <Icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
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
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 ${expanded ? '' : 'justify-center'}`}
                >
                    <LogOut size={17} className="shrink-0" />
                    {expanded && 'Logout'}
                </button>
            </div>
        </>
    );
};

export const InspectorSidebar = ({ mobileOpen, onCloseMobile }) => {
    const [hoverExpanded, setHoverExpanded] = useState(false);

    return (
        <>
            {/* Desktop: icons only, opens over the page on hover */}
            <aside
                onMouseEnter={() => setHoverExpanded(true)}
                onMouseLeave={() => setHoverExpanded(false)}
                className={`fixed inset-y-0 left-0 z-40 hidden h-full flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-900/5 transition-[width] duration-300 ease-out lg:flex ${hoverExpanded ? 'w-[264px]' : 'w-[76px]'}`}
            >
                <SidebarBody expanded={hoverExpanded} onNavigate={() => setHoverExpanded(false)} />
            </aside>

            {/* Phones / tablets: slide-out, always fully open */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCloseMobile} />
                    <aside className="absolute inset-y-0 left-0 flex w-[264px] max-w-[85vw] flex-col bg-white shadow-2xl">
                        <SidebarBody expanded isMobile onNavigate={onCloseMobile} onClose={onCloseMobile} />
                    </aside>
                </div>
            )}
        </>
    );
};