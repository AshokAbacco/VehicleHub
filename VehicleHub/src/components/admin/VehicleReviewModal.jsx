// VehicleHub/VehicleHub/src/components/admin/VehicleReviewModal.jsx
import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle2, XCircle, Car, Settings2, FileText, Sparkles, User, MapPin, ImageIcon, Send } from 'lucide-react';

const InfoRow = ({ label, value }) => (
    <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">{value || '—'}</p>
    </div>
);

const SectionTitle = ({ icon: Icon, children }) => (
    <h3 className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold text-slate-900">
        <Icon size={15} className="text-[#001f3f]" /> {children}
    </h3>
);

export const VehicleReviewModal = ({ vehicle, onClose, onApprove, onReject }) => {
    // Pick Approve or Reject first, then confirm with "Submit Decision" (nothing is saved on the first click)
    const [decision, setDecision] = useState(''); // '' | 'approve' | 'reject'
    const [reason, setReason] = useState('');
    const modalRef = useRef(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        const handleClick = (e) => { if (modalRef.current && !modalRef.current.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    // A rejection always needs a reason — the seller sees it
    const canSubmit = decision === 'approve' || (decision === 'reject' && reason.trim().length > 0);

    const handleSubmit = () => {
        if (!canSubmit) return;
        if (decision === 'approve') onApprove(vehicle);
        else onReject(vehicle, reason.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div ref={modalRef} className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Pending Approval</p>
                        <h2 className="truncate text-lg font-bold text-slate-900">{vehicle.title}</h2>
                    </div>
                    <button onClick={onClose} className="shrink-0 rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                    {/* Images */}
                    <div>
                        <SectionTitle icon={ImageIcon}>Vehicle Images ({vehicle.images?.length || 0})</SectionTitle>
                        {vehicle.images?.length ? (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {vehicle.images.map((img, i) => (
                                    <img key={i} src={img} alt={`Photo ${i + 1}`} className="h-24 w-full rounded-lg border border-slate-200 object-cover" />
                                ))}
                            </div>
                        ) : <p className="text-sm text-slate-400">No images uploaded.</p>}
                    </div>

                    {/* Documents */}
                    <div>
                        <SectionTitle icon={FileText}>Documents</SectionTitle>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {['rcFront', 'insuranceDocument'].map((key) => (
                                <div key={key} className="rounded-xl border-2 border-dashed border-slate-200 p-2 text-center">
                                    {vehicle.documents?.[key] ? (
                                        <img src={vehicle.documents[key]} alt={key} className="h-20 w-full rounded-lg object-cover" />
                                    ) : (
                                        <div className="flex h-20 items-center justify-center text-xs text-slate-400">Not provided</div>
                                    )}
                                    <p className="mt-1.5 text-[11px] font-medium text-slate-500">{key === 'rcFront' ? 'RC Image' : 'Insurance Image'}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Basic + Pricing */}
                    <div>
                        <SectionTitle icon={Car}>Basic Information & Pricing</SectionTitle>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            <InfoRow label="Category" value={vehicle.category} />
                            <InfoRow label="Brand" value={vehicle.brand} />
                            <InfoRow label="Model" value={vehicle.model} />
                            <InfoRow label="Variant" value={vehicle.variant} />
                            <InfoRow label="Registration No." value={vehicle.registrationNumber} />
                            <InfoRow label="VIN" value={vehicle.vin} />
                            <InfoRow label="Price" value={`₹${Number(vehicle.price).toLocaleString('en-IN')}`} />
                            <InfoRow label="Negotiable" value={vehicle.negotiable} />
                            <InfoRow label="EMI Available" value={vehicle.emiAvailable} />
                        </div>
                    </div>

                    {/* Vehicle Details */}
                    <div>
                        <SectionTitle icon={Settings2}>Vehicle Details</SectionTitle>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            <InfoRow label="Mfg Year" value={vehicle.manufacturingYear} />
                            <InfoRow label="Reg. Year" value={vehicle.registrationYear} />
                            <InfoRow label="KM Driven" value={vehicle.kmDriven ? `${vehicle.kmDriven} km` : null} />
                            <InfoRow label="Fuel Type" value={vehicle.fuelType} />
                            <InfoRow label="Transmission" value={vehicle.transmission} />
                            <InfoRow label="Ownership" value={vehicle.ownership} />
                            <InfoRow label="Color" value={vehicle.color} />
                            <InfoRow label="Seating" value={vehicle.seatingCapacity} />
                            <InfoRow label="Engine (CC)" value={vehicle.engineCapacity} />
                            <InfoRow label="Mileage" value={vehicle.mileage ? `${vehicle.mileage} km/l` : null} />
                            <InfoRow label="RC Available" value={vehicle.rcAvailable} />
                            <InfoRow label="Insurance" value={vehicle.insuranceAvailable} />
                            <InfoRow label="Insurance Expiry" value={vehicle.insuranceExpiry} />
                            <InfoRow label="Loan Pending" value={vehicle.loanPending} />
                            <InfoRow label="NOC Available" value={vehicle.nocAvailable} />
                            <InfoRow label="Keys" value={vehicle.numberOfKeys} />
                        </div>
                    </div>

                    {/* Condition + Features */}
                    <div>
                        <SectionTitle icon={Sparkles}>Condition & Features</SectionTitle>
                        <div className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            <InfoRow label="Overall Condition" value={vehicle.vehicleCondition} />
                            <InfoRow label="Accident History" value={vehicle.accidentHistory} />
                            <InfoRow label="Flood Damage" value={vehicle.floodDamage} />
                            <InfoRow label="Engine Condition" value={vehicle.engineCondition} />
                            <InfoRow label="Tyre Condition" value={vehicle.tyreCondition} />
                            <InfoRow label="Battery Condition" value={vehicle.batteryCondition} />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {vehicle.features?.map((f) => (
                                <span key={f} className="rounded-full bg-[#e6f2ff] px-2.5 py-1 text-xs font-semibold text-[#001f3f]">{f}</span>
                            ))}
                        </div>
                    </div>

                    {/* Seller + Location */}
                    <div>
                        <SectionTitle icon={User}>Seller Information</SectionTitle>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            <InfoRow label="Seller Name" value={vehicle.sellerName} />
                            <InfoRow label="Mobile" value={vehicle.mobileNumber} />
                            <InfoRow label="Email" value={vehicle.email} />
                            <InfoRow label="Type" value={vehicle.sellerType} />
                            <InfoRow label="Business" value={vehicle.seller} />
                        </div>
                    </div>

                    <div>
                        <SectionTitle icon={MapPin}>Location</SectionTitle>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            <InfoRow label="State" value={vehicle.state} />
                            <InfoRow label="City" value={vehicle.city} />
                            <InfoRow label="Area" value={vehicle.area} />
                            <InfoRow label="Pincode" value={vehicle.pincode} />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <SectionTitle icon={FileText}>Description</SectionTitle>
                        <p className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">{vehicle.description || '—'}</p>
                    </div>
                </div>

                {/* Footer — choose Approve or Reject, then Submit Decision */}
                <div className="shrink-0 space-y-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your decision</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => setDecision('approve')}
                            aria-pressed={decision === 'approve'}
                            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition ${decision === 'approve'
                                ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                : 'border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50'
                                }`}
                        >
                            <CheckCircle2 size={16} /> Approve — vehicle goes live
                        </button>
                        <button
                            type="button"
                            onClick={() => setDecision('reject')}
                            aria-pressed={decision === 'reject'}
                            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition ${decision === 'reject'
                                ? 'border-red-600 bg-red-600 text-white shadow-md shadow-red-600/20'
                                : 'border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50'
                                }`}
                        >
                            <XCircle size={16} /> Reject — request changes
                        </button>
                    </div>

                    {decision === 'reject' && (
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-red-700">
                                Why is this vehicle being rejected? <span className="font-normal text-slate-500">— the seller will see this</span>
                            </label>
                            <textarea
                                autoFocus
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                placeholder="e.g. RC photo is unclear — please upload a clearer front image."
                                className="w-full rounded-xl border-2 border-red-200 bg-red-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:outline-none"
                            />
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <button onClick={onClose} className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            Close
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            title={!decision ? 'Choose Approve or Reject first' : decision === 'reject' && !reason.trim() ? 'Enter a reason for the seller' : undefined}
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:bg-[#002a55] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Send size={15} /> Submit Decision
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};