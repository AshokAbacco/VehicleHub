// VehicleHub/VehicleHub/src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Search, Heart, User, Plus, MapPin, ChevronDown, Menu, X,
    Bell, FileText, ClipboardList, ShoppingCart,
    HelpCircle, Settings, LogOut, Pencil, LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAuthGate } from "../../context/AuthGateContext.jsx";
import { dashboardPathFor, notificationsPathFor, normalizeRole } from "../../utils/roleAccess.js";
import { openSellerArea } from "../../utils/sellerStatus.js";
import { AvatarImage } from '../ui/AvatarImage.jsx';

// Values must match the database: category = Category.name, body = Vehicle.bodyType,
// fuel = Vehicle.fuelType (see SearchPage filters)
const vehicleCategoryPills = [
    { label: "Cars", to: "/search?category=Car" },
    { label: "Motorcycles", to: "/search?category=Bike" },
    { label: "Scooters", to: "/search?category=Scooter" },
    { label: "SUVs", to: "/search?category=Car&body=SUV" },
    { label: "Trucks", to: "/search?category=Truck" },
    { label: "Electric Vehicles", to: "/search?fuel=Electric" },
    { label: "Commercial Vehicles", to: "/search?category=Commercial%20Vehicle" },
];

const TAB_KEYS = ["category", "body", "fuel"];
// A tab is active when the current /search URL has exactly that tab's category/body/fuel
const isTabActive = (location, to) => {
    if (location.pathname !== "/search") return false;
    const current = new URLSearchParams(location.search);
    const target = new URLSearchParams(to.split("?")[1] || "");
    return TAB_KEYS.every((key) => (current.get(key) || "").toLowerCase() === (target.get(key) || "").toLowerCase());
};

const cities = [
    "Bengaluru, Karnataka",
    "Mumbai, Maharashtra",
    "Delhi NCR",
    "Pune, Maharashtra",
    "Hyderabad, Telangana",
];


// Each role's own profile / account page
const profilePathFor = (role) => ({
    admin: '/admin/dashboard/settings',
    seller: '/seller/dashboard/business-profile',
    dealer: '/dealer/dashboard/business-profile',
    inspector: '/field-inspector/profile',
    buyer: '/buyer/dashboard/profile',
})[normalizeRole(role)] || '/buyer/dashboard/profile';

const hiddenWishlistRoles = ['seller', 'dealer', 'inspector', 'admin'];

