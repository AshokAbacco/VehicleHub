// VehicleHub/VehicleHub/src/pages/public/SearchPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SlidersHorizontal, ChevronDown, Search, X, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { VehicleCard } from "../../components/cards/VehicleCard.jsx";
import { useGetVehiclesQuery } from "../../services/vehicleApiSlice.js";

const budgetRanges = [
    { label: "Below ₹5 Lakh", min: 0, max: 5 },
    { label: "₹5 - 10 Lakh", min: 5, max: 10 },
    { label: "₹10 - 20 Lakh", min: 10, max: 20 },
    { label: "₹20 - 40 Lakh", min: 20, max: 40 },
    { label: "₹40 Lakh and above", min: 40, max: null },
];

const fuelList = ["Petrol", "Diesel", "Electric", "CNG"];
const transmissionList = ["Manual", "Automatic"];

// Navbar tabs / old links may send "car", "bike", "commercial"… — map them to the
// category names stored in the database (seed + Add Vehicle form use these).
const CATEGORY_ALIASES = {
    car: "Car", cars: "Car",
    bike: "Bike", bikes: "Bike", motorcycle: "Bike", motorcycles: "Bike",
    scooter: "Scooter", scooters: "Scooter",
    truck: "Truck", trucks: "Truck",
    bus: "Bus", buses: "Bus",
    auto: "Auto", autos: "Auto",
    tractor: "Tractor", tractors: "Tractor",
    commercial: "Commercial Vehicle", "commercial vehicle": "Commercial Vehicle", "commercial vehicles": "Commercial Vehicle",
};
const normalizeCategory = (value) => {
    const v = String(value || "").trim();
    if (!v) return "";
    return CATEGORY_ALIASES[v.toLowerCase()] || v.charAt(0).toUpperCase() + v.slice(1);
};
const sameText = (a, b) => String(a || "").toLowerCase() === String(b || "").toLowerCase();

// Read every URL-driven filter in one place
const filtersFromParams = (params) => ({
    search: params.get("q") || "",
    categories: params.getAll("category").map(normalizeCategory).filter(Boolean),
    bodyTypes: params.getAll("body").filter(Boolean),
    brands: params.getAll("brand").filter(Boolean),
    fuels: params.getAll("fuel").filter(Boolean),
    sort: params.get("sort") || "relevance",
});

const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest first" },
];

