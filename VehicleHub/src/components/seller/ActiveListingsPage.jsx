import { useMemo, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { GenericTablePage } from '../../components/seller/GenericTablePage.jsx';
import { EditVehicleModal } from '../../components/seller/EditVehicleModal.jsx';
import { useGetSellerInventoryQuery, useDeleteMyVehicleMutation } from '../../services/sellerApiSlice.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { toast } from 'react-hot-toast';

export const ActiveListingsPage = () => {
    const { user } = useAuth();
    const sellerId = user?.id || null;
    const { data, isLoading, isError, error } = useGetSellerInventoryQuery(undefined, { skip: !sellerId });
    const vehicles = Array.isArray(data) ? data : data?.vehicles || [];
    const [deleteMyVehicle] = useDeleteMyVehicleMutation();
    const [editingVehicle, setEditingVehicle] = useState(null);

    const rows = useMemo(
        () =>
            (vehicles || []).map((v) => ({
                ...v,
                createdAt: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : undefined,
                updatedAt: v.updatedAt ? new Date(v.updatedAt).toLocaleDateString() : undefined,
            })),
        [vehicles]
    );

    const handleDelete = async (row) => {
        try {
            await deleteMyVehicle(row.id).unwrap();
            toast.success('Listing deleted');
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete listing');
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-16 text-slate-400">
                <Loader2 size={24} className="animate-spin" />
                <p className="text-sm font-medium">Loading your active listings...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-16 text-red-600">
                <AlertCircle size={24} />
                <p className="text-sm font-medium">{error?.data?.message || 'Failed to load your listings.'}</p>
            </div>
        );
    }

    return (
        <>
            <GenericTablePage
                title="All Listings"
                subtitle="All your listings (approved or pending)."
                rows={rows}
                emptyText="You don't have any listings yet. Add a vehicle to get started."
                onDelete={handleDelete}
                onEdit={(row) => setEditingVehicle(row)}
                columns={[
                    { key: 'title', label: 'Vehicle' },
                    { key: 'category', label: 'Category' },
                    { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
                    { key: 'views', label: 'Views' },
                    {
                        key: 'status',
                        label: 'Approval',
                        render: (r) => {
                            const s = String(r.status || '').toUpperCase();
                            const isApproved = s === 'APPROVED' || s === 'AVAILABLE' || s === 'LIVE';
                            const isRejected = s === 'REJECTED';
                            const isUnderVerification = s === 'UNDER_VERIFICATION';
                            return (
                                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${isApproved
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : isRejected
                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                        : isUnderVerification
                                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                                    }`}>
                                    {isApproved ? 'Approved' : isRejected ? 'Rejected' : isUnderVerification ? 'Under verification' : 'Pending'}
                                </span>
                            );
                        },
                    },
                ]}
            />
            {editingVehicle && (
                <EditVehicleModal key={editingVehicle.id} vehicle={editingVehicle} onClose={() => setEditingVehicle(null)} />
            )}
        </>
    );
};