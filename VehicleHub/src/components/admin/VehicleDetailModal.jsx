import { useEffect, useRef } from 'react';
import { X, Car, User, MapPin, Fuel, Gauge, ShieldCheck } from 'lucide-react';

const statusColors = { live: 'bg-emerald-100 text-emerald-700', sold: 'bg-violet-100 text-violet-700', rejected: 'bg-red-100 text-red-700' };
const Row = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]"><Icon size={14} /></div>
        <div className="min-w-0"><p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p><p className="truncate text-sm font-semibold text-slate-900">{value || '—'}</p></div>
    </div>
);

export const VehicleDetailModal = ({ vehicle, onClose }) => {
    const modalRef = useRef(null);
    const rejectionReason = vehicle?.rejectReason || vehicle?.rejectedReason || vehicle?.reason || vehicle?.adminReason || 'No specific reason was provided by the admin.';

    useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
    useEffect(() => {
        const h = (e) => { if (modalRef.current && !modalRef.current.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div ref={modalRef} className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-slate-900">{vehicle.title}</h2>
                        <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusColors[vehicle.status]}`}>{vehicle.status}</span>
                    </div>
                    <button onClick={onClose} className="shrink-0 rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white text-3xl shadow-sm">{vehicle.thumb}</span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-slate-900">{vehicle.title}</p>
                            <p className="text-sm text-slate-500">{vehicle.category} · Posted {vehicle.postedOn}</p>
                        </div>
                        <p className="shrink-0 text-xl font-extrabold text-slate-900">₹{(vehicle.price / 100000).toFixed(2)}L</p>
                    </div>

                    <div>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900"><Car size={15} className="text-[#001f3f]" /> Vehicle Details</h3>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                            <Row icon={Fuel} label="Fuel" value={vehicle.fuelType} />
                            <Row icon={Gauge} label="Transmission" value={vehicle.transmission} />
                            <Row icon={Gauge} label="KM Driven" value={`${vehicle.kmDriven} km`} />
                            <Row icon={MapPin} label="Location" value={vehicle.location} />
                        </div>
                        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{vehicle.description}</p>
                    </div>

                    <div>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900"><User size={15} className="text-[#001f3f]" /> Seller Details</h3>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                            <Row icon={User} label="Seller / Business" value={vehicle.seller} />
                            <Row icon={ShieldCheck} label="Contact Name" value={vehicle.sellerName} />
                            <Row icon={User} label="Email" value={vehicle.sellerEmail} />
                            <Row icon={User} label="Phone" value={vehicle.sellerPhone} />
                        </div>
                    </div>

                    {vehicle.status === 'sold' && (
                        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                            <p className="text-sm font-semibold text-violet-800">Sold on {vehicle.soldOn} to {vehicle.soldTo}</p>
                        </div>
                    )}
                    {vehicle.status === 'rejected' && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                            <p className="text-sm font-semibold text-red-700">Rejection reason</p>
                            <textarea
                                readOnly
                                value={rejectionReason}
                                rows={3}
                                className="mt-2 w-full resize-none rounded-xl border border-red-200 bg-white p-3 text-sm text-red-800 outline-none"
                            />
                        </div>
                    )}
                </div>

                <div className="shrink-0 border-t border-slate-100 px-5 py-4 text-right">
                    <button onClick={onClose} className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button>
                </div>
            </div>
        </div>
    );
};