const CheckRow = ({ checked, onChange, label, count }) => (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 transition-all duration-150 hover:bg-[#e6f2ff]/50 active:scale-[0.98]">
        <span className="flex items-center gap-3">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${checked ? 'scale-105 border-[#001f3f] bg-[#001f3f] text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </span>
            <span className={checked ? 'font-semibold text-slate-900' : ''}>{label}</span>
        </span>
        {count !== undefined && <span className="text-xs text-slate-400">({count})</span>}
    </label>
);

const FilterSection = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-100 py-4 first:pt-0 last:border-0">
            <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-sm font-bold text-slate-900 transition active:opacity-60">
                {title}
                <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-out ${open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="space-y-0.5 overflow-hidden">{children}</div>
            </div>
        </div>
    );
};

export const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialFilters = filtersFromParams(searchParams);
    const { data, isLoading: loading, isError } = useGetVehiclesQuery();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const [brandSearch, setBrandSearch] = useState("");
    const [search, setSearch] = useState(initialFilters.search);
    const [categories, setCategories] = useState(initialFilters.categories);
    const [bodyTypes, setBodyTypes] = useState(initialFilters.bodyTypes);
    const [brands, setBrands] = useState(initialFilters.brands);
    const [fuels, setFuels] = useState(initialFilters.fuels);
    const [transmissions, setTransmissions] = useState([]);
    const [budgetIndex, setBudgetIndex] = useState(null);
    const [sort, setSort] = useState(initialFilters.sort);
    const [page, setPage] = useState(1);
    const pageSize = 12;

    // Navbar tabs (Cars, SUVs, Electric…) only change the URL while this page stays mounted,
    // so re-apply the filters whenever the query string changes.
    const queryString = searchParams.toString();
    useEffect(() => {
        const f = filtersFromParams(new URLSearchParams(queryString));
        setSearch(f.search);
        setCategories(f.categories);
        setBodyTypes(f.bodyTypes);
        setBrands(f.brands);
        setFuels(f.fuels);
        setSort(f.sort);
        setTransmissions([]);
        setBudgetIndex(null);
        setPage(1);
    }, [queryString]);

    // API: { success, data: { vehicles, items, total } } — always end up with an array
    const baseVehicles = useMemo(() => {
        const candidates = [data?.data?.vehicles, data?.data?.items, data?.vehicles, data?.items, data?.data, data];
        return candidates.find(Array.isArray) || [];
    }, [data]);
    const categoryList = useMemo(() => (
        [...new Set(baseVehicles.map((vehicle) => vehicle.category).filter(Boolean))]
            .map((value) => ({ value, label: value }))
    ), [baseVehicles]);
    const brandList = useMemo(() => (
        [...new Set(baseVehicles.map((vehicle) => vehicle.brand).filter(Boolean))]
    ), [baseVehicles]);

    const toggle = (setFn, value) => {
        setFn((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    };

    const vehicles = useMemo(() => {
        let list = [...baseVehicles];

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter((v) => [v.title, v.brand, v.model].filter(Boolean).some((f) => f.toLowerCase().includes(q)));
        }
        if (categories.length) list = list.filter((v) => categories.some((category) => sameText(category, v.category)));
        if (bodyTypes.length) list = list.filter((v) => bodyTypes.some((body) => sameText(body, v.bodyType)));
        if (brands.length) list = list.filter((v) => brands.some((b) => b.toLowerCase() === v.brand?.toLowerCase()));
        if (fuels.length) list = list.filter((v) => fuels.includes(v.fuelType));
        if (transmissions.length) list = list.filter((v) => transmissions.includes(v.transmission));
        if (budgetIndex !== null) {
            const range = budgetRanges[budgetIndex];
            list = list.filter((v) => {
                const priceInLakh = v.price / 100000;
                const aboveMin = priceInLakh >= range.min;
                const belowMax = range.max === null ? true : priceInLakh <= range.max;
                return aboveMin && belowMax;
            });
        }

        if (sort === "price-low") list.sort((a, b) => a.price - b.price);
        if (sort === "price-high") list.sort((a, b) => b.price - a.price);
        if (sort === "newest") list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        return list;
    }, [baseVehicles, search, categories, bodyTypes, brands, fuels, transmissions, budgetIndex, sort]);

    const totalPages = Math.max(1, Math.ceil(vehicles.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const visibleVehicles = vehicles.slice((safePage - 1) * pageSize, safePage * pageSize);

    const brandCounts = useMemo(() => {
        const counts = {};
        baseVehicles.forEach((v) => { if (v.brand) counts[v.brand] = (counts[v.brand] || 0) + 1; });
        return counts;
    }, [baseVehicles]);

    const fuelCounts = useMemo(() => {
        const counts = {};
        baseVehicles.forEach((v) => { if (v.fuelType) counts[v.fuelType] = (counts[v.fuelType] || 0) + 1; });
        return counts;
    }, [baseVehicles]);

    const categoryCounts = useMemo(() => {
        const counts = {};
        baseVehicles.forEach((v) => { if (v.category) counts[v.category] = (counts[v.category] || 0) + 1; });
        return counts;
    }, [baseVehicles]);

    const filteredBrandList = brandList.filter((b) => b.toLowerCase().includes(brandSearch.trim().toLowerCase()));

    const activeChips = useMemo(() => {
        const chips = [];
        categories.forEach((c) => chips.push({ key: `cat:${c}`, label: categoryList.find((x) => sameText(x.value, c))?.label || c, remove: () => toggle(setCategories, c) }));
        bodyTypes.forEach((b) => chips.push({ key: `body:${b}`, label: b, remove: () => toggle(setBodyTypes, b) }));
        brands.forEach((b) => chips.push({ key: `brand:${b}`, label: b, remove: () => toggle(setBrands, b) }));
        fuels.forEach((f) => chips.push({ key: `fuel:${f}`, label: f, remove: () => toggle(setFuels, f) }));
        transmissions.forEach((t) => chips.push({ key: `trans:${t}`, label: t, remove: () => toggle(setTransmissions, t) }));
        if (budgetIndex !== null) chips.push({ key: "budget", label: budgetRanges[budgetIndex].label, remove: () => setBudgetIndex(null) });
        if (search.trim()) chips.push({ key: "search", label: `"${search.trim()}"`, remove: () => setSearch("") });
        return chips;
    }, [categories, bodyTypes, brands, fuels, transmissions, budgetIndex, search, categoryList]);

    const clearAll = () => {
        setSearch(""); setCategories([]); setBodyTypes([]); setBrands([]); setFuels([]);
        setTransmissions([]); setBudgetIndex(null); setSort("relevance"); setPage(1);
        // also clear the URL, so clicking the same navbar tab again re-applies it
        if (queryString) setSearchParams({});
    };

    const FilterPanel = () => (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                    <Filter size={16} className="text-[#001f3f]" /> Filters
                </h2>
                {activeChips.length > 0 && (
                    <button onClick={clearAll} className="rounded-full px-2 py-1 text-xs font-semibold text-[#001f3f] transition hover:bg-[#e6f2ff] active:scale-95">
                        Clear all
                    </button>
                )}
            </div>

            <div className="relative mb-4">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    placeholder="Search brand or model"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#001f3f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001f3f]/10"
                />
            </div>

            <FilterSection title="Body Type">
                {categoryList.map((c) => (
                    <CheckRow key={c.value} label={c.label} checked={categories.some((x) => sameText(x, c.value))} onChange={() => toggle(setCategories, c.value)} count={categoryCounts[c.value] || 0} />
                ))}
            </FilterSection>

            <FilterSection title="Brand">
                {filteredBrandList.map((b) => (
                    <CheckRow key={b} label={b} checked={brands.some((x) => sameText(x, b))} onChange={() => toggle(setBrands, b)} count={brandCounts[b] || 0} />
                ))}
            </FilterSection>

            <FilterSection title="Budget">
                <div className="grid grid-cols-1 gap-1.5">
                    {budgetRanges.map((range, idx) => (
                        <button
                            key={range.label}
                            onClick={() => setBudgetIndex(budgetIndex === idx ? null : idx)}
                            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-all duration-150 active:scale-[0.98] ${budgetIndex === idx
                                ? "border-[#001f3f] bg-[#e6f2ff] font-semibold text-[#001f3f] shadow-sm"
                                : "border-slate-200 text-slate-700 hover:border-[#001f3f]/40 hover:bg-slate-50"
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Fuel" defaultOpen={false}>
                {fuelList.map((f) => (
                    <CheckRow key={f} label={f} checked={fuels.includes(f)} onChange={() => toggle(setFuels, f)} count={fuelCounts[f] || 0} />
                ))}
            </FilterSection>

            <FilterSection title="Transmission" defaultOpen={false}>
                {transmissionList.map((t) => (
                    <CheckRow key={t} label={t} checked={transmissions.includes(t)} onChange={() => toggle(setTransmissions, t)} />
                ))}
            </FilterSection>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-slate-50 text-slate-900">
            <Helmet>
                <title>Search Vehicles | VehicleHub</title>
                <meta name="description" content="Search, filter, and compare premium vehicles in the VehicleHub marketplace." />
            </Helmet>

            {/* Page header band */}
            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8">
                    <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Find your ideal vehicle</h1>
                    <p className="mt-0.5 text-sm text-slate-500">{loading ? "Loading listings..." : `${vehicles.length} vehicles available`}</p>

                    {/* Top search bar */}
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder='Search "SUVs, EVs, Bikes..."'
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#001f3f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001f3f]/10"
                            />
                        </div>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition focus:border-[#001f3f] focus:outline-none active:scale-[0.98]"
                        >
                            {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <button
                            onClick={() => setMobileFiltersOpen(true)}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-[#001f3f]/30 active:scale-95 xl:hidden"
                        >
                            <SlidersHorizontal size={15} />
                            Filters
                            {activeChips.length > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#001f3f] px-1 text-[10px] font-bold text-white">
                                    {activeChips.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Active filter chips */}
                    {activeChips.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {activeChips.map((chip) => (
                                <span key={chip.key} className="flex items-center gap-1.5 rounded-full border border-[#001f3f]/20 bg-[#e6f2ff] px-3 py-1.5 text-xs font-semibold text-[#001f3f] transition hover:bg-[#d5eaff]">
                                    {chip.label}
                                    <button onClick={chip.remove} aria-label={`Remove ${chip.label}`} className="rounded-full transition hover:bg-[#001f3f]/10 active:scale-90">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                            <button onClick={clearAll} className="text-xs font-semibold text-slate-500 underline transition hover:text-slate-800 active:scale-95">Clear all</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Body — sidebar hugs the true left edge on very wide screens, standard grid otherwise */}
            <div className="mx-auto max-w-[1600px] px-0 py-6 xl:px-4">
                <div className="grid gap-0 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-6">

                    {/* Desktop sidebar — sticky, pinned toward the left edge */}
                    <aside className="hidden pl-4 xl:block">
                        <div className="sticky top-6">
                            {FilterPanel()}
                        </div>
                    </aside>

                    {/* Mobile filter drawer */}
                    {mobileFiltersOpen && (
                        <div className="fixed inset-0 z-50 flex xl:hidden">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
                            <div className="relative ml-auto flex h-full w-[88%] max-w-sm translate-x-0 flex-col overflow-y-auto bg-white p-4 shadow-2xl transition-transform duration-300">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                                    <button onClick={() => setMobileFiltersOpen(false)} className="rounded-full border border-slate-200 p-2 transition active:scale-90">
                                        <X size={16} className="text-slate-600" />
                                    </button>
                                </div>
                                {FilterPanel()}
                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="sticky bottom-0 mt-4 w-full rounded-xl bg-[#001f3f] py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-150 hover:bg-[#002a55] active:scale-[0.98]"
                                >
                                    Show {vehicles.length} results
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    <div className="px-4 xl:px-0">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                            {loading ? (
                                Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-200" />
                                ))
                            ) : isError ? (
                                <div className="col-span-full py-16 text-center text-sm text-red-500">Unable to load vehicles right now.</div>
                            ) : vehicles.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center py-16 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                                        <Search size={26} className="text-slate-400" />
                                    </div>
                                    <p className="text-lg font-semibold text-slate-900">No vehicles match your filters</p>
                                    <p className="mt-1 text-sm text-slate-500">Try widening your budget or clearing filters.</p>
                                    <button onClick={clearAll} className="mt-4 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#002a55] active:scale-95">
                                        Clear filters
                                    </button>
                                </div>
                            ) : (
                                visibleVehicles.map((vehicle, idx) => (
                                    <div key={vehicle.id} className="animate-fadeInUp" style={{ animationDelay: `${Math.min(idx, 12) * 40}ms` }}>
                                        <VehicleCard vehicle={vehicle} />
                                    </div>
                                ))
                            )}
                        </div>

                        {!loading && vehicles.length > pageSize && (
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    disabled={safePage === 1}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-[#001f3f] disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={17} />
                                </button>
                                <span className="px-2 text-sm font-semibold text-slate-600">Page {safePage} of {totalPages}</span>
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                    disabled={safePage === totalPages}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-[#001f3f] disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={17} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};