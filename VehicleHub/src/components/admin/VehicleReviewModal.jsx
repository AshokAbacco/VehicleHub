import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle2, XCircle, Car, Settings2, FileText, Sparkles, User, MapPin, ImageIcon, ChevronDown } from 'lucide-react';

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
    const [decision, setDecision] = useState(''); // '', 'approve', 'reject'
    const [reason, setReason] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
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

    const handleSubmit = () => {
        if (!decision) return;
        if (decision === 'approve') {
            onApprove(vehicle);
        } else {
            if (!reason.trim()) return;
            onReject(vehicle, reason.trim());
        }
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

                {/* Footer — decision dropdown + reason + submit */}
                <div className="shrink-0 space-y-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen((v) => !v)}
                            className="flex w-full items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
                        >
                            {decision === 'approve' && <span className="flex items-center gap-2 text-emerald-600"><CheckCircle2 size={15} /> Approve this vehicle</span>}
                            {decision === 'reject' && <span className="flex items-center gap-2 text-red-600"><XCircle size={15} /> Reject this vehicle</span>}
                            {!decision && <span className="text-slate-400">Select a decision...</span>}
                            <ChevronDown size={15} className={`transition ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute bottom-full left-0 z-10 mb-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                <button onClick={() => { setDecision('approve'); setDropdownOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-emerald-600 hover:bg-emerald-50">
                                    <CheckCircle2 size={15} /> Approve — vehicle goes live
                                </button>
                                <button onClick={() => { setDecision('reject'); setDropdownOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                                    <XCircle size={15} /> Reject — request changes
                                </button>
                            </div>
                        )}
                    </div>

                    {decision === 'reject' && (
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="Reason for rejection — this will be sent to the seller..."
                            className="w-full rounded-xl border-2 border-red-200 bg-red-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:outline-none"
                        />
                    )}

                    <div className="flex justify-end gap-2">
                        <button onClick={onClose} className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button>
                        <button
                            onClick={handleSubmit}
                            disabled={!decision || (decision === 'reject' && !reason.trim())}
                            className="rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:bg-[#002a55] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Submit Decision
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};