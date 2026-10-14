import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, Search, ChevronDown, UserCircle, Menu, X } from 'lucide-react';
import { adminNotifications, adminConversations } from '../../data/adminMockData.js';
import { AdminNotificationsModal } from './AdminNotificationsModal.jsx';
import { AdminMessagesModal } from './AdminMessagesModal.jsx';
import { useGetPendingSellerCountQuery } from '../../services/adminApiSlice.js'; // NEW
import { useAuth } from '../../context/AuthContext.jsx';

export const AdminNavbar = ({ sidebarWidth, onOpenMobileMenu }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [notifOpen, setNotifOpen] = useState(false);
    const [msgOpen, setMsgOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mockUnread, setMockUnread] = useState(adminNotifications.filter((n) => !n.read).length);

    // NEW: live pending seller count, polled every 15s
    const { data: pendingCountData } = useGetPendingSellerCountQuery(undefined, { pollingInterval: 15000 });
    const pendingSellerCount = pendingCountData?.count || 0;

    // Combined badge total
    const unread = mockUnread + pendingSellerCount;

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
                        <div className="hidden min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-[#001f3f]/30 focus-within:bg-white focus-within:shadow-sm sm:flex">
                            <Search size={17} className="shrink-0 text-slate-400" />
                            <input
                                placeholder="Search vehicles, sellers, buyers..."
                                className="w-56 min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none lg:w-72"
                            />
                        </div>
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
                                    {unread}
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
                            <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#001f3f] text-[9px] font-bold text-white ring-2 ring-white sm:h-5 sm:w-5 sm:text-[10px]">
                                2
                            </span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen((v) => !v)}
                                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-1.5 hover:bg-slate-50 sm:pr-3"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#001f3f] text-white">
                                    <UserCircle size={18} />
                                </span>
                                <span className="hidden text-sm font-semibold text-slate-800 sm:block">Admin</span>
                                <ChevronDown size={14} className="hidden shrink-0 text-slate-400 transition sm:block" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                    <button className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">Profile</button>
                                    <button onClick={handleLogout} className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">Logout</button>
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
                                placeholder="Search vehicles, sellers, buyers..."
                                className="w-full min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>
                )}
            </header>

            {notifOpen && (
                <AdminNotificationsModal
                    notifications={adminNotifications}
                    onClose={() => setNotifOpen(false)}
                    onMarkAllRead={() => setMockUnread(0)}
                />
            )}
            {msgOpen && <AdminMessagesModal conversations={adminConversations} onClose={() => setMsgOpen(false)} />}
        </>
    );
};