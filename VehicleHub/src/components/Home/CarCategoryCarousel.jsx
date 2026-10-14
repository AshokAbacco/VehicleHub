import { useEffect, useRef, useState } from 'react';
import { Bolt, BusFront, Car, CarFront, ChevronLeft, ChevronRight, Heart, Sparkles, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPriceRange, fallbackVehicleImage } from '../../data/catalogData.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAuthGate } from '../../context/AuthGateContext.jsx';
import { useAddToWishlistMutation, useGetWishlistQuery, useRemoveFromWishlistMutation } from '../../services/buyerApiSlice.js';

const carBrandIcons = {
    'Maruti Suzuki': CarFront,
    Tata: Truck,
    Kia: Sparkles,
    Toyota: Car,
    Hyundai: Bolt,
    Mahindra: BusFront,
    Honda: Car,
    Mini: Car,
};

const CarMiniCard = ({ car, index }) => {
    const { isAuthenticated } = useAuth();
    const { requireAuth } = useAuthGate();
    const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
    const wishlistItems = wishlistData?.data || wishlistData || [];
    const remoteWishlisted = wishlistItems.some((item) => (item.vehicleListingId || item.vehicleListing?.id) === car.id);
    const [wishlistedOverride, setWishlistedOverride] = useState(null);
    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();
    const [imageSrc, setImageSrc] = useState(car.image || fallbackVehicleImage);
    const wishlisted = wishlistedOverride ?? remoteWishlisted;

    // useEffect(() => {
    //     setImageSrc(car.image || fallbackVehicleImage);
    // }, [car.image]);

    const BrandIcon = carBrandIcons[car.brand] || CarFront;

    return (
        <div
            className="w-[220px] shrink-0 animate-fadeInUp overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#002040] hover:shadow-xl hover:shadow-orange-500/10 sm:w-64"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            <div className="relative aspect-[4/3] w-full bg-slate-100">
                <img
                    src={imageSrc}
                    alt={car.title}
                    loading="lazy"
                    onError={() => setImageSrc(fallbackVehicleImage)}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (!isAuthenticated) {
                            requireAuth(() => {
                                const next = !wishlisted;
                                setWishlistedOverride(next);
                                (next ? addToWishlist(car.id) : removeFromWishlist(car.id)).unwrap().catch(() => setWishlistedOverride(!next));
                            });
                            return;
                        }
                        const next = !wishlisted;
                        setWishlistedOverride(next);
                        (next ? addToWishlist(car.id) : removeFromWishlist(car.id)).unwrap().catch(() => setWishlistedOverride(!next));
                    }}
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110"
                    aria-label="Add to wishlist"
                >
                    <Heart size={15} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-500'} />
                </button>
                {car.isElectric && (
                    <span className="absolute left-2.5 top-2.5 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Electric
                    </span>
                )}
                <div className="absolute left-2.5 bottom-2.5 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
                    <BrandIcon size={14} />
                    <span>{car.brand}</span>
                </div>
            </div>
            <div className="space-y-1.5 p-3.5 sm:p-4">
                <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{car.title}</h3>
                <p className="text-sm text-slate-700">{formatPriceRange(car)}</p>
                <Link
                    to={`/vehicle/${car.id}`}
                    className="mt-2 block w-full rounded-md border border-[#002040] py-2 text-center text-xs font-semibold text-[#002040] transition hover:bg-[#002040] hover:text-white sm:text-sm"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};

export const CarCategoryCarousel = ({ title, subtitle, cars, tabs, activeTab, onTabChange, viewAllLink, viewAllLabel = 'View All' }) => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateArrowState = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
        updateArrowState();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateArrowState, { passive: true });
        window.addEventListener('resize', updateArrowState);
        return () => {
            el.removeEventListener('scroll', updateArrowState);
            window.removeEventListener('resize', updateArrowState);
        };
    }, [cars]);

    const scroll = (dir) => {
        const cardWidth = window.innerWidth < 640 ? 236 : 288;
        scrollRef.current?.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    {subtitle && <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{subtitle}</p>}
                    <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h2>
                </div>
                {viewAllLink && (
                    <Link to={viewAllLink} className="group flex items-center gap-1 text-sm font-medium text-[#002040] hover:text-[#001f3f]">
                        {viewAllLabel} <ChevronRight size={14} className="transition group-hover:translate-x-0.5" />
                    </Link>
                )}
            </div>

            {tabs && (
                <div className="mb-4 flex gap-4 overflow-x-auto border-b border-slate-200 pb-3 [&::-webkit-scrollbar]:hidden sm:gap-5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange?.(tab.id)}
                            className={`relative shrink-0 whitespace-nowrap pb-1 text-sm font-medium transition ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute -bottom-[13px] left-0 h-0.5 w-full animate-slideIn bg-[#002040]" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            <div className="relative">

                <div ref={scrollRef} className="flex gap-3 overflow-x-auto overflow-y-visible pb-2 pt-1 scroll-smooth sm:gap-4 [&::-webkit-scrollbar]:hidden">
                    {cars.length === 0 ? (
                        <p className="py-8 text-sm text-slate-500">No vehicles in this category yet.</p>
                    ) : (
                        cars.map((car, index) => <CarMiniCard key={car.id} car={car} index={index} />)
                    )}
                </div>

                {canScrollLeft && (
                    <button
                        onClick={() => scroll(-1)}
                        className="absolute left-0 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-md transition hover:bg-slate-50 sm:flex"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}
                {canScrollRight && (
                    <button
                        onClick={() => scroll(1)}
                        className="absolute right-0 top-1/2 z-20 hidden translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-md transition hover:bg-slate-50 sm:flex"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};