// components/admin/SellerReviewModal.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import {
  useGetSellerRegistrationDetailQuery,
  useApproveSellerMutation,
  useRejectSellerMutation,
} from "../../services/adminApiSlice.js";

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between border-b border-slate-100 py-2 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-900">{value || "—"}</span>
  </div>
);

export const SellerReviewModal = ({ sellerId, onClose, onDecided }) => {
  const { data, isLoading } = useGetSellerRegistrationDetailQuery(sellerId, { skip: !sellerId });
  const [approveSeller, { isLoading: approving }] = useApproveSellerMutation();
  const [rejectSeller, { isLoading: rejecting }] = useRejectSellerMutation();
  const [rejectReason, setRejectReason] = useState("");

  const seller = data?.seller;

  const handleApprove = async () => {
    try {
      await approveSeller(sellerId).unwrap();
      toast.success("Seller approved");
      onDecided?.();
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error("Enter a rejection reason");
    try {
      await rejectSeller({ id: sellerId, reason: rejectReason }).unwrap();
      toast.success("Seller rejected");
      onDecided?.();
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reject");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {seller ? `${seller.ownerName}'s Registration` : "Loading..."}
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {isLoading && <p className="text-sm text-slate-400">Loading registration details...</p>}

        {seller && (
          <>
            <DetailRow label="Seller Type" value={seller.sellerType} />
            <DetailRow label="Business Name" value={seller.businessName} />
            <DetailRow label="Email" value={seller.email} />
            <DetailRow label="Phone" value={seller.phone} />
            <DetailRow label="Address" value={seller.address} />
            <DetailRow label="City / State / Pincode" value={`${seller.city}, ${seller.state} - ${seller.pincode}`} />
            <DetailRow label="GST Number" value={seller.gstNumber} />
            <DetailRow label="PAN Number" value={seller.panNumber} />
            <DetailRow label="Years in Business" value={seller.yearsInBusiness} />
            <DetailRow label="Website" value={seller.website} />
            <DetailRow label="Bank Account Holder" value={seller.bankAccountHolder} />
            <DetailRow label="Bank Name" value={seller.bankName} />
            <DetailRow label="Account Number" value={seller.bankAccountNumber} />
            <DetailRow label="IFSC" value={seller.bankIFSC} />
            <DetailRow label="Description" value={seller.description} />
            <DetailRow label="Submitted" value={seller.submittedAt ? new Date(seller.submittedAt).toLocaleString() : "—"} />

            {seller.documents?.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {seller.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 p-2 text-center text-xs hover:border-[#001f3f]/40"
                  >
                    <img src={doc.fileUrl} alt={doc.type} className="mb-1 h-20 w-full rounded object-cover" />
                    {doc.type}
                  </a>
                ))}
              </div>
            )}

            {seller.verificationStatus === "PENDING" && (
              <>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Rejection reason (only needed if rejecting)"
                  className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
                <div className="mt-4 flex gap-3">
                  <button onClick={onClose} className="flex-1 rounded-2xl border py-2.5 text-sm font-semibold">
                    Close
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={rejecting}
                    className="flex-1 rounded-2xl bg-red-50 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-50"
                  >
                    {rejecting ? "Rejecting..." : "Reject"}
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex-1 rounded-2xl bg-[#001f3f] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {approving ? "Approving..." : "Approve"}
                  </button>
                </div>
              </>
            )}

            {seller.verificationStatus !== "PENDING" && (
              <div className={`mt-4 rounded-2xl p-4 text-center text-sm font-semibold ${
                seller.verificationStatus === "APPROVED" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}>
                Already {seller.verificationStatus.toLowerCase()}
                {seller.rejectReason && ` — ${seller.rejectReason}`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};