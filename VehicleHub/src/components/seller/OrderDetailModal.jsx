import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Car, User, Clock, IndianRupee, Tag, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

const Row = ({ icon: Icon, label, value }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]">
                <Icon size={14} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400">{label}</p>
                <p className="mt-0.5 truncate text-sm font-medium text-slate-800">{value}</p>
            </div>
        </div>
    );
};

const SectionCard = ({ icon: Icon, title, children }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]">
                <Icon size={15} />
            </span>
            <h4 className="text-base font-bold text-slate-900">{title}</h4>
        </div>
        {children}
    </div>
);

const formatDate = (d) =>
    d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : undefined;

export const OrderDetailModal = ({ vehicle, onClose }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!vehicle) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-2 sm:p-4 md:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="animate-fadeInUp relative my-auto flex h-full max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl sm:rounded-3xl">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-[#001f3f] to-[#003d7a] px-5 py-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                            <ShoppingBag size={17} />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">Order Details</p>
                            <h3 className="truncate text-base font-bold text-white sm:text-lg">{vehicle.title}</h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {vehicle.images?.[0] && (
                        <img
                            src={vehicle.images[0]}
                            alt={vehicle.title}
                            className="mb-5 h-48 w-full rounded-2xl object-cover shadow-sm sm:h-64"
                        />
                    )}

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        <SectionCard icon={Car} title="Vehicle">
                            <Row icon={Car} label="Title" value={vehicle.title} />
                            <Row icon={Tag} label="Brand / Model" value={[vehicle.brand, vehicle.model].filter(Boolean).join(' ')} />
                            <Row icon={Tag} label="Category" value={vehicle.category} />
                            <Row icon={IndianRupee} label="Listed Price" value={vehicle.price ? formatCurrency(vehicle.price) : undefined} />
                            <Row icon={IndianRupee} label="Sold Price" value={vehicle.soldPrice ? formatCurrency(vehicle.soldPrice) : undefined} />
                        </SectionCard>

                        <SectionCard icon={User} title="Buyer">
                            <Row icon={User} label="Name" value={vehicle.soldToName} />
                            <Row icon={User} label="Phone" value={vehicle.soldToPhone} />
                            <Row icon={User} label="Email" value={vehicle.soldToEmail} />
                        </SectionCard>

                        <SectionCard icon={Clock} title="Timing">
                            <Row icon={Clock} label="Listed On" value={formatDate(vehicle.createdAt)} />
                            <Row icon={Clock} label="Sold On" value={formatDate(vehicle.soldAt)} />
                        </SectionCard>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
                    <button
                        onClick={onClose}
                        className="rounded-xl border-2 border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};