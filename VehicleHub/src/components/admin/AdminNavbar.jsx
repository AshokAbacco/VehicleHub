// VehicleHub/VehicleHub/src/components/admin/AdminNavbar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, Search, ChevronDown, UserCircle, Menu, X } from 'lucide-react';
import { AdminNotificationsModal } from './AdminNotificationsModal.jsx';
import { AdminMessagesModal } from './AdminMessagesModal.jsx';
import {
    useGetPendingSellerCountQuery,
    useGetAdminNotificationsQuery,
    useGetAdminConversationsQuery,
} from '../../services/adminApiSlice.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const AdminNavbar = ({ sidebarWidth, onOpenMobileMenu }) => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [notifOpen, setNotifOpen] = useState(false);
    const [msgOpen, setMsgOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Live badges: unread notifications (or seller applications waiting), unread messages
    const { data: pendingCountData } = useGetPendingSellerCountQuery(undefined, { pollingInterval: 30000 });
    const { data: notifData } = useGetAdminNotificationsQuery(undefined, { pollingInterval: 30000 });
    const { data: convoData } = useGetAdminConversationsQuery(undefined, { pollingInterval: 30000 });
    const pendingSellerCount = pendingCountData?.count || 0;
    const unread = Math.max(notifData?.data?.unreadCount || 0, pendingSellerCount);
    const unreadMessages = convoData?.data?.unreadCount || 0;
    const adminName = user?.name || user?.fullName || 'Admin';

    // Navbar search opens All Vehicles filtered by the text
    const runSearch = (e) => {
        e.preventDefault();
        const q = search.trim();
        navigate(q ? `/admin/dashboard/all-vehicles?search=${encodeURIComponent(q)}` : '/admin/dashboard/all-vehicles');
        setMobileSearchOpen(false);
    };

    const handleLogout = () => {
        logout?.();
        window.location.replace('/');
    };

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-30 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl transition-all duration-200 lg:pl-[76px]">
                <div className="flex items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-5">
                    {/* ...unchanged left section... */}
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        <button
                            onClick={onOpenMobileMenu}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu size={19} />
                        </button>
                        <form onSubmit={runSearch} className="hidden min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-[#001f3f]/30 focus-within:bg-white focus-within:shadow-sm sm:flex">
                            <Search size={17} className="shrink-0 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search vehicles by title, brand, reg. no..."
                                className="w-56 min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none lg:w-72"
                            />
                        </form>
                        <button
                            onClick={() => setMobileSearchOpen((v) => !v)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 sm:hidden"
                            aria-label="Search"
                        >
                            {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
                        </button>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
                        <button
                            onClick={() => setNotifOpen(true)}
                            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 sm:h-11 sm:w-11"
                            aria-label="Notifications"
                        >
                            <Bell size={17} className="sm:hidden" />
                            <Bell size={18} className="hidden sm:block" />
                            {unread > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white sm:h-5 sm:w-5 sm:text-[10px]">
                                    {unread > 99 ? '99+' : unread}
                                </span>
                            )}
                        </button>

                        {/* ...messages button + profile dropdown unchanged... */}
                        <button
                            onClick={() => setMsgOpen(true)}
                            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 sm:h-11 sm:w-11"
                            aria-label="Messages"
                        >
                            <MessageSquare size={17} className="sm:hidden" />
                            <MessageSquare size={18} className="hidden sm:block" />
                            {unreadMessages > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#001f3f] text-[9px] font-bold text-white ring-2 ring-white sm:h-5 sm:w-5 sm:text-[10px]">
                                    {unreadMessages > 99 ? '99+' : unreadMessages}
                                </span>
                            )}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen((v) => !v)}
                                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-1.5 hover:bg-slate-50 sm:pr-3"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#001f3f] text-white">
                                    <UserCircle size={18} />
                                </span>
                                <span className="hidden max-w-[140px] truncate text-sm font-semibold text-slate-800 sm:block">{adminName}</span>
                                <ChevronDown size={14} className="hidden shrink-0 text-slate-400 transition sm:block" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                    <button onClick={() => { setDropdownOpen(false); navigate('/admin/dashboard/settings'); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">Settings</button>
                                    <button onClick={handleLogout} className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {mobileSearchOpen && (
                    <div className="border-t border-slate-100 px-3 py-2.5 sm:hidden">
                        <form onSubmit={runSearch} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-[#001f3f]/30">
                            <Search size={16} className="shrink-0 text-slate-400" />
                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search vehicles by title, brand, reg. no..."
                                className="w-full min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            />
                        </form>
                    </div>
                )}
            </header>

            {notifOpen && <AdminNotificationsModal onClose={() => setNotifOpen(false)} />}
            {msgOpen && <AdminMessagesModal onClose={() => setMsgOpen(false)} />}
        </>
    );
};