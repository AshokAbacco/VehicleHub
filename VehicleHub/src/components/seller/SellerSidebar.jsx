// import { useState } from 'react';
// import {
//     Home, ShoppingBag, FileText, XCircle, Users, Users2,
//     CalendarDays, CreditCard, BarChart3, Car, MessageSquare, Star, Bell, Megaphone,
//     ShieldCheck, Settings, LifeBuoy, Archive, ChevronLeft, ChevronRight, Sparkles,
// } from 'lucide-react';
// import { NavLink } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext.jsx';

// const sections = [
//     { title: 'Marketplace', accent: 'text-[#001f3f]', items: [{ to: '/seller/dashboard', label: 'Dashboard', icon: Home }] },
//     {
//         title: 'Inventory', accent: 'text-emerald-600',
//         items: [
//             { to: '/seller/dashboard/active-listings', label: 'My Vehicles', icon: ShoppingBag },
//             { to: '/seller/dashboard/inventory', label: 'Inventory', icon: ShoppingBag },
//             { to: '/seller/dashboard/sold-vehicles', label: 'Sold Vehicles', icon: Archive },
//         ],
//     },
// {
//     title: 'Sales', accent: 'text-violet-600',
//     items: [
//         // { to: '/seller/dashboard/leads', label: 'Leads', icon: MessageSquare },
//            { to: '/seller/dashboard/customers', label: 'Customers', icon: Users },
//           { to: '/seller/dashboard/inspection-requests', label: 'Inspection Requests', icon: Car },
//         // { to: '/seller/dashboard/inspection-calendar', label: 'Inspection Calendar', icon: CalendarDays },
//         { to: '/seller/dashboard/orders', label: 'Orders', icon: CreditCard },
//         // { to: '/seller/dashboard/invoices', label: 'Invoices', icon: FileText },
//         { to: '/seller/dashboard/payments', label: 'Payments', icon: CreditCard },
//         { to: '/seller/dashboard/revenue', label: 'Revenue', icon: BarChart3 },
//         { to: '/seller/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
//         { to: '/seller/dashboard/vehicle-reports', label: 'Vehicle Reports', icon: Car },
//     ],
// },
//     // {
//     //     title: 'Engagement', accent: 'text-fuchsia-600',
//     //     items: [
//     //         { to: '/seller/dashboard/messages', label: 'Messages', icon: MessageSquare },
//     //         { to: '/seller/dashboard/reviews', label: 'Reviews', icon: Star },
//     //         { to: '/seller/dashboard/notifications', label: 'Notifications', icon: Bell },
//     //         { to: '/seller/dashboard/advertisement-manager', label: 'Advertisement Manager', icon: Megaphone },
//     //     ],
//     // },
//     // {
//     //     title: 'Business', accent: 'text-amber-600',
//     //     items: [
//     //         { to: '/seller/dashboard/subscription', label: 'Subscription', icon: ShieldCheck },
//     //         { to: '/seller/dashboard/business-profile', label: 'Business Profile', icon: FileText },
//     //         { to: '/seller/dashboard/documents', label: 'Documents', icon: FileText },
//     //         { to: '/seller/dashboard/team-members', label: 'Team Members', icon: Users2 },
//     //     ],
//     // },
//     {
//         title: 'Account', accent: 'text-slate-500',
//         items: [
//             { to: '/seller/dashboard/settings', label: 'Settings', icon: Settings },
//             { to: '/seller/dashboard/support', label: 'Support', icon: LifeBuoy },
//         ],
//     },
// ];

// export const SellerSidebar = ({ isMobile = false, onClose }) => {
//     const { logout, user } = useAuth();
//     const [collapsed, setCollapsed] = useState(false);
//     const isCollapsed = !isMobile && collapsed;

