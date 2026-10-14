import { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';

export const MarkSoldModal = ({ listing, onClose, onConfirm, submitting }) => {
    const [form, setForm] = useState({ soldToName: '', soldToPhone: '', soldToEmail: '', soldPrice: listing?.price || '' });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.soldToName.trim()) return setError('Buyer name is required');
        setError('');
        onConfirm(form);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="animate-fadeInUp w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between bg-gradient-to-r from-[#001f3f] to-[#003d7a] px-6 py-4">
                    <div className="flex items-center gap-2 text-white">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                            <ShoppingBag size={15} />
                        </span>
                        <h3 className="text-base font-bold">Mark as Sold</h3>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3 p-6">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Buyer Name *</label>
                        <input
                            value={form.soldToName}
                            onChange={(e) => setForm({ ...form, soldToName: e.target.value })}
                            className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm transition focus:border-[#001f3f] focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Buyer Phone</label>
                        <input
                            value={form.soldToPhone}
                            onChange={(e) => setForm({ ...form, soldToPhone: e.target.value })}
                            className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm transition focus:border-[#001f3f] focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Buyer Email</label>
                        <input
                            type="email"
                            value={form.soldToEmail}
                            onChange={(e) => setForm({ ...form, soldToEmail: e.target.value })}
                            className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm transition focus:border-[#001f3f] focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Sold Price (₹)</label>
                        <input
                            type="number"
                            value={form.soldPrice}
                            onChange={(e) => setForm({ ...form, soldPrice: e.target.value })}
                            className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm transition focus:border-[#001f3f] focus:outline-none"
                        />
                    </div>
                    {error && <p className="text-xs font-medium text-red-500">{error}</p>}
                    <div className="mt-4 flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 rounded-lg border-2 border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 rounded-lg bg-[#001f3f] py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#002a55] hover:shadow-md disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Confirm Sale'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};