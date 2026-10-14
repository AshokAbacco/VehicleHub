import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle2, XCircle, Building2, MapPin, ShieldCheck, Landmark, FileText } from 'lucide-react';

const Row = ({ label, value }) => (
    <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">{value || '—'}</p>
    </div>
);
const SectionTitle = ({ icon: Icon, children }) => (
    <h3 className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold text-slate-900"><Icon size={15} className="text-[#001f3f]" /> {children}</h3>
);

export const SellerVerificationModal = ({ seller, onClose, onApprove, onReject }) => {
    const [reason, setReason] = useState('');
    const [showReject, setShowReject] = useState(false);
    const ref = useRef(null);

    useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div ref={ref} className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-amber-600">Pending Verification</p>
                        <h2 className="text-lg font-bold text-slate-900">{seller.businessName || seller.ownerName}</h2>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                    <div>
                        <SectionTitle icon={Building2}>Business Information</SectionTitle>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            <Row label="Owner Name" value={seller.ownerName} />
                            <Row label="Business Name" value={seller.businessName} />
                            <Row label="Type" value={seller.sellerType} />
                            <Row label="Email" value={seller.email} />
                            <Row label="Phone" value={seller.phone} />
                            <Row label="Years in Business" value={seller.yearsInBusiness} />
                        </div>
                    </div>
                    <div>
                        <SectionTitle icon={MapPin}>Location</SectionTitle>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            <Row label="Address" value={seller.address} />
                            <Row label="City" value={seller.city} />
                            <Row label="State" value={seller.state} />
                            <Row label="Pincode" value={seller.pincode} />
                        </div>
                    </div>
                    <div>
                        <SectionTitle icon={ShieldCheck}>Legal & Compliance</SectionTitle>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            <Row label="GST Number" value={seller.gstNumber} />
                            <Row label="PAN Number" value={seller.panNumber} />
                            <Row label="PAN Card" value={seller.panCardImage ? '✓ Uploaded' : 'Not provided'} />
                            <Row label="GST Certificate" value={seller.gstCertificate ? '✓ Uploaded' : 'Not provided'} />
                        </div>
                    </div>
                    <div>
                        <SectionTitle icon={Landmark}>Bank Details</SectionTitle>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            <Row label="Account Holder" value={seller.bankAccountHolder} />
                            <Row label="Bank" value={seller.bankName} />
                            <Row label="Account Number" value={seller.bankAccountNumber} />
                            <Row label="IFSC" value={seller.bankIFSC} />
                        </div>
                    </div>
                    <div>
                        <SectionTitle icon={FileText}>Description</SectionTitle>
                        <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{seller.description || '—'}</p>
                    </div>
                </div>

                <div className="shrink-0 space-y-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                    {showReject && (
                        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Reason for rejection..." className="w-full rounded-xl border-2 border-red-200 bg-red-50/50 px-4 py-2.5 text-sm focus:border-red-400 focus:outline-none" />
                    )}
                    <div className="flex justify-end gap-2">
                        {!showReject ? (
                            <>
                                <button onClick={() => setShowReject(true)} className="flex items-center gap-1.5 rounded-xl border-2 border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"><XCircle size={15} /> Reject</button>
                                <button onClick={() => { onApprove(seller); onClose(); }} className="flex items-center gap-1.5 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#002a55]"><CheckCircle2 size={15} /> Approve Seller</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setShowReject(false)} className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button onClick={() => { if (reason.trim()) { onReject(seller, reason.trim()); onClose(); } }} disabled={!reason.trim()} className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-40">Confirm Rejection</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};