// VehicleHub/VehicleHub/src/components/field-inspector/InspectorNavbar.jsx
// Field Inspector top bar — same layout as the seller bar: search on the left,
// notifications bell + profile on the right. (Each page shows its own heading.)
// FieldInspectorLayout already offsets the content by the sidebar width, so this
// header must not add its own left padding (it used to, pushing everything ~260px right).
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown, UserCircle, LogOut, ClipboardList, X, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetNotificationsQuery } from '../../services/fieldInspectorApiSlice.js';

export const InspectorNavbar = ({ onOpenSidebar }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const dropdownRef = useRef(null);
    const btnRef = useRef(null);

    const { data: notifData } = useGetNotificationsQuery(undefined, { pollingInterval: 20000 });
    const unreadCount = notifData?.data?.unreadCount || 0;

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

    const runSearch = () => {
        if (!searchValue.trim()) return;
        navigate(`/field-inspector/inspections?search=${encodeURIComponent(searchValue.trim())}`);
        setMobileSearchOpen(false);
    };

    const displayName = user?.fullName || user?.name || 'Inspector';
    const initials = displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
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

                    <form
                        onSubmit={(e) => { e.preventDefault(); runSearch(); }}
                        className="hidden w-full max-w-md min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-600 transition focus-within:border-[#001f3f]/30 focus-within:bg-white focus-within:shadow-sm sm:flex"
                    >
                        <Search size={17} className="shrink-0 text-slate-400" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search inspections, vehicles, sellers..."
                            className="w-full min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        />
                        {searchValue && (
                            <button type="button" onClick={() => setSearchValue('')} className="text-slate-400 hover:text-slate-600" aria-label="Clear search">
                                <X size={14} />
                            </button>
                        )}
                    </form>

                    <button
                        onClick={() => setMobileSearchOpen((v) => !v)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 sm:hidden"
                        aria-label="Search"
                    >
                        <Search size={17} />
                    </button>
                </div>

                {/* Right: notifications + profile */}
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
                    <button
                        onClick={() => navigate('/field-inspector/notifications')}
                        className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#001f3f]/30 hover:bg-slate-50 sm:h-11 sm:w-11"
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    <div className="relative">
                        <button
                            ref={btnRef}
                            onClick={() => setDropdownOpen((v) => !v)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 text-sm text-slate-800 transition hover:bg-slate-50 sm:gap-2.5 sm:pr-3"
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#001f3f] to-[#2d6cdf] text-[11px] font-bold text-white shadow-sm">
                                {initials || <UserCircle size={16} />}
                            </span>
                            <span className="hidden max-w-[100px] truncate font-semibold sm:block lg:max-w-[160px]">{displayName}</span>
                            <ChevronDown size={15} className={`shrink-0 text-slate-400 transition ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {dropdownOpen && (
                            <div ref={dropdownRef} className="animate-fadeInUp absolute right-0 top-full z-50 mt-3 w-[min(240px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                                <div className="border-b border-slate-100 px-4 py-3">
                                    <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
                                    <span className="mt-0.5 inline-flex items-center rounded-full bg-[#e6f2ff] px-2 py-0.5 text-[10px] font-bold text-[#001f3f]">FIELD INSPECTOR</span>
                                    {user?.email && <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>}
                                </div>
                                <button onClick={() => { setDropdownOpen(false); navigate('/field-inspector/profile'); }} className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    <UserCircle size={15} className="text-slate-400" /> My profile
                                </button>
                                <button onClick={() => { setDropdownOpen(false); navigate('/field-inspector/settings'); }} className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    <Settings size={15} className="text-slate-400" /> Settings
                                </button>
                                <button onClick={() => { setDropdownOpen(false); navigate('/field-inspector/inspections'); }} className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    <ClipboardList size={15} className="text-slate-400" /> My inspections
                                </button>
                                <button onClick={handleLogout} className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                                    <LogOut size={15} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {mobileSearchOpen && (
                <form onSubmit={(e) => { e.preventDefault(); runSearch(); }} className="border-t border-slate-100 px-3 py-2.5 sm:hidden">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-[#001f3f]/30">
                        <Search size={16} className="shrink-0 text-slate-400" />
                        <input
                            autoFocus
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search inspections..."
                            className="w-full min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        />
                    </div>
                </form>
            )}
        </header>
    );
};