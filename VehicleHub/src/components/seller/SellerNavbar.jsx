// components/seller/SellerNavbar.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAuthGate } from '../../context/AuthGateContext.jsx';
import {
    Bell, ChevronDown, Menu, MessageCircle, Search, SunMoon,
    Plus, UserCircle, CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import { SellerMessagesModal } from '../seller/SellerMessagesModal.jsx';
import { sellerConversations } from '../../data/sellerDashboardMock.js';
import { useGetSellerNotificationsQuery } from '../../services/sellerApiSlice.js';

const getApiBaseUrl = () => {
    const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '');
    return normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;
};

const readKeyFor = (sellerProfileId, status) => `vh_seller_notif_read_${sellerProfileId}_${status}`;

export const SellerNavbar = ({ onOpenSidebar }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { requireAuth } = useAuthGate();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [messagesOpen, setMessagesOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [unreadMessages] = useState(2);

    const [sellerStatus, setSellerStatus] = useState(null); // { isApproved, isSellerRegistered, sellerProfile }
    const [statusLoading, setStatusLoading] = useState(true);
    const [approvalRead, setApprovalRead] = useState(true);
    const prevStatusRef = useRef(null);

    const dropdownRef = useRef(null);
    const dropdownBtnRef = useRef(null);
    const { data: notificationData } = useGetSellerNotificationsQuery(undefined, { pollingInterval: 15000 });
    const unreadServerNotifications = notificationData?.data?.unreadCount ?? 0;

    const fetchSellerStatus = useCallback(async () => {
        if (!user?.id) return null;
        const token = localStorage.getItem('vehiclehub_token');
        if (!token) return null;
        try {
            const res = await fetch(`${getApiBaseUrl()}/sellers/${user.id}/seller-status`, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (!res.ok) return null;
            return res.json();
        } catch (err) {
            console.error('Seller status fetch failed', err);
            return null;
        }
    }, [user?.id]);

    // Still poll — used only to show the notification banner, NOT to gate any button
    useEffect(() => {
        let cancelled = false;
        let intervalId;

        const runCheck = async () => {
            setStatusLoading(true);
            const data = await fetchSellerStatus();
            if (cancelled) return;

            setSellerStatus(data);
            setStatusLoading(false);

            const currentStatus = data?.sellerProfile?.verificationStatus || null;
            const sellerProfileId = data?.sellerProfile?.id;

            if (currentStatus && sellerProfileId) {
                const prevStatus = prevStatusRef.current;
                if (prevStatus && prevStatus !== currentStatus) {
                    if (currentStatus === 'APPROVED') {
                        toast.success("🎉 Your seller registration was approved!");
                    } else if (currentStatus === 'REJECTED') {
                        toast.error('Your seller registration was rejected. Check notifications for details.');
                    }
                }
                prevStatusRef.current = currentStatus;

                const readFlag = localStorage.getItem(readKeyFor(sellerProfileId, currentStatus));
                setApprovalRead(readFlag === 'true');
            }
        };

        runCheck();
        intervalId = setInterval(runCheck, 10000);

        return () => {
            cancelled = true;
            if (intervalId) clearInterval(intervalId);
        };
    }, [fetchSellerStatus]);

    const buildStatusNotification = () => {
        const profile = sellerStatus?.sellerProfile;
        if (!profile) return null;

        const statusMeta = {
            PENDING: {
                icon: Clock,
                color: 'text-amber-600 bg-amber-100',
                title: 'Registration under review',
                message: 'Your seller application is being reviewed by our admin team.',
            },
            APPROVED: {
                icon: CheckCircle2,
                color: 'text-emerald-600 bg-emerald-100',
                title: "You're approved!",
                message: 'Your seller account has been verified by our team.',
            },
            REJECTED: {
                icon: XCircle,
                color: 'text-red-600 bg-red-100',
                title: 'Registration rejected',
                message: profile.rejectReason || 'Your seller registration was not approved.',
            },
        };

        const meta = statusMeta[profile.verificationStatus];
        if (!meta) return null;

        return {
            id: `seller-status-${profile.id}-${profile.verificationStatus}`,
            ...meta,
            time: profile.reviewedAt || profile.submittedAt,
            read: approvalRead,
            isLive: true,
        };
    };

    const liveNotification = buildStatusNotification();
    // The ONLY gate now: is this user registered as a seller at all
    const isRegistered = !!sellerStatus?.isSellerRegistered;

    // Registered -> straight to dashboard/destination. Not registered -> registration form.
    const goSellerAware = (destinationIfRegistered) => {
        if (!user) {
            requireAuth((nextUser) => { if (nextUser) redirectAfterAuth(nextUser, destinationIfRegistered); }, 'SELL');
            return;
        }
        if (statusLoading) return;
        navigate(isRegistered ? destinationIfRegistered : '/seller-Register');
    };

    const redirectAfterAuth = async (nextUser, destinationIfRegistered) => {
        if (!nextUser?.id) return;
        const token = localStorage.getItem('vehiclehub_token');
        if (!token) return navigate('/seller-Register');
        try {
            const res = await fetch(`${getApiBaseUrl()}/sellers/${nextUser.id}/seller-status`, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (!res.ok) return navigate('/seller-Register');
            const json = await res.json();
            navigate(json?.success && json?.isSellerRegistered ? destinationIfRegistered : '/seller-Register');
        } catch (err) {
            console.error('redirectAfterAuth failed', err);
            navigate('/seller-Register');
        }
    };

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

    const unreadNotificationsCount = unreadServerNotifications + (liveNotification && !liveNotification.read ? 1 : 0);

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-30 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl transition-all duration-200 lg:pl-[76px]">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3 lg:px-8">
                    {/* Left: menu + search */}
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        <button
                            onClick={onOpenSidebar}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 sm:h-11 sm:w-11 lg:hidden"
                            aria-label="Open sidebar"
                        >
                            <Menu size={19} />
                        </button>

                        <div className="hidden min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-600 transition focus-within:border-[#001f3f]/30 focus-within:bg-white focus-within:shadow-sm sm:flex">
                            <Search size={17} className="shrink-0 text-slate-400" />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchValue.trim()) {
                                        navigate(`/seller/dashboard/inventory?q=${encodeURIComponent(searchValue.trim())}`);
                                    }
                                }}
                                placeholder="Search inventory, leads, orders..."
                                className="w-full min-w-[160px] bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none lg:min-w-[220px]"
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
                            onClick={() => navigate('/seller/dashboard/notifications')}
                            className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#001f3f]/30 hover:bg-slate-50 sm:h-11 sm:w-11"
                            aria-label="Notifications"
                        >
                            <Bell size={17} className="sm:hidden" />
                            <Bell size={18} className="hidden sm:block" />
                            {unreadNotificationsCount > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white sm:h-5 sm:w-5 sm:text-[10px]">
                                    {unreadNotificationsCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setMessagesOpen(true)}
                            className="relative hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#001f3f]/30 hover:bg-slate-50 xs:inline-flex sm:h-11 sm:w-11"
                            aria-label="Messages"
                        >
                            <MessageCircle size={18} />
                            {unreadMessages > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#001f3f] text-[10px] font-bold text-white ring-2 ring-white">
                                    {unreadMessages}
                                </span>
                            )}
                        </button>

                        {/* <button
                            onClick={() => setDarkMode((v) => !v)}
                            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#001f3f]/30 hover:bg-slate-50 md:inline-flex sm:h-11 sm:w-11"
                            aria-label="Toggle theme"
                        >
                            <SunMoon size={18} />
                        </button> */}

                        {/* Add Vehicle — enabled the moment seller is registered, no approval wait */}
                        <button
                            onClick={() => goSellerAware('/seller/dashboard/add-vehicle')}
                            disabled={statusLoading}
                            className="hidden items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-[#001f3f] to-[#003366] px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-[#001f3f]/25 transition hover:-translate-y-0.5 hover:shadow-lg sm:inline-flex sm:gap-2 sm:px-4 sm:text-sm"
                        >
                            <Plus size={15} /> <span className="hidden sm:inline">Add Vehicle</span>
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
                                        onClick={() => { setDropdownOpen(false); goSellerAware('/seller/dashboard/business-profile'); }}
                                        className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        My profile
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
                                        navigate(`/seller/dashboard/inventory?q=${encodeURIComponent(searchValue.trim())}`);
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
                        onClick={() => goSellerAware('/seller/dashboard/add-vehicle')}
                        disabled={statusLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f3f] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#001f3f]/25 transition hover:bg-[#002a55]"
                    >
                        <Plus size={16} /> Add Vehicle
                    </button>
                </div>
            </header>

            {messagesOpen && (
                <SellerMessagesModal
                    conversations={sellerConversations}
                    onClose={() => setMessagesOpen(false)}
                />
            )}
        </>
    );
};