//     return (
//         <aside
//             className={`${isMobile ? 'relative w-full' : 'fixed inset-y-0 left-0'} z-40 flex h-full flex-col border-r border-slate-200 bg-white pb-4 shadow-xl shadow-slate-900/5 transition-all duration-300 ${isCollapsed ? 'w-[84px]' : 'w-[280px]'
//                 }`}
//         >
//             {/* Header with brand mark */}
//             <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
//                 {!isCollapsed ? (
//                     <div className="flex min-w-0 items-center gap-2.5">
//                         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#001f3f] text-white shadow-md shadow-[#001f3f]/20">
//                             <Sparkles size={16} />
//                         </div>
//                         <div className="min-w-0">
//                             <p className="truncate text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Seller panel</p>
//                             <h2 className="truncate text-base font-extrabold text-slate-900">VehicleHub Pro</h2>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#001f3f] text-white">
//                         <Sparkles size={16} />
//                     </div>
//                 )}
//                 {isMobile && (
//                     <button onClick={onClose} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">Close</button>
//                 )}
//             </div>

//             <div className="flex-1 overflow-y-auto px-2 py-4">
//                 {!isCollapsed && (
//                     <div className="mb-5 overflow-hidden rounded-2xl border border-[#001f3f]/10 bg-gradient-to-br from-[#e6f2ff] to-white p-4 shadow-sm">
//                         <div className="flex items-center gap-2">
//                             <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
//                             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#001f3f]/70">Business</p>
//                         </div>
//                         <p className="mt-2 truncate text-sm font-extrabold text-slate-900">{user?.businessName || 'RK Dealerships'}</p>
//                         <p className="mt-1 text-xs font-medium text-slate-500">Premium plan • Auto-renew</p>
//                     </div>
//                 )}

//                 {sections.map((section) => (
//                     <div key={section.title} className="mb-6 px-2">
//                         {!isCollapsed && (
//                             <p className={`px-3 pb-2.5 text-[10px] font-bold uppercase tracking-[0.3em] ${section.accent}`}>{section.title}</p>
//                         )}
//                         <div className="space-y-1">
//                             {section.items.map((item) => {
//                                 const Icon = item.icon;
//                                 return (
//                                     <NavLink
//                                         key={item.to}
//                                         to={item.to}
//                                         onClick={onClose}
//                                         end={item.to === '/seller/dashboard'}
//                                         title={isCollapsed ? item.label : undefined}
//                                         className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isCollapsed ? 'justify-center px-0' : ''
//                                             } ${isActive
//                                                 ? 'bg-[#001f3f] text-white shadow-md shadow-[#001f3f]/20'
//                                                 : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
//                                             }`}
//                                     >
//                                         <Icon size={17} className="shrink-0" />
//                                         {!isCollapsed && <span className="truncate">{item.label}</span>}
//                                     </NavLink>
//                                 );
//                             })}
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             <div className="mt-auto px-5">
//                 <button
//                     onClick={logout}
//                     title={isCollapsed ? 'Logout' : undefined}
//                     className={`mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-600 ${isCollapsed ? 'flex justify-center px-0' : ''}`}
//                 >
//                     {isCollapsed ? <XCircle size={16} /> : 'Logout'}
//                 </button>

//                 {!isMobile && (
//                     <button
//                         onClick={() => setCollapsed((v) => !v)}
//                         className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
//                     >
//                         {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
//                         {!isCollapsed && 'Collapse'}
//                     </button>
//                 )}
//             </div>
//         </aside>
//     );
// };
import { useState } from 'react';
import { Home, ShoppingBag, Archive, Sparkles, X, Bell, LogOut, Users, Car, MessageSquare } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const sections = [
    { title: 'Marketplace', accent: 'text-[#001f3f]', items: [{ to: '/seller/dashboard', label: 'Dashboard', icon: Home, end: true }] },
    {
        title: 'Inventory', accent: 'text-emerald-600',
        items: [
            { to: '/seller/dashboard/active-listings', label: 'My Vehicles', icon: ShoppingBag },
            { to: '/seller/dashboard/inventory', label: 'Inventory', icon: ShoppingBag },
            { to: '/seller/dashboard/sold-vehicles', label: 'Sold Vehicles', icon: Archive },
            { to: '/seller/dashboard/inspection-requests', label: 'Inspection Requests', icon: Car },
            { to: '/seller/dashboard/purchase-requests', label: 'Purchase Requests', icon: ShoppingBag },
            { to: '/seller/dashboard/notifications', label: 'Notifications', icon: Bell },
        ],
    },
];

