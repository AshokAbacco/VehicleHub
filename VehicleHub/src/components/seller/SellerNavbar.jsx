// VehicleHub/VehicleHub/src/components/seller/SellerNavbar.jsx
// Seller top bar. Only approved sellers reach this layout (ProtectedRoute + backend requireApprovedSeller),
// so Add Vehicle / My profile link straight to the dashboard pages.
// Layout: search on the left; Add Vehicle, notifications bell and profile on the right.
// Bell badge = unread seller notifications from the server.
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
    Bell, ChevronDown, Menu, Search, Plus, UserCircle,
} from 'lucide-react';
import { useGetSellerNotificationsQuery } from '../../services/sellerApiSlice.js';
import { useSellerArea } from '../../hooks/useSellerArea.js';

export const SellerNavbar = ({ onOpenSidebar }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const area = useSellerArea();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const dropdownRef = useRef(null);
    const dropdownBtnRef = useRef(null);
    const { data: notificationData } = useGetSellerNotificationsQuery(undefined, { pollingInterval: 15000 });
    const unreadNotificationsCount = notificationData?.data?.unreadCount ?? 0;

    const goTo = (path) => navigate(path);

    useEffect(() => {
        const handleClick = (e) => {
            if (
                dropdownOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                dropdownBtnRef.current &&
                !dropdownBtnRef.current.contains(e.target)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [dropdownOpen]);

    const displayName = user?.fullName || user?.name || 'Seller';

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-30 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl transition-all duration-200 lg:pl-[76px]">
                <div className="flex w-full items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3 lg:px-6">
                    {/* Left: menu + search */}
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        <button
                            onClick={onOpenSidebar}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 sm:h-11 sm:w-11 lg:hidden"
                            aria-label="Open sidebar"
                        >
                            <Menu size={19} />
                        </button>

                        <div className="hidden w-full max-w-md min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-600 transition focus-within:border-[#001f3f]/30 focus-within:bg-white focus-within:shadow-sm sm:flex">
                            <Search size={17} className="shrink-0 text-slate-400" />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchValue.trim()) {
                                        navigate(`${area.to('inventory')}?q=${encodeURIComponent(searchValue.trim())}`);
                                    }
                                }}
                                placeholder="Search inventory, leads, orders..."
                                className="w-full min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            />
                        </div>

                        <button
                            onClick={() => setMobileSearchOpen((v) => !v)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 sm:hidden"
                            aria-label="Search"
                        >
                            <Search size={17} />
                        </button>
                    </div>

                    {/* Right: actions */}
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
                        <button
                            onClick={() => goTo(area.to('add-vehicle'))}
                            className="hidden items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-[#001f3f] to-[#003366] px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-[#001f3f]/25 transition hover:-translate-y-0.5 hover:shadow-lg sm:inline-flex sm:gap-2 sm:px-4 sm:text-sm"
                        >
                            <Plus size={15} /> <span className="hidden sm:inline">Add Vehicle</span>
                        </button>

                        <button
                            onClick={() => navigate(area.to('notifications'))}
                            className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#001f3f]/30 hover:bg-slate-50 sm:h-11 sm:w-11"
                            aria-label="Notifications"
                        >
                            <Bell size={17} className="sm:hidden" />
                            <Bell size={18} className="hidden sm:block" />
                            {unreadNotificationsCount > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white sm:h-5 sm:w-5 sm:text-[10px]">
                                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                                </span>
                            )}
                        </button>

                        {/* Profile dropdown */}
                        <div className="relative">
                            <button
                                ref={dropdownBtnRef}
                                onClick={() => setDropdownOpen((v) => !v)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 text-sm text-slate-800 transition hover:bg-slate-50 sm:gap-2.5 sm:pr-3"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-[#001f3f] shadow-sm">
                                    <UserCircle size={18} />
                                </span>
                                <span className="hidden max-w-[100px] truncate font-semibold sm:block lg:max-w-[160px]">
                                    {displayName}
                                </span>
                                <ChevronDown size={15} className={`shrink-0 text-slate-400 transition ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute right-0 top-full z-50 mt-3 w-[min(240px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                                >
                                    <div className="border-b border-slate-100 px-4 py-3">
                                        <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
                                    </div>

                                    <button
                                        onClick={() => { setDropdownOpen(false); goTo(area.to('business-profile')); }}
                                        className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        My profile
                                    </button>
                                    <button
                                        onClick={() => { setDropdownOpen(false); goTo(area.to('settings')); }}
                                        className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Settings
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {mobileSearchOpen && (
                    <div className="border-t border-slate-100 px-3 py-2.5 sm:hidden">
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-[#001f3f]/30">
                            <Search size={16} className="shrink-0 text-slate-400" />
                            <input
                                autoFocus
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchValue.trim()) {
                                        navigate(`${area.to('inventory')}?q=${encodeURIComponent(searchValue.trim())}`);
                                        setMobileSearchOpen(false);
                                    }
                                }}
                                placeholder="Search inventory, leads, orders..."
                                className="w-full min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>
                )}

                {/* Mobile Add Vehicle bar */}
                <div className="border-t border-slate-100 px-3 py-2 sm:hidden">
                    <button
                        onClick={() => goTo(area.to('add-vehicle'))}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f3f] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#001f3f]/25 transition hover:bg-[#002a55]"
                    >
                        <Plus size={16} /> Add Vehicle
                    </button>
                </div>
            </header>
        </>
    );
};