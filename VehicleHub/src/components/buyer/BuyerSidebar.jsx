// VehicleHub/VehicleHub/src/components/buyer/BuyerSidebar.jsx
import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Heart, ShoppingBag, Search, Bell,
    UserCircle, Settings, LogOut, Sparkles, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

// Collapsed rail width / expanded width (BuyerLayout uses the collapsed width as page offset)
export const SIDEBAR_COLLAPSED = 76;
export const SIDEBAR_EXPANDED = 260;

const groups = [
    {
        label: 'Main',
        items: [{ label: 'Dashboard', to: '/buyer/dashboard', icon: LayoutDashboard, end: true }],
    },
    {
        label: 'My Activity',
        items: [
            { label: 'Wishlist', to: '/buyer/dashboard/wishlist', icon: Heart },
            { label: 'Orders', to: '/buyer/dashboard/orders', icon: ShoppingBag },
        ],
    },
    {
        label: 'Discover',
        items: [{ label: 'Browse Vehicles', to: '/search', icon: Search }],
    },
    {
        label: 'Communication',
        items: [{ label: 'Notifications', to: '/buyer/dashboard/notifications', icon: Bell }],
    },
    {
        label: 'Account',
        items: [
            { label: 'Profile', to: '/buyer/dashboard/profile', icon: UserCircle },
            { label: 'Settings', to: '/buyer/dashboard/settings', icon: Settings },
        ],
    },
];

/**
 * Sidebar content. `expanded` controls whether labels are visible.
 * Icons never move between states (fixed left padding), only the labels fade/slide,
 * so the hover open/close animation stays smooth.
 */
const SidebarContent = ({ expanded, onNavigate, onClose, isMobile }) => {
    const { logout } = useAuth();

    const labelClass = `whitespace-nowrap transition-all duration-200 ${expanded ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-2 opacity-0'}`;

    const handleLogout = () => {
        onNavigate?.();
        logout?.();
        window.location.replace('/');
    };

    return (
        <div className="flex h-full flex-col overflow-hidden bg-white">
            {/* Brand — same height as BuyerNavbar (h-16) so the borders line up */}
            <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#001f3f] to-[#003d7a] text-white shadow-md shadow-[#001f3f]/25">
                    <Sparkles size={18} />
                </div>
                <div className={`min-w-0 flex-1 ${labelClass}`}>
                    <p className="truncate text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Buyer panel</p>
                    <p className="truncate text-sm font-extrabold text-slate-900">VehicleHub</p>
                </div>
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

            {/* Links */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 [&::-webkit-scrollbar]:w-0">
                {groups.map((group, gi) => (
                    <div key={group.label} className={gi === 0 ? '' : 'mt-5'}>
                        {/* Group heading: text when expanded, a short divider when collapsed */}
                        <div className="relative mb-2 h-4">
                            <p className={`absolute inset-x-0 top-0 truncate px-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ${labelClass}`}>
                                {group.label}
                            </p>
                            <span
                                className={`absolute left-[14px] top-1/2 h-px w-6 bg-slate-200 transition-opacity duration-200 ${expanded ? 'opacity-0' : 'opacity-100'}`}
                            />
                        </div>

                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        onClick={onNavigate}
                                        title={expanded ? undefined : item.label}
                                        className={({ isActive }) =>
                                            `group/link relative flex h-11 items-center gap-3 rounded-xl pl-[17px] pr-3 text-sm font-medium transition-colors duration-150 ${isActive
                                                ? 'bg-gradient-to-r from-[#001f3f] to-[#002a55] text-white shadow-md shadow-[#001f3f]/20'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {/* active marker on the rail edge */}
                                                {isActive && (
                                                    <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#001f3f]" />
                                                )}
                                                <Icon size={18} className="shrink-0 transition-transform duration-150 group-hover/link:scale-110" />
                                                <span className={labelClass}>{item.label}</span>
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="shrink-0 border-t border-slate-100 p-3">
                <button
                    onClick={handleLogout}
                    title={expanded ? undefined : 'Logout'}
                    className="flex h-11 w-full items-center gap-3 rounded-xl pl-[17px] pr-3 text-sm font-semibold text-slate-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut size={18} className="shrink-0" />
                    <span className={labelClass}>Logout</span>
                </button>
            </div>
        </div>
    );
};

export const BuyerSidebar = ({ mobileOpen, onCloseMobile }) => {
    const [hovered, setHovered] = useState(false);
    const closeTimer = useRef(null);

    // Small close delay so moving the mouse across the edge doesn't flicker
    const open = () => {
        clearTimeout(closeTimer.current);
        setHovered(true);
    };
    const close = () => {
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setHovered(false), 120);
    };
    useEffect(() => () => clearTimeout(closeTimer.current), []);

    // Lock page scroll while the mobile drawer is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <>
            {/* Desktop: icon rail that expands over the page on hover / keyboard focus */}
            <aside
                onMouseEnter={open}
                onMouseLeave={close}
                onFocus={open}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) close(); }}
                style={{ width: hovered ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED }}
                className={`fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200 bg-white transition-[width,box-shadow] duration-300 ease-out lg:block ${hovered ? 'shadow-2xl shadow-slate-900/15' : 'shadow-sm'}`}
            >
                <SidebarContent expanded={hovered} />
            </aside>

            {/* Mobile: slide-in drawer, always expanded */}
            <div
                className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                aria-hidden={!mobileOpen}
            >
                <div
                    onClick={onCloseMobile}
                    className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
                />
                <aside
                    style={{ width: SIDEBAR_EXPANDED }}
                    className={`absolute inset-y-0 left-0 max-w-[85vw] shadow-2xl transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <SidebarContent expanded isMobile onNavigate={onCloseMobile} onClose={onCloseMobile} />
                </aside>
            </div>
        </>
    );
};