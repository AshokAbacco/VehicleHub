// VehicleHub/VehicleHub/src/pages/public/NotFoundPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Car, Home, Search } from 'lucide-react';

// Light theme 404 — uses the app's navy brand colour (#001f3f).
// Doesn't use ui/Card or ui/Button because those are styled for a dark theme.
export const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-4 py-12 text-slate-900">
            <Helmet>
                <title>404 | VehicleHub</title>
            </Helmet>

            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-xl shadow-slate-200/70 backdrop-blur sm:p-10">
                {/* Icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6f2ff] text-[#001f3f] ring-8 ring-[#e6f2ff]/50">
                    <Car size={30} />
                </div>

                {/* 404 */}
                <p className="mt-6 bg-gradient-to-r from-[#001f3f] to-[#2d6cdf] bg-clip-text text-6xl font-extrabold leading-none tracking-tight text-transparent sm:text-7xl">
                    404
                </p>
                <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">Page not found</h1>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500 sm:text-base">
                    This page doesn’t exist in the marketplace yet. Head back home or browse vehicles to continue.
                </p>

                {/* Actions */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#001f3f] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:-translate-y-0.5 hover:bg-[#002a55] hover:shadow-lg"
                    >
                        <Home size={16} /> Return home
                    </Link>
                    <Link
                        to="/search"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-[#001f3f]/30 hover:bg-slate-50"
                    >
                        <Search size={16} /> Browse vehicles
                    </Link>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#001f3f]"
                >
                    <ArrowLeft size={14} /> Go back to the previous page
                </button>
            </div>
        </div>
    );
};