import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search, MoreHorizontal, Pencil, BarChart3, Trash2, Eye,
    Plus, Clock, CheckCircle2, XCircle, LayoutGrid, ChevronLeft, ChevronRight, Loader2, RefreshCw, Archive, FileEdit
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { VehicleDetailModal } from './VehicleDetailModal.jsx';
import { EditVehicleModal } from './EditVehicleModal.jsx';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.jsx';

import {
    useGetSellerInventoryQuery,
    useDeleteMyVehicleMutation,
} from '../../services/sellerApiSlice.js';

const sortOptions = [
    { value: 'date-desc', label: 'Newest first' },
    { value: 'date-asc', label: 'Oldest first' },
    { value: 'price-desc', label: 'Highest price' },
    { value: 'price-asc', label: 'Lowest price' },
];

// These now map 1:1 with the actual VehicleListingStatus enum — no invented "live" status
const statusFilterOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_verification', label: 'Under verification' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'sold', label: 'Sold' },
    { value: 'archived', label: 'Archived' },
];

const stageTabs = [
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'under_verification', label: 'Under verification', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle2 },
    { id: 'rejected', label: 'Rejected', icon: XCircle },
    { id: 'sold', label: 'Sold', icon: CheckCircle2 },
    { id: 'draft', label: 'Draft', icon: FileEdit },
    { id: 'archived', label: 'Archived', icon: Archive },
];

const stageBadge = {
    approved: 'bg-emerald-100 text-emerald-700',
    draft: 'bg-cyan-100 text-cyan-700',
    pending: 'bg-amber-100 text-amber-700',
    under_verification: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    sold: 'bg-purple-100 text-purple-700',
    archived: 'bg-slate-100 text-slate-600',
};

const ITEMS_PER_PAGE = 10;

