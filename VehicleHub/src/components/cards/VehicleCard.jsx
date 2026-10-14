import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { fallbackVehicleImage } from '../../data/catalogData.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAuthGate } from '../../context/AuthGateContext.jsx';
import { useAddToWishlistMutation, useGetWishlistQuery, useRemoveFromWishlistMutation } from '../../services/buyerApiSlice.js';

export const VehicleCard = ({ vehicle }) => {
    const { isAuthenticated } = useAuth();
    const { requireAuth } = useAuthGate();
    const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
    const wishlistItems = wishlistData?.data || wishlistData || [];
    const remoteWishlisted = useMemo(() => wishlistItems.some((item) => (item.vehicleListingId || item.vehicleListing?.id) === vehicle.id), [wishlistItems, vehicle.id]);
    const [wishlistedOverride, setWishlistedOverride] = useState(null);
    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();
    const tags = [vehicle.fuelType, vehicle.transmission].filter(Boolean);
    const [imageSrc, setImageSrc] = useState(vehicle.images?.[0] || vehicle.image || fallbackVehicleImage);
    const wishlisted = wishlistedOverride ?? remoteWishlisted;

    return (
        <div className="relative w-full shrink-0 overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#001f3f] hover:shadow-xl hover:shadow-[#001f3f]/10">
            <Link to={`/vehicle/${vehicle.id}`} className="block">
                <div className="relative aspect-4/3 w-full bg-slate-100">
                    <img
                        src={imageSrc}
                        alt={vehicle.title}
                        loading="lazy"
                        onError={() => setImageSrc(fallbackVehicleImage)}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />

                    {vehicle.badgeLabel && (
                        <span className="absolute left-2.5 top-2.5 rounded bg-[#001f3f] px-2 py-0.5 text-[10px] font-semibold text-white">
                            {vehicle.badgeLabel}
                        </span>
                    )}
                    {vehicle.fuelType === 'Electric' && (
                        <span className="absolute left-2.5 top-2.5 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            Electric
                        </span>
                    )}
                    {vehicle.price > 0 && (
                        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#001f3f] shadow-sm">
                            EMI from {formatCurrency(Math.round(vehicle.price * 0.019))}/mo
                        </span>
                    )}
                </div>
            </Link>

            {/* Wishlist heart — works independently of the card link */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isAuthenticated) {
                        requireAuth(() => {
                            const next = !wishlisted;
                            setWishlistedOverride(next);
                            (next ? addToWishlist(vehicle.id) : removeFromWishlist(vehicle.id)).unwrap().catch(() => setWishlistedOverride(!next));
                        });
                        return;
                    }
                    const next = !wishlisted;
                    setWishlistedOverride(next);
                    (next ? addToWishlist(vehicle.id) : removeFromWishlist(vehicle.id)).unwrap().catch(() => setWishlistedOverride(!next));
                }}
                className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110"
                aria-label="Add to wishlist"
            >
                <Heart size={15} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-500'} />
            </button>

            <div className="space-y-1.5 p-3.5 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                    <Link to={`/vehicle/${vehicle.id}`} className="min-w-0 flex-1">
                        <h3 className="line-clamp-1 text-sm font-semibold text-slate-900" title={vehicle.title}>
                            {vehicle.title}
                        </h3>
                    </Link>
                    {vehicle.year && (
                        <span className="shrink-0 rounded-full border border-[#001f3f]/20 bg-[#e6f2ff] px-2 py-0.5 text-[11px] font-semibold text-[#001f3f]">
                            {vehicle.year}
                        </span>
                    )}
                </div>

                <p className="line-clamp-1 text-[11px] text-slate-500" title={vehicle.location}>
                    {vehicle.location || 'Pan India'}
                </p>

                {/* Rating + views row removed */}

                <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                            {tag}
                        </span>
                    ))}
                    {vehicle.mileage ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                            {vehicle.mileage} km
                        </span>
                    ) : null}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">Expected price</p>
                        <p className="truncate text-base font-bold text-slate-900">{formatCurrency(vehicle.price)}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-emerald-600">
                        <ShieldCheck size={11} /> Verified
                    </span>
                </div>

                <Link
                    to={`/vehicle/${vehicle.id}`}
                    className="mt-1 block w-full rounded-md border border-[#001f3f] py-2 text-center text-xs font-semibold text-[#001f3f] transition hover:bg-[#001f3f] hover:text-white sm:text-sm"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};