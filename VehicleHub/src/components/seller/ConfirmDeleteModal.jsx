import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDeleteModal = ({ itemName, onCancel, onConfirm }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px]" onClick={onCancel} />
            <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <AlertTriangle size={22} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">Delete this vehicle?</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                    Are you sure you want to delete <span className="font-semibold text-slate-800">"{itemName}"</span>? This can't be undone.
                </p>
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};