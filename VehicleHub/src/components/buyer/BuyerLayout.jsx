// VehicleHub/VehicleHub/src/components/buyer/BuyerLayout.jsx
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BuyerSidebar } from './BuyerSidebar.jsx';
import { BuyerNavbar } from './BuyerNavbar.jsx';

const titleMap = {
    '/buyer/dashboard': 'Dashboard',
    '/buyer/dashboard/wishlist': 'Wishlist',
    '/buyer/dashboard/inquiries': 'My Inquiries',
    '/buyer/dashboard/orders': 'Orders',
    '/buyer/dashboard/notifications': 'Notifications',
    '/buyer/dashboard/profile': 'Profile',
    '/buyer/dashboard/settings': 'Settings',
};

export const BuyerLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const title = titleMap[location.pathname.replace(/\/$/, '')] || 'Buyer';

    // Close the mobile drawer whenever the route changes
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] text-slate-900">
            <BuyerSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

            {/* Sidebar space: the 76px icon rail only exists on lg+ (>=1024px), so only reserve it there.
                Below lg the sidebar is a slide-in drawer and the page uses the full width.
                The rail expands OVER the page on hover, so this padding never changes. */}
            <div className="min-w-0 lg:pl-[76px]">
                <BuyerNavbar title={title} breadcrumb="Buyer" onOpenSidebar={() => setMobileOpen(true)} />
                {/* PAGE_WIDTH: full width, capped at 1600px on very large screens (keep in sync with BuyerNavbar) */}
                <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};