export const SellerSidebar = ({ forceExpanded = false, isMobile = false, onNavigate, onClose }) => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [hoverExpanded, setHoverExpanded] = useState(false);
    const expanded = forceExpanded || hoverExpanded;

    const handleLinkClick = () => onNavigate?.();

    const handleLogout = () => {
        handleLinkClick();
        logout?.();
        window.location.replace('/');
    };

    return (
        <aside
            onMouseEnter={() => !forceExpanded && setHoverExpanded(true)}
            onMouseLeave={() => !forceExpanded && setHoverExpanded(false)}
            className={`${isMobile ? 'relative w-full' : 'fixed inset-y-0 left-0 z-40'} flex h-full flex-col bg-white ${isMobile ? '' : 'border-r border-slate-200 shadow-xl shadow-slate-900/5 transition-[width] duration-300 ease-out'
                } ${expanded ? 'w-[264px]' : 'w-[76px]'}`}
        >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#001f3f] to-[#003d7a] text-white shadow-md shadow-[#001f3f]/20 transition-transform duration-300 hover:rotate-6">
                    <Sparkles size={16} />
                </div>
                {expanded && (
                    <div className="min-w-0 flex-1 animate-fadeInUp opacity-0" style={{ animationDelay: '50ms' }}>
                        <p className="truncate text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Seller panel</p>
                        <h2 className="truncate text-sm font-extrabold text-slate-900">VehicleHub Pro</h2>
                    </div>
                )}
                {isMobile && (
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        aria-label="Close menu"
                    >
                        <X size={17} />
                    </button>
                )}
            </div>

            {expanded && (
                <div className="mx-3 mt-4 animate-fadeInUp opacity-0 overflow-hidden rounded-2xl border border-[#001f3f]/10 bg-gradient-to-br from-[#e6f2ff] to-white p-4 shadow-sm" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#001f3f]/70">Business</p>
                    </div>
                    <p className="mt-2 truncate text-sm font-extrabold text-slate-900">{user?.businessName || 'RK Dealerships'}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">Premium plan • Auto-renew</p>
                </div>
            )}

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
                {sections.map((section, sIdx) => (
                    <div key={section.title} className="mb-5 px-1.5">
                        {expanded && (
                            <p className={`mb-2 truncate px-2.5 text-[10px] font-bold uppercase tracking-[0.25em] ${section.accent}`}>{section.title}</p>
                        )}
                        <div className="space-y-1">
                            {section.items.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        onClick={handleLinkClick}
                                        title={!expanded ? item.label : undefined}
                                        style={{ animationDelay: `${(sIdx * 6 + idx) * 30}ms` }}
                                        className={({ isActive }) =>
                                            `group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${expanded ? '' : 'justify-center'
                                            } ${isActive
                                                ? 'bg-gradient-to-r from-[#001f3f] to-[#002a55] text-white shadow-md shadow-[#001f3f]/20'
                                                : 'text-slate-600 hover:translate-x-0.5 hover:bg-slate-50 hover:text-slate-900'
                                            }`
                                        }
                                    >
                                        <Icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                                        {expanded && <span className="truncate">{item.label}</span>}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-slate-100 px-3 py-3">
                <button
                    onClick={handleLogout}
                    title={!expanded ? 'Logout' : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 ${expanded ? '' : 'justify-center'}`}
                >
                    <LogOut size={17} className="shrink-0" />
                    {expanded && 'Logout'}
                </button>
            </div>
        </aside>
    );
};