import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Heart, Trash2, Loader2 } from 'lucide-react';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '../../services/buyerApiSlice.js';
import { formatCurrency } from '../../utils/formatters.js';

export const BuyerWishlistPage = () => {
    const { data, isLoading } = useGetWishlistQuery();
    const [remove] = useRemoveFromWishlistMutation();
    const items = data?.data || [];

    const handleRemove = async (id) => {
        try {
            await remove(id).unwrap();
            toast.success('Removed from wishlist');
        } catch {
            toast.error('Failed to remove');
        }
    };

    return (
        <div className="space-y-6">
            <Helmet><title>Wishlist | VehicleHub</title></Helmet>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>
                <p className="mt-1 text-sm text-slate-500">{items.length} vehicle{items.length === 1 ? '' : 's'} saved for later.</p>
            </div>
            {isLoading ? (
                <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-slate-400">
                    <Heart size={26} />
                    <p className="text-sm font-medium">Your wishlist is empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((w) => (
                        <div key={w.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <Link to={`/vehicle/${w.vehicleListingId}`} className="block">
                                <img src={w.vehicleListing?.images?.[0] || '/placeholder-vehicle.png'} alt={w.vehicleListing?.title || 'Saved vehicle'} className="h-40 w-full object-cover" />
                            </Link>
                            <div className="p-4">
                                <Link to={`/vehicle/${w.vehicleListingId}`} className="block text-sm font-bold text-slate-900 hover:text-[#001f3f]">{w.vehicleListing?.title || 'Vehicle listing'}</Link>
                                <p className="mt-1 text-xs text-slate-500">{[w.vehicleListing?.brand, w.vehicleListing?.model, w.vehicleListing?.category].filter(Boolean).join(' · ')}</p>
                                <p className="mt-1 text-base font-extrabold text-slate-900">{formatCurrency(w.vehicleListing?.price)}</p>
                                <button onClick={() => handleRemove(w.vehicleListingId)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-red-200 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
                                    <Trash2 size={13} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};