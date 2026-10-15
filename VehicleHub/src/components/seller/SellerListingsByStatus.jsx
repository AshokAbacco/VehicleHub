// VehicleHub/VehicleHub/src/components/seller/SellerListingsByStatus.jsx
// Shared page for the seller's Draft / Pending / Approved / Rejected tabs.
// Data: GET /api/vehicles/my/listings?status=<status> — only the signed-in seller's own vehicles
// (the backend filters by sellerId; edits and deletes are ownership-checked on the server too).
import { useMemo, useState } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GenericTablePage } from './GenericTablePage.jsx';
import { EditVehicleModal } from './EditVehicleModal.jsx';
import { useGetSellerInventoryQuery, useDeleteMyVehicleMutation } from '../../services/sellerApiSlice.js';

export const SellerListingsByStatus = ({ status, title, subtitle, columns, emptyText, loadingText }) => {
    const { data, isLoading, isFetching, isError, error, refetch } = useGetSellerInventoryQuery(status);
    const [deleteMyVehicle] = useDeleteMyVehicleMutation();
    const [editingVehicle, setEditingVehicle] = useState(null);

    const rows = useMemo(() => (Array.isArray(data) ? data : data?.vehicles || []), [data]);

    const handleDelete = async (row) => {
        try {
            await deleteMyVehicle(row.id).unwrap();
            toast.success('Listing deleted');
            return true;
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete listing');
            return false;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-16 text-slate-400">
                <Loader2 size={24} className="animate-spin" />
                <p className="text-sm font-medium">{loadingText || `Loading ${title.toLowerCase()}...`}</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-16 text-red-600">
                <AlertCircle size={24} />
                <p className="text-sm font-medium">{error?.data?.message || `Failed to load ${title.toLowerCase()}.`}</p>
                <button
                    onClick={refetch}
                    disabled={isFetching}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                >
                    <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} /> Try again
                </button>
            </div>
        );
    }

    return (
        <>
            <GenericTablePage
                title={title}
                subtitle={subtitle}
                rows={rows}
                columns={columns}
                emptyText={emptyText}
                onDelete={handleDelete}
                onEdit={(row) => setEditingVehicle(row)}
            />
            {editingVehicle && (
                <EditVehicleModal key={editingVehicle.id} vehicle={editingVehicle} onClose={() => setEditingVehicle(null)} />
            )}
        </>
    );
};
