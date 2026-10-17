// VehicleHub/VehicleHub/src/components/buyer/PurchaseRequestModal.jsx
// Purchase request form. After the request is saved (existing flow, unchanged), WhatsApp opens
// with a prefilled message to the seller's / dealer's WhatsApp number — the buyer reviews it and
// taps Send. If the seller has no WhatsApp number, the request is still sent as usual.
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { X, ShoppingBag, Loader2, ShieldCheck, CheckCircle2, Info, ExternalLink } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useCreatePurchaseRequestMutation } from '../../services/buyerApiSlice.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { buildPurchaseRequestMessage, whatsappChatUrl, openWhatsAppChat } from '../../utils/whatsapp.js';

export const PurchaseRequestModal = ({ vehicle, onClose }) => {
    const { user } = useAuth();
    const [createPurchaseRequest, { isLoading }] = useCreatePurchaseRequestMutation();
    const [form, setForm] = useState({
        offerPrice: vehicle.price || '',
        buyerName: user?.fullName || '',
        buyerPhone: user?.phone || '',
        buyerEmail: user?.email || '',
        message: '',
    });
    // Set once the request is saved: { url (WhatsApp link or null), opened, text }
    const [sent, setSent] = useState(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.buyerName.trim() || !form.buyerPhone.trim() || !form.offerPrice) {
            return toast.error('Name, phone, and offer price are required');
        }
        try {
            const res = await createPurchaseRequest({ vehicleListingId: vehicle.id, ...form }).unwrap();
            toast.success('Purchase request sent to the seller!');

            // The request is saved — now hand the buyer over to WhatsApp (they must tap Send there)
            const text = buildPurchaseRequestMessage({ vehicle, ...form });
            const url = whatsappChatUrl(res?.data?.sellerWhatsapp, text);
            const opened = url ? openWhatsAppChat(url) : false;
            setSent({ url, opened, text });
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to send purchase request');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="animate-fadeInUp relative my-auto flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
                <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-[#001f3f] to-[#003d7a] px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-2 text-white">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><ShoppingBag size={16} /></span>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">Purchase Request</p>
                            <h3 className="max-w-[240px] truncate text-sm font-bold sm:max-w-sm">{vehicle.title}</h3>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Close purchase request" className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                {sent ? (
                    <div className="space-y-4 overflow-y-auto p-4 sm:p-6">
                        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3">
                            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                            <div>
                                <p className="text-sm font-bold text-slate-900">Purchase request sent</p>
                                <p className="mt-0.5 text-xs text-slate-600">The seller has been notified. You can track it under My Orders.</p>
                            </div>
                        </div>

                        {sent.url ? (
                            <>
                                <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                                    <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                        <FaWhatsapp size={18} className="text-[#25D366]" />
                                        {sent.opened ? 'WhatsApp opened in a new tab' : 'Continue on WhatsApp'}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-600">
                                        {sent.opened
                                            ? 'Your message to the seller is ready there. Review it and tap Send. Nothing is sent until you do.'
                                            : 'Tap the button below to open WhatsApp with your message filled in. Review it and tap Send.'}
                                    </p>
                                    <pre className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-xs leading-relaxed text-slate-700">{sent.text}</pre>
                                </div>
                                <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
                                    <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                                        Done
                                    </button>
                                    <a
                                        href={sent.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1ebe5a] hover:shadow-md"
                                    >
                                        <FaWhatsapp size={17} /> {sent.opened ? 'Open WhatsApp again' : 'Open WhatsApp'} <ExternalLink size={13} />
                                    </a>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                                    <Info size={18} className="mt-0.5 shrink-0 text-amber-600" />
                                    <p className="text-xs text-slate-700">
                                        This seller hasn't added a WhatsApp number, so we couldn't open WhatsApp. Your request has still been sent, and the seller will contact you on {form.buyerPhone}.
                                    </p>
                                </div>
                                <button type="button" onClick={onClose} className="w-full rounded-xl bg-[#001f3f] py-3 text-sm font-bold text-white transition hover:bg-[#002a55]">
                                    Done
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Listed price</p>
                            <p className="mt-0.5 text-lg font-extrabold text-slate-900">{formatCurrency(vehicle.price)}</p>
                        </div>
                        <ShieldCheck size={22} className="shrink-0 text-emerald-600" />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Price(₹) *</label>
                        <input
                            type="number"
                            required
                            value={form.offerPrice}
                            onChange={(e) => setForm({ ...form, offerPrice: e.target.value })}
                            className="w-full rounded-xl text-stone-950 border border-slate-200 px-3.5 py-3 text-sm transition focus:border-[#001f3f] focus:outline-none focus:ring-4 focus:ring-[#001f3f]/10"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Your name *</label>
                        <input
                            required
                            value={form.buyerName}
                            onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                            className="w-full rounded-xl text-stone-950 border border-slate-200 px-3.5 py-3 text-sm transition focus:border-[#001f3f] focus:outline-none focus:ring-4 focus:ring-[#001f3f]/10"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Phone number *</label>
                        <input
                            required
                            value={form.buyerPhone}
                            onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
                            className="w-full rounded-xl text-stone-950 border border-slate-200 px-3.5 py-3 text-sm transition focus:border-[#001f3f] focus:outline-none focus:ring-4 focus:ring-[#001f3f]/10"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email</label>
                        <input
                            type="email"
                            value={form.buyerEmail}
                            onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
                            className="w-full rounded-xl text-stone-950 border border-slate-200 px-3.5 py-3 text-sm transition focus:border-[#001f3f] focus:outline-none focus:ring-4 focus:ring-[#001f3f]/10"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Message to seller</label>
                        <textarea
                            rows={3}
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            placeholder="I'd like to schedule an inspection this weekend..."
                            className="w-full text-stone-950 resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm transition focus:border-[#001f3f] focus:outline-none focus:ring-4 focus:ring-[#001f3f]/10"
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
                        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#001f3f] py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#002a55] hover:shadow-md disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 size={15} className="animate-spin" /> : <><ShoppingBag size={15} /> Send Request</>}
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>,
        document.body
    );
};