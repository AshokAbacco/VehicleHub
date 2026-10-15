// VehicleHub/VehicleHub/src/components/admin/AdminDashboardLayout.jsx
import { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar.jsx';
import { AdminNavbar } from './AdminNavbar.jsx';
import { useGetPendingVehiclesQuery, useGetPendingSellerCountQuery } from '../../services/adminApiSlice.js';

export const AdminDashboardLayout = ({ children }) => {
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    // Live sidebar badges (vehicles waiting for approval, seller applications waiting for review)
    const { data: pendingVehiclesData } = useGetPendingVehiclesQuery(undefined, { pollingInterval: 30000 });
    const { data: pendingSellersData } = useGetPendingSellerCountQuery(undefined, { pollingInterval: 30000 });
    const badges = {
        pending: pendingVehiclesData?.data?.total ?? pendingVehiclesData?.data?.vehicles?.length ?? 0,
        sellers: pendingSellersData?.count ?? 0,
    };

    // Lock background scroll while the drawer is open
    useEffect(() => {
        document.body.style.overflow = mobileDrawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileDrawerOpen]);

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
            {/* Desktop sidebar — hidden below lg */}
            <div className="hidden lg:block">
                <AdminSidebar badges={badges} />
            </div>

            {/* Mobile sidebar drawer — backdrop fades in, panel slides in from the left */}
            <div
                className={`fixed inset-0 z-50 lg:hidden ${mobileDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                aria-hidden={!mobileDrawerOpen}
            >
                <div
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${mobileDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
                />
                <div
                    className={`absolute inset-y-0 left-0 h-full w-[264px] max-w-[80vw] bg-white shadow-2xl transition-transform duration-300 ease-out ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <AdminSidebar
                        badges={badges}
                        forceExpanded
                        isMobile
                        onNavigate={() => setMobileDrawerOpen(false)}
                        onClose={() => setMobileDrawerOpen(false)}
                    />
                </div>
            </div>

            <AdminNavbar sidebarWidth={76} onOpenMobileMenu={() => setMobileDrawerOpen(true)} />

            <main className="min-h-screen pt-[68px] transition-all duration-200 lg:pl-[76px] lg:pt-20">
                <div className="mx-auto max-w-7xl px-3 py-5 sm:px-5 sm:py-6 lg:px-8">{children}</div>
            </main>
        </div>
    );
};