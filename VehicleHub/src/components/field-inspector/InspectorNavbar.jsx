import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown, UserCircle, LogOut, Settings, ClipboardList, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetNotificationsQuery } from '../../services/fieldInspectorApiSlice.js';

export const InspectorNavbar = ({ title, breadcrumb, onOpenSidebar }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const dropdownRef = useRef(null);
    const btnRef = useRef(null);
    const searchRef = useRef(null);

    const { data: notifData } = useGetNotificationsQuery(undefined, { pollingInterval: 20000 });
    const unreadCount = notifData?.data?.unreadCount || 0;

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (searchOpen && searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [dropdownOpen, searchOpen]);

    const handleLogout = () => {
        logout?.();
        window.location.replace('/');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchValue.trim()) {
            navigate(`/field-inspector/inspections?search=${encodeURIComponent(searchValue.trim())}`);
            setSearchOpen(false);
        }
    };

    const displayName = user?.fullName || 'Inspector';
    const initials = displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl transition-shadow duration-200 lg:pl-[260px]">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <button onClick={onOpenSidebar} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition-all duration-200 hover:border-[#001f3f]/20 hover:bg-slate-50 lg:hidden">
                        <Menu size={18} />
                    </button>
                    <div className="min-w-0">
                        <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">{title}</h1>
                        {breadcrumb && <p className="truncate text-xs text-slate-500">{breadcrumb}</p>}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {/* Search — expands inline on desktop */}
                    <div ref={searchRef} className="relative hidden sm:block">
                        {searchOpen ? (
                            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-xl border-2 border-[#001f3f]/30 bg-white px-3 py-2 shadow-sm">
                                <Search size={15} className="shrink-0 text-[#001f3f]" />
                                <input
                                    autoFocus
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    placeholder="Search inspections..."
                                    className="w-48 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                />
                                <button type="button" onClick={() => { setSearchOpen(false); setSearchValue(''); }} className="text-slate-400 hover:text-slate-600">
                                    <X size={14} />
                                </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-[#001f3f]/20 hover:bg-slate-50"
                            >
                                <Search size={17} />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/field-inspector/notifications')}
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-[#001f3f]/20 hover:bg-slate-50"
                    >
                        <Bell size={17} />
                        {unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 animate-pulse items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* <button
                        onClick={() => navigate('/field-inspector/messages')}
                        className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-[#001f3f]/20 hover:bg-slate-50 sm:inline-flex"
                    >
                        <MessageCircle size={17} />
                    </button> */}

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
                                    <span className="mt-0.5 inline-flex items-center rounded-full bg-[#e6f2ff] px-2 py-0.5 text-[10px] font-bold text-[#001f3f]">
                                        FIELD INSPECTOR
                                    </span>
                                    <p className="mt-1 truncate text-xs text-slate-500">{user?.email}</p>
                                </div>
                                <button onClick={() => { setDropdownOpen(false); navigate('/field-inspector/profile'); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50">
                                    <UserCircle size={15} className="text-slate-400" /> Profile
                                </button>
                                <button onClick={() => { setDropdownOpen(false); navigate('/field-inspector/inspections'); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50">
                                    <ClipboardList size={15} className="text-slate-400" /> My Inspections
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