import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { InspectorSidebar } from '../field-inspector/InspectorSidebar.jsx';
import { InspectorNavbar } from '../field-inspector/InspectorNavbar.jsx';

const titleMap = {
    '/field-inspector/dashboard': 'Dashboard',
    '/field-inspector/inspections': 'My Inspections',
    '/field-inspector/inspections/pending': 'Pending Inspections',
    '/field-inspector/inspections/today': "Today's Inspections",
    '/field-inspector/inspections/in-progress': 'In Progress',
    '/field-inspector/inspections/completed': 'Completed Inspections',
    '/field-inspector/calendar': 'Inspection Calendar',
    '/field-inspector/reports': 'Verification Reports',
    '/field-inspector/notifications': 'Notifications',
    '/field-inspector/messages': 'Messages',
    '/field-inspector/profile': 'Profile',
    '/field-inspector/settings': 'Settings',
};

export const FieldInspectorLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const title = titleMap[location.pathname] || 'Field Inspector';

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] text-slate-900">
            <InspectorSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
            <div className="lg:pl-[260px]">
                <InspectorNavbar title={title} breadcrumb="Field Inspector" onOpenSidebar={() => setMobileOpen(true)} />
                <main className="p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};