import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, Eye, Clock, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { useApproveVehicleMutation, useGetPendingVehiclesQuery, useRejectVehicleMutation } from '../../services/adminApiSlice.js';
import { VehicleReviewModal } from '../../components/admin/VehicleReviewModal.jsx';

export const VehicleApprovalsPage = () => {
    const [reviewing, setReviewing] = useState(null);
    const { data, isLoading, isError } = useGetPendingVehiclesQuery(undefined, { pollingInterval: 15000 });
    const [approveVehicle] = useApproveVehicleMutation();
    const [rejectVehicle] = useRejectVehicleMutation();
    const items = data?.data?.vehicles || [];

    const handleApprove = async (vehicle) => {
        await approveVehicle(vehicle.id).unwrap();
    };

    const handleReject = async (vehicle, reason) => {
        await rejectVehicle({ id: vehicle.id, reason }).unwrap();
    };

    return (
        <div className="space-y-6">
            <Helmet><title>Vehicle Approvals | Admin</title></Helmet>

            <div className="animate-fadeInUp flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Vehicle Approvals</h1>
                    <p className="text-sm text-slate-500">Review vehicles submitted by sellers before they go live.</p>
                </div>
                {items.length > 0 && (
                    <span className="flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700">
                        <Clock size={13} /> {items.length} awaiting review
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
            ) : isError ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-red-500"><XCircle size={22} /><p className="text-sm font-medium">Failed to load vehicle approvals.</p></div>
            ) : items.length === 0 ? (
                <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                        <CheckCircle2 size={30} className="text-emerald-500" />
                    </div>
                    <p className="mt-4 text-lg font-bold text-slate-900">All caught up!</p>
                    <p className="text-sm text-slate-400">No pending vehicle approvals.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((v, idx) => (
                        <div
                            key={v.id}
                            style={{ animationDelay: `${idx * 70}ms` }}
                            className="animate-fadeInUp group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#001f3f] hover:shadow-xl hover:shadow-[#001f3f]/10"
                        >
                            {/* Sweep highlight on hover */}
                            <span className="absolute inset-x-0 top-0 h-0.75 w-full overflow-hidden">
                                <span className="block h-full w-1/2 -translate-x-full bg-linear-to-r from-transparent via-amber-500 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
                            </span>

                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl transition-transform duration-300 group-hover:scale-110">
                                        {v.thumb}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate font-bold text-slate-900">{v.title}</p>
                                        <p className="truncate text-xs text-slate-500">{v.category || 'Vehicle'}</p>
                                    </div>
                                </div>
                                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700">Pending</span>
                            </div>

                            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Seller</span>
                                    <span className="font-semibold text-slate-800">{v.sellerName || v.email || 'Seller'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Price</span>
                                    <span className="font-bold text-slate-900">₹{(v.price / 100000).toFixed(2)}L</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Submitted</span>
                                    <span className="text-slate-600">{v.submittedAt}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setReviewing(v)}
                                className="group/btn mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f3f] py-2.5 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition-all duration-200 hover:bg-[#002a55] hover:shadow-lg active:scale-[0.98]"
                            >
                                <Eye size={15} />
                                View & Decide
                                <ArrowRight size={14} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {reviewing && (
                <VehicleReviewModal
                    vehicle={reviewing}
                    onClose={() => setReviewing(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    );
};