export const Navbar = () => {
    const { isAuthenticated, user, logout, completeAuth } = useAuth();
    const role = normalizeRole(user?.role || user?.userRole);
    const hideWishlist = isAuthenticated && hiddenWishlistRoles.includes(role);
    const location = useLocation();
    const navigate = useNavigate();
    const [locationOpen, setLocationOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState(cities[0]);
    const [searchValue, setSearchValue] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileMenuPos, setProfileMenuPos] = useState({ top: 0, right: 0 });


    const locationRef = useRef(null);
    const locationMenuRef = useRef(null); // portaled city list (outside <header>, which clips overflow)
    const [locationMenuPos, setLocationMenuPos] = useState({ top: 0, left: 0 });
    const profileRef = useRef(null);
    const profileBtnRef = useRef(null);
    const { requireAuth } = useAuthGate();

    const hiddenPaths = ["/login", "/register", "/forgot-password"];

    // Dashboard button: each role goes to its own dashboard. Sellers are re-checked with the
    // server (an approval / rejection may have happened since this session started).
    const goToDashboard = () => {
        if (role === 'seller' || role === 'dealer') {
            openSellerArea({ navigate, user, completeAuth });
            return;
        }
        navigate(dashboardPathFor(role));
    };

    useEffect(() => {
        setMobileMenuOpen(false);
        setLocationOpen(false);
        setMobileSearchOpen(false);
        setProfileOpen(false);
    }, [location.pathname]);

    // SELL button: approved sellers -> seller dashboard; everyone else -> seller registration
    // (which shows "under review" / "rejected" when an application already exists)
    const redirectToSellerArea = (currentUser) => openSellerArea({ navigate, user: currentUser, completeAuth });

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchValue.trim()) params.set("q", searchValue.trim());
        navigate(`/search?${params.toString()}`);
        setMobileSearchOpen(false);
    };

    const handleLogout = () => {
        setProfileOpen(false);
        logout?.();
        window.location.replace('/');
    };

    const openProfileMenu = () => {
        if (!profileOpen && profileBtnRef.current) {
            const rect = profileBtnRef.current.getBoundingClientRect();
            setProfileMenuPos({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
        setProfileOpen((v) => !v);
    };

    // SELL: signed in -> seller area (dashboard if approved, else the application);
    // visitors go straight to the seller registration form (open to everyone)
    const handleSellClick = () => {
        if (isAuthenticated) {
            redirectToSellerArea(user);
            return;
        }
        navigate('/seller-Register');
    };

    // Place the city list right under the location button (viewport coordinates)
    const placeLocationMenu = () => {
        const rect = locationRef.current?.getBoundingClientRect();
        if (rect) setLocationMenuPos({ top: rect.bottom + 8, left: rect.left });
    };
    useEffect(() => {
        if (!locationOpen) return undefined;
        placeLocationMenu();
        window.addEventListener('scroll', placeLocationMenu, true);
        window.addEventListener('resize', placeLocationMenu);
        return () => {
            window.removeEventListener('scroll', placeLocationMenu, true);
            window.removeEventListener('resize', placeLocationMenu);
        };
    }, [locationOpen]);

    // Close dropdown/location panel on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (
                locationRef.current &&
                !locationRef.current.contains(e.target) &&
                !(locationMenuRef.current && locationMenuRef.current.contains(e.target))
            )
                setLocationOpen(false);
            if (
                profileRef.current &&
                !profileRef.current.contains(e.target) &&
                profileBtnRef.current &&
                !profileBtnRef.current.contains(e.target)
            ) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const Avatar = ({ size = "h-9 w-9" }) => (
        <div className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-300 to-amber-400 ring-2 ring-[#001f3f]`}>
            {/* uploaded photo, or the first letter of the name (no broken image) */}
            <AvatarImage src={user?.avatar} name={user?.name || user?.fullName} letterClassName={`font-bold text-[#001f3f] ${size.includes('12') ? 'text-lg' : 'text-sm'}`} />
        </div>
    );

    // Hidden on the sign-in / sign-up pages. This must come after every hook above —
    // returning earlier crashed the app ("Rendered fewer hooks") when navigating to /login.
    if (hiddenPaths.includes(location.pathname)) return null;

    return (
        <header className="sticky top-0 z-50 w-full overflow-visible overflow-x-hidden border-b border-slate-400/70 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:px-8">
                {/* Logo */}
                <Link to="/" className="flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-lg transition active:scale-95">
                    {/* Brand: settings (gear) mark + MotorDesk, with VehicleHub underneath */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#001f3f] text-white sm:h-9 sm:w-9">
                        <Settings size={18} strokeWidth={2.25} aria-hidden="true" />
                    </div>
                    <span className="flex flex-col leading-none">
                        <span className="text-base font-black tracking-tight text-slate-900 sm:text-lg">MotorDesk</span>
                        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">VehicleHub</span>
                    </span>
                </Link>

                {/* Location picker — desktop only */}
                <div className="relative hidden shrink-0 md:block" ref={locationRef}>
                    <button
                        onClick={() => setLocationOpen((v) => !v)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 transition-all duration-150 hover:border-[#001f3f] hover:bg-slate-50 active:scale-95"
                    >
                        <MapPin size={15} className="shrink-0 text-[#001f3f]" />
                        <span className="max-w-[140px] truncate">{selectedCity}</span>
                        <ChevronDown size={14} className={`shrink-0 text-slate-400 transition ${locationOpen ? "rotate-180" : ""}`} />
                    </button>
                    {/* Portaled to <body>: the sticky <header> has overflow-x-hidden, which (per CSS) also
                        clips vertically, so an absolute dropdown inside it got cut off / hidden behind the page */}
                    {locationOpen && createPortal(
                        <div
                            ref={locationMenuRef}
                            data-location-menu
                            style={{ position: 'fixed', top: locationMenuPos.top, left: locationMenuPos.left }}
                            className="z-[9999] max-h-[60vh] w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
                        >
                            {cities.map((city) => (
                                <button
                                    key={city}
                                    onClick={() => { setSelectedCity(city); setLocationOpen(false); }}
                                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 active:bg-slate-100 ${selectedCity === city ? "bg-[#e6f2ff] font-semibold text-[#001f3f]" : "text-slate-700"}`}
                                >
                                    <MapPin size={13} className="shrink-0" /> {city}
                                </button>
                            ))}
                        </div>,
                        document.body
                    )}
                </div>

                {/* Desktop search bar */}
                <form
                    onSubmit={handleSearch}
                    className="hidden md:flex w-full max-w-[780px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all duration-300 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-lg"
                >
                    <Search size={17} className="shrink-0 text-slate-400" />
                    <input
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder='Search "SUVs, EVs, Bikes..."'
                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                    <button type="submit" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#001f3f] text-white transition-all duration-150 hover:bg-[#002a55] active:scale-90" aria-label="Search">
                        <Search size={15} />
                    </button>
                </form>

                {/* Mobile search trigger */}
                <button
                    onClick={() => setMobileSearchOpen((v) => !v)}
                    className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all duration-150 hover:border-[#001f3f] hover:bg-slate-50 hover:text-[#001f3f] active:scale-90 md:hidden"
                    aria-label="Search"
                >
                    <Search size={17} />
                </button>

                {/* Desktop right-side actions */}
                <div className="cursor-pointer hidden shrink-0 items-center gap-4 lg:flex">
                    {!hideWishlist && (
                        <button
                            onClick={() => (isAuthenticated ? navigate('/buyer/dashboard/wishlist') : requireAuth(() => navigate('/buyer/dashboard/wishlist')))}
                            className="cursor-pointer flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                        >
                            <Heart size={19} />
                            <span className="text-xs">Wishlist</span>
                        </button>
                    )}

                    {isAuthenticated ? (
                        <>
                            <button
                                onClick={() => navigate(notificationsPathFor(role))}
                                className="cursor-pointer flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                            >
                                <span className="relative">
                                    <Bell size={19} />
                                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
                                </span>
                                <span className="text-xs">Alerts</span>
                            </button>

                            <div className="relative cursor-pointer">
                                <button
                                    ref={profileBtnRef}
                                    onClick={openProfileMenu}
                                    className="cursor-pointer flex items-center gap-2 rounded-full p-1 transition-all duration-150 hover:bg-slate-100 active:scale-95"
                                >
                                    <Avatar />
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="cursor-pointer flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                        >
                            <User size={19} />
                            <span className="text-xs">Login</span>
                        </button>
                    )}

                    <button
                        onClick={handleSellClick}
                        className="cursor-pointer group relative inline-flex items-center rounded-full p-[2px] transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#001f3f] via-[#001f3f] to-[#002a55]" />
                        <span className="relative flex items-center gap-2 rounded-full bg-[#001f3f] px-4 py-2 text-white transition-all duration-300 group-hover:bg-[#002a55]">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#001f3f] transition-all duration-300 group-hover:rotate-90">
                                <Plus size={10} className="transition-all duration-300" />
                            </span>
                            <span className="text-sm font-black tracking-widest uppercase text-white">SELL</span>
                        </span>
                    </button>
                </div>

                {/* Mobile menu toggle */}
                <button
                    onClick={() => setMobileMenuOpen((v) => !v)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-90 lg:hidden"
                    aria-label="Menu"
                >
                    {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {/* Mobile search bar */}
            {mobileSearchOpen && (
                <div className="border-t border-slate-100 bg-white px-3 py-2.5 md:hidden">
                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-[#001f3f]"
                    >
                        <Search size={16} className="shrink-0 text-slate-400" />
                        <input
                            autoFocus
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search vehicles..."
                            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        />
                        <button type="submit" className="shrink-0 rounded-md bg-[#001f3f] px-3 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:bg-[#002a55] active:scale-90">
                            Go
                        </button>
                    </form>
                </div>
            )}

            {/* Category pills — desktop */}
            <div className="hidden border-t border-slate-100 md:block">
                <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2.5 lg:px-8 [&::-webkit-scrollbar]:hidden">
                    <Link to="/search" className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#002040] px-4 py-1.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#001a33] active:scale-95">
                        <Menu size={14} /> All Vehicles
                    </Link>
                    {vehicleCategoryPills.map((cat) => (
                        <Link
                            key={cat.label}
                            to={cat.to}
                            aria-current={isTabActive(location, cat.to) ? "page" : undefined}
                            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-all duration-150 active:scale-95 ${isTabActive(location, cat.to)
                                ? "border-[#001f3f] bg-[#001f3f] font-semibold text-white"
                                : "border-slate-200 text-slate-600 hover:border-[#001f3f] hover:bg-slate-50 hover:text-slate-900"}`}
                        >
                            {cat.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile dropdown menu */}
            {mobileMenuOpen && (
                <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
                    <div className="flex flex-wrap gap-2">
                        <Link to="/search" className="rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white transition active:scale-95">
                            All Vehicles
                        </Link>
                        {vehicleCategoryPills.map((cat) => (
                            <Link
                                key={cat.label}
                                to={cat.to}
                                aria-current={isTabActive(location, cat.to) ? "page" : undefined}
                                className={`rounded-full border px-3.5 py-1.5 text-xs transition active:scale-95 ${isTabActive(location, cat.to)
                                    ? "border-[#001f3f] bg-[#001f3f] font-semibold text-white"
                                    : "border-slate-200 text-slate-600 hover:border-[#001f3f]"}`}
                            >
                                {cat.label}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <p className="flex items-center gap-1.5 text-sm text-slate-600">
                            <MapPin size={14} className="shrink-0 text-[#001f3f]" /> {selectedCity}
                        </p>
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                        {isAuthenticated && (
                            <>
                                <button onClick={() => navigate(notificationsPathFor(role))} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]">
                                    <Bell size={16} /> Notifications
                                </button>
                            </>
                        )}
                        {!hideWishlist && (
                            <button
                                onClick={() => (isAuthenticated ? navigate('/buyer/dashboard/wishlist') : requireAuth(() => navigate('/buyer/dashboard/wishlist')))}
                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                            >
                                <Heart size={16} /> Wishlist
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (isAuthenticated) {
                                    setProfileOpen(false);
                                    navigate(profilePathFor(role));
                                    return;
                                }
                                // Sign in -> their own dashboard
                                setProfileOpen(false);
                                navigate('/login');
                            }}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                        >
                            <User size={16} /> {isAuthenticated ? "My Account" : "Login"}
                        </button>
                        {/* Dashboard — always enabled, just routes based on registration */}
                        {isAuthenticated && (
                            <button
                                onClick={goToDashboard}
                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                            >
                                <LayoutDashboard size={16} /> Dashboard
                            </button>
                        )}
                        {isAuthenticated && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.98]"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        )}
                        <button
                            onClick={handleSellClick}
                            className="flex items-center justify-center gap-1.5 rounded-full bg-[#002040] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#001a33] active:scale-95"
                        >
                            <Plus size={16} /> SELL
                        </button>
                    </div>
                </div>
            )}

            {/* Profile dropdown menu — portaled, responsive width, closes on outside click */}
            {profileOpen && createPortal(
                <div
                    ref={profileRef}
                    style={{ position: "fixed", top: profileMenuPos.top, right: profileMenuPos.right, width: 'min(320px, calc(100vw - 16px))' }}
                    className="rounded-2xl bg-white shadow-2xl border border-slate-200 z-[9999]"
                >
                    <div className="flex items-center gap-3 px-5 pb-4 pt-5">
                        <Avatar size="h-12 w-12" />
                        <p className="truncate text-base font-bold text-slate-900">{user?.name || "User"}</p>
                    </div>

                    <div className="space-y-2 px-4 pb-4">
                        <button
                            onClick={() => { setProfileOpen(false); goToDashboard(); }}
                            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg bg-[#001f3f] py-2.5 text-sm font-bold text-white transition-all duration-150 hover:bg-[#002a55] active:scale-[0.97]"
                        >
                            <LayoutDashboard size={14} /> Go to Dashboard
                        </button>
                    </div>

                    <div className="border-t border-slate-100 p-2">
                        <button
                            onClick={handleLogout}
                            className="cursor-pointer hover:bg-red-600 hover:text-amber-50 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-red-600 transition-all duration-150 hover:bg-red-50 active:scale-[0.97]"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </header>
    );
};