const RowActionsMenu = ({ listing, onView, onEdit, onAnalytics, onDelete }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const items = [
        { label: 'View details', icon: Eye, onClick: () => onView(listing) },
        { label: 'Edit', icon: Pencil, onClick: () => onEdit(listing) },
        { label: 'Analytics', icon: BarChart3, onClick: () => onAnalytics(listing) },
        { label: 'Delete', icon: Trash2, onClick: () => onDelete(listing), danger: true },
    ];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="More actions"
            >
                <MoreHorizontal size={16} />
            </button>
            {open && (
                <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    {items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.label}
                                onClick={() => { item.onClick(); setOpen(false); }}
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-slate-50 ${item.danger ? 'text-red-600' : 'text-slate-700'}`}
                            >
                                <Icon size={13} /> {item.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const InventoryOverviewTable = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // No sellerId argument — the backend scopes results to the authenticated user via the JWT
    const { data, isLoading, isError, refetch } = useGetSellerInventoryQuery();
    const rawVehicles = Array.isArray(data) ? data : data?.vehicles || [];

    const [deleteVehicle] = useDeleteMyVehicleMutation();

    const validStages = ['all', 'pending', 'under_verification', 'approved', 'rejected', 'sold', 'draft', 'archived'];
    const initialStage = searchParams.get('stage');
    const [activeStage, setActiveStage] = useState(validStages.includes(initialStage) ? initialStage : 'all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('date-desc');
    const [currentPage, setCurrentPage] = useState(1);

    // Keep the active stage in sync if the "?stage=" query param changes (e.g. clicking a dashboard card again)
    useEffect(() => {
        const stageParam = searchParams.get('stage');
        if (validStages.includes(stageParam)) setActiveStage(stageParam);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const [modalListing, setModalListing] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Directly lowercases the real enum value — no invented "live" bucket
    const normalizeStage = (status) => {
        if (!status) return 'pending';
        return String(status).toLowerCase(); // "APPROVED" -> "approved", "PENDING" -> "pending", etc.
    };

    const items = useMemo(() => {
        if (!Array.isArray(rawVehicles)) return [];

        return rawVehicles.map((v) => ({
            id: v.id,
            title: v.title || `${v.brand || ''} ${v.model || ''}`.trim() || 'Untitled Vehicle',
            category: v.category || 'Vehicle',
            price: v.price || 0,
            stage: normalizeStage(v.status),
            createdAt: v.createdAt ? new Date(v.createdAt) : new Date(),
            thumb: v.images?.[0] || '🚘',
            raw: v,
        }));
    }, [rawVehicles]);

    const stageCounts = useMemo(() => {
        const counts = { all: items.length, pending: 0, under_verification: 0, approved: 0, rejected: 0, sold: 0, draft: 0, archived: 0 };
        items.forEach((i) => {
            if (counts[i.stage] !== undefined) counts[i.stage] += 1;
        });
        return counts;
    }, [items]);

    const filtered = useMemo(() => items
        .filter((l) => activeStage === 'all' || l.stage === activeStage)
        .filter((l) => statusFilter === 'all' || l.stage === statusFilter)
        .filter((l) => l.title.toLowerCase().includes(search.trim().toLowerCase()))
        .sort((a, b) => {
            if (sort === 'date-desc') return b.createdAt - a.createdAt;
            if (sort === 'date-asc') return a.createdAt - b.createdAt;
            if (sort === 'price-desc') return b.price - a.price;
            if (sort === 'price-asc') return a.price - b.price;
            return 0;
        }), [items, activeStage, statusFilter, search, sort]);

    useEffect(() => { setCurrentPage(1); }, [activeStage, statusFilter, search, sort]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleAddVehicle = () => navigate('/seller/dashboard/add-vehicle');
    // const handleAnalytics = (l) => navigate(`/seller/dashboard/analytics?vehicle=${l.id}`);

    const handleView = (l) => setModalListing(l.raw);
    const handleEdit = (l) => setEditTarget(l.raw);

    const handleDeleteRequest = (l) => setDeleteTarget(l);
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            await deleteVehicle(deleteTarget.id).unwrap();
            setDeleteTarget(null);
            refetch();
        } catch (err) {
            console.error('Failed to delete vehicle:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-[#001f3f]" />
                <span className="ml-3 text-sm font-medium text-slate-600">Loading Inventory...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
                <p className="text-sm font-semibold text-red-500">Failed to load vehicle data.</p>
                <button onClick={() => refetch()} className="mt-3 flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200">
                    <RefreshCw size={14} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Vehicle Inventory</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Manage every vehicle across its lifecycle.</p>
                </div>
                <button
                    onClick={handleAddVehicle}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#001f3f] to-[#003366] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5"
                >
                    <Plus size={16} /> Add Vehicle
                </button>
            </div>

            <div className="border-b border-slate-100 bg-slate-50/50 p-4">
                <div className="flex flex-wrap gap-1.5">
                    {stageTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeStage === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveStage(tab.id)}
                                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${isActive ? 'bg-[#001f3f] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <Icon size={13} />
                                {tab.label}
                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    {stageCounts[tab.id] || 0}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-[#001f3f]/30 focus-within:bg-white">
                    <Search size={15} className="shrink-0 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search vehicles..."
                        className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none"
                    >
                        {statusFilterOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="divide-y divide-slate-100 md:hidden">
                    {paginated.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No vehicles found matching your criteria.</p> : paginated.map((listing) => (
                        <article key={listing.id} className="p-4">
                            <div className="flex items-start gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">{listing.thumb}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-slate-900">{listing.title}</p>
                                    <p className="mt-1 text-xs text-slate-500">{listing.category} · {formatCurrency(listing.price)}</p>
                                    <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${stageBadge[listing.stage] || 'bg-slate-100 text-slate-600'}`}>{listing.stage.replaceAll('_', ' ')}</span>
                                </div>
                                <RowActionsMenu listing={listing} onView={handleView} onEdit={handleEdit} onDelete={handleDeleteRequest} />
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500"><span>Added {listing.createdAt.toLocaleDateString()}</span><div className="flex gap-1"><button onClick={() => handleView(listing)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" title="View details"><Eye size={15} /></button><button onClick={() => handleEdit(listing)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" title="Edit"><Pencil size={15} /></button></div></div>
                        </article>
                    ))}
                </div>
                <table className="hidden w-full text-left text-sm text-slate-600 md:table">
                    <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <tr>
                            <th scope="col" className="px-5 py-3.5">Vehicle</th>
                            <th scope="col" className="px-5 py-3.5">Category</th>
                            <th scope="col" className="px-5 py-3.5">Price</th>
                            <th scope="col" className="px-5 py-3.5">Status</th>
                            <th scope="col" className="px-5 py-3.5">Added Date</th>
                            <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500">
                                    No vehicles found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            paginated.map((listing) => (
                                <tr key={listing.id} className="transition hover:bg-slate-50/80">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {typeof listing.thumb === 'string' && listing.thumb.startsWith('http') ? (
                                                <img src={listing.thumb} alt={listing.title} className="h-10 w-10 rounded-xl border border-slate-100 object-cover" />
                                            ) : (
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                                                    {listing.thumb}
                                                </span>
                                            )}
                                            <div>
                                                <p className="font-semibold text-slate-900">{listing.title}</p>
                                                {listing.stage === 'rejected' && listing.raw?.rejectReason && (
                                                    <p className="text-xs text-red-500">Reason: {listing.raw.rejectReason}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-xs font-medium text-slate-600">{listing.category}</td>
                                    <td className="px-5 py-4 font-semibold text-slate-900">{formatCurrency(listing.price)}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${stageBadge[listing.stage] || 'bg-slate-100 text-slate-600'}`}>
                                            {listing.stage}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-500">{listing.createdAt.toLocaleDateString()}</td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleView(listing)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="View details">
                                                <Eye size={15} />
                                            </button>
                                            <button onClick={() => handleEdit(listing)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Edit">
                                                <Pencil size={15} />
                                            </button>
                                            <RowActionsMenu
                                                listing={listing}
                                                onView={handleView}
                                                onEdit={handleEdit}
                                                // onAnalytics={handleAnalytics}
                                                onDelete={handleDeleteRequest}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {filtered.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-xs text-slate-500">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                            <ChevronLeft size={14} /> Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1 rounded-lg bg-[#001f3f] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#002a55] disabled:opacity-40"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {modalListing && (
                <VehicleDetailModal
                    listing={modalListing}
                    onClose={() => setModalListing(null)}
                    onEdit={handleEdit}
                />
            )}

            {editTarget && (
                <EditVehicleModal vehicle={editTarget} onClose={() => setEditTarget(null)} />
            )}

            {deleteTarget && (
                <ConfirmDeleteModal
                    itemName={deleteTarget.title}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </div>
    );
};