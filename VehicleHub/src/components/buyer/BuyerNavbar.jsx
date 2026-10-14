// VehicleHub/VehicleHub/src/components/buyer/BuyerNavbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, MessageCircle, ChevronDown, ChevronRight, UserCircle, LogOut, Settings, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetBuyerNotificationsQuery } from '../../services/buyerApiSlice.js';

export const BuyerNavbar = ({ title, breadcrumb, onOpenSidebar }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { data: notificationData } = useGetBuyerNotificationsQuery(user?.phone, { pollingInterval: 15000 });
    const unreadNotificationsCount = notificationData?.data?.unreadCount ?? 0;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const btnRef = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [dropdownOpen]);

    const handleLogout = () => {
        logout?.();
        window.location.replace('/');
    };

    const displayName = user?.fullName || 'Buyer';
    const initials = displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        // No left padding here — BuyerLayout already offsets the page for the sidebar.
        // h-16 matches the sidebar brand row so the bottom borders line up.
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
            {/* Same width + padding as <main> in BuyerLayout (PAGE_WIDTH), so the title lines up with the page content */}
            <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                {/* Left: menu (mobile) + page title */}
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        onClick={onOpenSidebar}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-[#001f3f]/20 hover:bg-slate-50 lg:hidden"
                        aria-label="Open menu"
                    >
                        <Menu size={18} />
                    </button>
                    <div className="min-w-0 text-left">
                        {breadcrumb && (
                            <p className="flex items-center gap-1 truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                {breadcrumb}
                                <ChevronRight size={12} className="shrink-0" />
                                <span className="truncate text-slate-500">{title}</span>
                            </p>
                        )}
                        <h1 className="truncate text-lg font-extrabold leading-tight text-slate-900 sm:text-xl">{title}</h1>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <button
                        onClick={() => navigate('/search')}
                        className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-[#001f3f]/20 hover:bg-slate-50 sm:inline-flex"
                        aria-label="Search vehicles"
                    >
                        <Search size={17} />
                    </button>

                    <button
                        onClick={() => navigate('/buyer/dashboard/notifications')}
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-[#001f3f]/20 hover:bg-slate-50"
                        aria-label="Notifications"
                    >
                        <Bell size={17} />
                        {unreadNotificationsCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => navigate('/buyer/dashboard/inquiries')}
                        className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-[#001f3f]/20 hover:bg-slate-50 sm:inline-flex"
                        aria-label="Messages"
                    >
                        <MessageCircle size={17} />
                    </button>

                    <div className="relative">
                        <button
                            ref={btnRef}
                            onClick={() => setDropdownOpen((v) => !v)}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 text-sm text-slate-700 transition-all duration-200 hover:border-[#001f3f]/20 hover:bg-slate-50"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#001f3f] to-[#2d6cdf] text-[11px] font-bold text-white shadow-md shadow-[#001f3f]/20">
                                {initials || <UserCircle size={16} />}
                            </span>
                            <span className="hidden max-w-[100px] truncate font-semibold sm:block">{displayName}</span>
                            <ChevronDown size={13} className={`hidden text-slate-500 transition-transform duration-200 sm:block ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {dropdownOpen && (
                            <div ref={dropdownRef} className="animate-fadeInUp absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80">
                                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                                    <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
                                    <span className="mt-0.5 inline-flex items-center rounded-full bg-[#e6f2ff] px-2 py-0.5 text-[10px] font-bold text-[#001f3f]">BUYER</span>
                                    <p className="mt-1 truncate text-xs text-slate-500">{user?.email}</p>
                                </div>
                                <button onClick={() => { setDropdownOpen(false); navigate('/buyer/dashboard/profile'); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50">
                                    <UserCircle size={15} className="text-slate-400" /> Profile
                                </button>
                                <button onClick={() => { setDropdownOpen(false); navigate('/buyer/dashboard/wishlist'); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50">
                                    <Heart size={15} className="text-slate-400" /> Wishlist
                                </button>
                                <button onClick={() => { setDropdownOpen(false); navigate('/buyer/dashboard/settings'); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50">
                                    <Settings size={15} className="text-slate-400" /> Settings
                                </button>
                                <button onClick={handleLogout} className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50">
                                    <LogOut size={15} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};