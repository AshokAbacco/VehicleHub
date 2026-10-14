import { useState } from "react";
import { BadgeCheck, Bike, Bolt, BusFront, Car, CarFront, ShieldCheck, Scooter, Sparkles, Truck, Wallet, ArrowRight, Loader2, PackageOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CompareBar } from "../../hooks/Comparebar.jsx";
import { CarCategoryCarousel } from "../../components/Home/CarCategoryCarousel.jsx";
import { useGetHomepageVehiclesQuery } from "../../services/vehicleApiSlice.js";

const heroBanner = "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=2200&q=80";
const fallbackHeroImage = heroBanner;

const highlights = [
    { title: "Verified sellers", text: "Identity, RC, insurance, and service history are verified before listing.", icon: ShieldCheck, color: "text-[#001f3f]", bg: "bg-[#e6f2ff]" },
    { title: "Smart inspections", text: "Book and track inspections from buyer to seller in one flow.", icon: BadgeCheck, color: "text-[#001f3f]", bg: "bg-[#e6f2ff]" },
    { title: "Instant finance", text: "Check EMI eligibility and loan support without leaving the marketplace.", icon: Wallet, color: "text-[#001f3f]", bg: "bg-[#e6f2ff]" },
];

const categoryIcons = {
    Car: CarFront,
    Bike: Bike,
    Scooter: Scooter,
    Truck: Truck,
    Bus: BusFront,
    Auto: BusFront,
    Tractor: Truck,
    "Commercial Vehicle": Truck,
};

const brandIconFor = () => CarFront; // no separate Brand entity on VehicleListing; single fallback icon

const SectionHeader = ({ eyebrow, title, linkTo, linkLabel }) => (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#001f3f]">{eyebrow}</p>}
            <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-2xl lg:text-3xl">{title}</h2>
        </div>
        {linkTo && (
            <Link to={linkTo} className="group flex w-fit items-center gap-1 text-sm font-semibold text-slate-700 hover:text-[#001f3f]">
                {linkLabel}
                <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
            </Link>
        )}
    </div>
);

// Maps a real, APPROVED VehicleListing row into the shape the carousel/compare-bar expect
const mapListing = (v) => ({
    id: v.id,
    title: v.title,
    price: v.price,
    image: v.images?.[0],
    images: v.images,
    category: v.category,
    brand: v.brand,
    model: v.model,
    fuelType: v.fuelType,
    transmission: v.transmission,
    manufacturingYear: v.manufacturingYear,
    kmDriven: v.kmDriven,
    city: v.city,
    state: v.state,
    isElectric: v.fuelType === "Electric",
    launchedOn: v.createdAt,
    status: v.status,
});

