import { useState, useEffect } from 'react';
import { SellerNavbar } from './SellerNavbar.jsx';
import { SellerSidebar } from './SellerSidebar.jsx';

export const SellerDashboardLayout = ({ children }) => {
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = mobileDrawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileDrawerOpen]);

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
            <div className="hidden lg:block">
                <SellerSidebar />
            </div>

            <div
                className={`fixed inset-0 z-50 lg:hidden ${mobileDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                aria-hidden={!mobileDrawerOpen}
            >
                <div
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${mobileDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
                />
                <div
                    className={`absolute inset-y-0 left-0 h-full w-[264px] max-w-[80vw] bg-white shadow-2xl transition-transform duration-300 ease-out ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <SellerSidebar
                        forceExpanded
                        isMobile
                        onNavigate={() => setMobileDrawerOpen(false)}
                        onClose={() => setMobileDrawerOpen(false)}
                    />
                </div>
            </div>

            <SellerNavbar onOpenSidebar={() => setMobileDrawerOpen(true)} />

            <main className="min-h-screen pt-[104px] transition-all duration-200 sm:pt-[84px] lg:pl-[76px] lg:pt-20">
                <div className="mx-auto max-w-8xl animate-fadeInUp px-3 py-5 sm:px-5 sm:py-6 lg:px-8">{children}</div>
            </main>
        </div>
    );
};