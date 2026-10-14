// VehicleHub/VehicleHub/src/components/seller/SellerPurchaseRequestsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import {
    ShoppingBag, User, Phone, Mail, MessageSquare, IndianRupee, Calendar,
    CheckCircle2, XCircle, Loader2, X, Car, Clock, Ban,
} from 'lucide-react';
import {
    useGetPurchaseRequestsQuery, useAcceptPurchaseRequestMutation, useRejectPurchaseRequestMutation,
} from '../../services/sellerApiSlice.js';
import { formatCurrency } from '../../utils/formatters.js';

// Badge + banner styling for each request status (was hard-coded "PENDING" before)
const STATUS = {
    PENDING: { label: 'Pending', badge: 'bg-amber-50 text-amber-700 ring-amber-200', banner: 'border-amber-200 bg-amber-50 text-amber-800', icon: Clock, text: 'Waiting for your decision.' },
    ACCEPTED: { label: 'Accepted', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', banner: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: CheckCircle2, text: 'You accepted this offer and the vehicle was marked as sold.' },
    REJECTED: { label: 'Declined', badge: 'bg-red-50 text-red-700 ring-red-200', banner: 'border-red-200 bg-red-50 text-red-800', icon: XCircle, text: 'This request was declined.' },
    CANCELLED: { label: 'Cancelled', badge: 'bg-slate-100 text-slate-600 ring-slate-200', banner: 'border-slate-200 bg-slate-100 text-slate-700', icon: Ban, text: 'The buyer cancelled this request.' },
};
const statusOf = (s) => STATUS[s] || STATUS.PENDING;

const StatusBadge = ({ status }) => (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold uppercase ring-1 ${statusOf(status).badge}`}>
        {statusOf(status).label}
    </span>
);

const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

const Row = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]"><Icon size={14} /></span>
            <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400">{label}</p>
                <p className="mt-0.5 truncate text-sm font-medium text-slate-800">{value}</p>
            </div>
        </div>
    );
};

const RequestDetailModal = ({ request, onClose, onAccept, onReject, accepting, rejecting }) => {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previousOverflow; };
    }, []);

    return createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center overflow-y-auto p-2 sm:p-4 md:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="animate-fadeInUp relative my-auto flex max-h-[calc(100dvh-1rem)] min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl sm:rounded-3xl">
                <div className="flex shrink-0 items-center justify-between gap-3 bg-linear-to-r from-[#001f3f] to-[#003d7a] px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-2 text-white">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15"><ShoppingBag size={15} /></span>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">Purchase Request</p>
                            <h3 className="truncate text-sm font-bold">{request.vehicleListing?.title}</h3>
                        </div>
                    </div>
                    <div className="ml-auto hidden sm:block"><StatusBadge status={request.status} /></div>
                    <button onClick={onClose} className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"><X size={16} /></button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                    {/* Outcome of this request */}
                    {(() => {
                        const st = statusOf(request.status);
                        const Icon = st.icon;
                        return (
                            <div className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 ${st.banner}`}>
                                <Icon size={18} className="mt-0.5 shrink-0" />
                                <div className="min-w-0 text-sm">
                                    <p className="font-bold">{st.label}{request.respondedAt && request.status !== 'PENDING' ? ` · ${new Date(request.respondedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</p>
                                    <p className="mt-0.5">{st.text}</p>
                                    {request.status === 'REJECTED' && request.rejectReason && (
                                        <p className="mt-1 break-words"><span className="font-semibold">Reason:</span> {request.rejectReason}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <div className="min-w-0">
                            {request.vehicleListing?.images?.[0] && (
                                <img src={request.vehicleListing.images[0]} className="mb-4 h-44 w-full rounded-xl object-cover sm:h-56" alt="" />
                            )}

                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Buyer Details</p>
                            <Row icon={User} label="Full Name" value={request.buyerName} />
                            <Row icon={Phone} label="Phone" value={request.buyerPhone} />
                            <Row icon={Mail} label="Email" value={request.buyerEmail} />
                            {request.buyer?.createdAt && (
                                <Row icon={Calendar} label="Buyer since" value={new Date(request.buyer.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} />
                            )}

                            <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Offer</p>
                            <Row icon={IndianRupee} label="Offer Price" value={formatCurrency(request.offerPrice)} />
                            <Row icon={Car} label="Listed Price" value={formatCurrency(request.vehicleListing?.price)} />
                            <Row icon={Calendar} label="Requested On" value={new Date(request.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
                        </div>

                        <div className="min-w-0">
                            {request.message && (
                                <>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Message from buyer</p>
                                    <div className="flex items-start gap-3 rounded-xl bg-white p-3.5 shadow-sm">
                                        <MessageSquare size={15} className="mt-0.5 shrink-0 text-slate-400" />
                                        <p className="wrap-break-word text-sm text-slate-700">{request.message}</p>
                                    </div>
                                </>
                            )}

                            {showRejectForm && (
                                <div className="mt-4">
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Reason for declining</label>
                                    <textarea rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full resize-y rounded-xl border-2 border-red-200 bg-red-50/50 px-3.5 py-2.5 text-sm focus:border-red-400 focus:outline-none" placeholder="e.g. Already sold to another buyer" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {request.status === 'PENDING' && (
                    <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-white p-4 sm:flex-row sm:p-5">
                        {!showRejectForm ? (
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-1">
                                <button onClick={() => setShowRejectForm(true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-red-200 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
                                    <XCircle size={15} /> Decline
                                </button>
                                <button
                                    onClick={onAccept}
                                    disabled={accepting}
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    {accepting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Accept & Mark Sold
                                </button>
                                <p className="text-center text-[11px] text-slate-400 sm:hidden">Accepting marks the vehicle sold and declines other offers on it.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-1">
                                <button onClick={() => setShowRejectForm(false)} className="flex-1 rounded-xl border-2 border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button
                                    onClick={() => onReject(rejectReason)}
                                    disabled={rejecting}
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
                                >
                                    {rejecting ? <Loader2 size={15} className="animate-spin" /> : 'Confirm Decline'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export const SellerPurchaseRequestsPage = () => {
    const { data, isLoading } = useGetPurchaseRequestsQuery();
    const [acceptRequest, { isLoading: accepting }] = useAcceptPurchaseRequestMutation();
    const [rejectRequest, { isLoading: rejecting }] = useRejectPurchaseRequestMutation();
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('ALL');

    const requests = useMemo(() => data?.data || [], [data]);
    const counts = useMemo(() => requests.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), { ALL: requests.length }), [requests]);
    const visible = filter === 'ALL' ? requests : requests.filter((r) => r.status === filter);

    const handleAccept = async () => {
        try {
            const res = await acceptRequest(selected.id).unwrap();
            toast.success(res?.message || 'Request accepted — vehicle marked as sold');
            setSelected(null);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to accept');
        }
    };

    const handleReject = async (reason) => {
        try {
            await rejectRequest({ id: selected.id, reason }).unwrap();
            toast.success('Request declined');
            setSelected(null);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to decline');
        }
    };

    return (
        <div className="space-y-6">
            <Helmet><title>Purchase Requests | VehicleHub Seller</title></Helmet>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Purchase Requests</h1>
                    <p className="mt-1 text-sm text-slate-500">Buyers who've made an offer on your listings.</p>
                </div>
                {counts.PENDING > 0 && (
                    <span className="flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                        <Clock size={13} /> {counts.PENDING} awaiting your decision
                    </span>
                )}
            </div>

            {/* Status filter */}
            {requests.length > 0 && (
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [&::-webkit-scrollbar]:hidden">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${filter === f ? 'border-[#001f3f] bg-[#001f3f] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-[#001f3f]/40'}`}
                        >
                            {f === 'ALL' ? 'All' : statusOf(f).label}
                            <span className={`rounded-full px-1.5 text-[10px] ${filter === f ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{counts[f] || 0}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                        <ShoppingBag size={26} />
                        <p className="text-sm font-medium">{requests.length === 0 ? 'No purchase requests yet.' : `No ${statusOf(filter).label.toLowerCase()} requests.`}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {visible.map((r) => (
                            <button key={r.id} onClick={() => setSelected(r)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50 sm:p-5">
                                {r.vehicleListing?.images?.[0] ? (
                                    <img src={r.vehicleListing.images[0]} className="h-12 w-12 shrink-0 rounded-lg object-cover" alt="" />
                                ) : (
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#e6f2ff] text-lg">🚘</span>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-slate-900">{r.buyerName} <span className="font-normal text-slate-400">wants to buy</span> {r.vehicleListing?.title}</p>
                                    <p className="text-xs text-slate-500">Offer: {formatCurrency(r.offerPrice)} · {new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                                </div>
                                <StatusBadge status={r.status} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selected && (
                <RequestDetailModal
                    request={selected}
                    onClose={() => setSelected(null)}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    accepting={accepting}
                    rejecting={rejecting}
                />
            )}
        </div>
    );
};