export const HomePage = () => {
    const navigate = useNavigate();
    const [quickCategory, setQuickCategory] = useState("");
    const [quickBudget, setQuickBudget] = useState("");
    const [quickLocation, setQuickLocation] = useState("");
    const [heroImage, setHeroImage] = useState(heroBanner);
    const [activeCategory, setActiveCategory] = useState("");

    const { data, isLoading, isError } = useGetHomepageVehiclesQuery();

    const homepageData = data?.data || data || {};
    const categories = homepageData.categories || [];
    const byCategory = homepageData.byCategory || {};
    const electric = (homepageData.electric || []).map(mapListing);
    const latest = (homepageData.latest || []).map(mapListing);

    const currentCategory = activeCategory || categories[0] || "";
    const categoryVehicles = (byCategory[currentCategory] || []).map(mapListing);
    const categoryTabs = categories.map((c) => ({ id: c, label: c }));

    const hasAnyApprovedVehicles = categories.length > 0 || electric.length > 0 || latest.length > 0;

    const handleQuickSearch = () => {
        const params = new URLSearchParams();
        if (quickCategory) params.set("category", quickCategory);
        if (quickBudget) {
            const [min, max] = quickBudget.split("-");
            if (min) params.set("priceMin", min);
            if (max) params.set("priceMax", max);
        }
        if (quickLocation) params.set("location", quickLocation);
        navigate(`/search?${params.toString()}`);
    };

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
            <Helmet>
                <title>VehicleHub | Premium Vehicle Marketplace</title>
                <meta name="description" content="A modern premium vehicle marketplace with verified listings, inspections, financing, and role-based dashboards." />
            </Helmet>

            {/* Hero */}
            <section className="relative h-[52vh] min-h-[380px] overflow-hidden sm:h-[75vh] sm:min-h-[520px] lg:h-[80vh] lg:min-h-[650px]">
                <img
                    src={heroImage}
                    alt=""
                    onError={() => setHeroImage(fallbackHeroImage)}
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-8 lg:px-8">
                    <div className="max-w-xl animate-fadeInUp space-y-2.5 sm:space-y-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#001f3f] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-[#001f3f]/30">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Featured
                        </span>
                        <h1 className="text-2xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
                            Premium Vehicles,<br className="hidden sm:block" /> Verified Sellers
                        </h1>
                        <p className="max-w-md text-sm text-white/90 sm:text-base lg:text-lg">
                            Buy verified Cars, Bikes, SUVs, Trucks, and EVs from trusted sellers across India.
                        </p>
                        <div className="flex flex-wrap gap-2.5 pt-1 sm:gap-3">
                            <Link
                                to="/search"
                                className="inline-flex items-center gap-2 rounded-lg bg-[#002040] px-4 py-2.5 text-xs font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl sm:px-6 sm:py-3 sm:text-base"
                            >
                                Browse Vehicles <ArrowRight size={16} />
                            </Link>
                             
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick search */}
            <section className="relative z-20 mx-auto mt-6 max-w-7xl px-4 sm:mt-10 lg:px-8">
                <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 sm:p-6 lg:p-7">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#001f3f]">Quick search</p>
                            <h2 className="mt-1 text-base font-bold text-slate-900 sm:text-xl lg:text-2xl">Find the right vehicle in seconds</h2>
                        </div>
                        <Link to="/search" className="flex w-fit items-center gap-1 text-sm font-semibold text-slate-700 hover:text-[#001f3f]">
                            Advanced search <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-[#001f3f] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#001f3f]/10">
                            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Category</label>
                            <select
                                value={quickCategory}
                                onChange={(e) => setQuickCategory(e.target.value)}
                                className="mt-0.5 w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                            >
                                <option value="">All categories</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-[#001f3f] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#001f3f]/10">
                            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Budget</label>
                            <select
                                value={quickBudget}
                                onChange={(e) => setQuickBudget(e.target.value)}
                                className="mt-0.5 w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                            >
                                <option value="">Any budget</option>
                                <option value="0-1000000">Under ₹10 Lakh</option>
                                <option value="1000000-2000000">₹10 - 20 Lakh</option>
                                <option value="2000000-4000000">₹20 - 40 Lakh</option>
                                <option value="4000000-">Above ₹40 Lakh</option>
                            </select>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-[#001f3f] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#001f3f]/10">
                            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Location</label>
                            <select
                                value={quickLocation}
                                onChange={(e) => setQuickLocation(e.target.value)}
                                className="mt-0.5 w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                            >
                                <option value="">All India</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="Delhi NCR">Delhi NCR</option>
                                <option value="Bengaluru">Bengaluru</option>
                                <option value="Pune">Pune</option>
                                <option value="Hyderabad">Hyderabad</option>
                            </select>
                        </div>

                        <button
                            onClick={handleQuickSearch}
                            className="rounded-xl bg-[#001f3f] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#001f3f]/25 transition hover:-translate-y-0.5 hover:bg-[#002a55] hover:shadow-lg"
                        >
                            Search now
                        </button>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:space-y-12 sm:py-12 lg:space-y-14 lg:px-8 lg:py-14">

                {isLoading ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-3">
                        <Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" />
                        <p className="text-sm text-slate-400">Loading approved vehicles...</p>
                    </div>
                ) : isError ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-slate-400">
                        <PackageOpen size={26} />
                        <p className="text-sm font-medium">Failed to load vehicles. Please try again later.</p>
                    </div>
                ) : !hasAnyApprovedVehicles ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white text-center text-slate-400">
                        <PackageOpen size={26} />
                        <p className="text-sm font-medium">No approved listings yet — check back soon!</p>
                    </div>
                ) : (
                    <>
                        {/* Category-tabbed carousel — only approved vehicles per category */}
                        {categories.length > 0 && (
                            <section>
                                <CarCategoryCarousel
                                    title="Approved vehicles by category"
                                    cars={categoryVehicles}
                                    tabs={categoryTabs}
                                    activeTab={currentCategory}
                                    onTabChange={setActiveCategory}
                                    viewAllLink={`/search?category=${currentCategory}&status=APPROVED`}
                                    viewAllLabel={`View All ${currentCategory}`}
                                />
                            </section>
                        )}

                        {/* Electric vehicles — approved only */}
                        {electric.length > 0 && (
                            <section>
                                <CarCategoryCarousel
                                    title="Electric vehicles"
                                    cars={electric}
                                    viewAllLink="/search?fuel=Electric&status=APPROVED"
                                    viewAllLabel="View All Electric Vehicles"
                                />
                            </section>
                        )}

                        {/* Latest approved listings */}
                        {latest.length > 0 && (
                            <section>
                                <CarCategoryCarousel
                                    title="Newly approved listings"
                                    cars={latest}
                                    viewAllLink="/search?sort=newest&status=APPROVED"
                                    viewAllLabel="View All Latest Vehicles"
                                />
                            </section>
                        )}
                    </>
                )}

                {/* Popular categories — dynamic, built only from categories that have approved listings */}
                {categories.length > 0 && (
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
                        <SectionHeader eyebrow="Popular categories" title="Pick your vehicle type" linkTo="/search" linkLabel="View all categories" />
                        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
                            {categories.map((cat) => {
                                const Icon = categoryIcons[cat] || CarFront;
                                return (
                                    <Link
                                        key={cat}
                                        to={`/search?category=${encodeURIComponent(cat)}&status=APPROVED`}
                                        className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center transition hover:-translate-y-1 hover:border-[#001f3f] hover:bg-white hover:shadow-md sm:gap-3 sm:p-5"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f2ff] text-[#001f3f] transition group-hover:bg-[#001f3f] group-hover:text-white sm:h-12 sm:w-12">
                                            <Icon size={18} />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-900 sm:text-base">{cat}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Marketplace features */}
                <section>
                    <SectionHeader eyebrow="Marketplace features" title="Built for premium commerce" linkTo="/search" linkLabel="Explore all vehicles" />
                    <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                        {highlights.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.title}
                                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6"
                                >
                                    <span className="absolute inset-x-0 top-0 h-[3px] w-full overflow-hidden">
                                        <span className="block h-full w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-[#001f3f] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
                                    </span>
                                    <span className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-[#001f3f] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="relative space-y-2.5 sm:space-y-3">
                                        <div className={`w-fit rounded-xl p-2.5 sm:p-3 ${item.bg} ${item.color} transition-transform duration-300 group-hover:scale-110`}>
                                            <Icon size={20} className="sm:hidden" />
                                            <Icon size={22} className="hidden sm:block" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 sm:text-lg">{item.title}</h3>
                                        <p className="text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">{item.text}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            <CompareBar vehicles={[...categoryVehicles, ...electric, ...latest]} />
        </div>
    );
};