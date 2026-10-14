import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export const AdminConfirmDeleteModal = ({ itemName, onCancel, onConfirm }) => {
    const ref = useRef(null);
    useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onCancel(); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [onCancel]);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div ref={ref} className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500"><AlertTriangle size={22} /></div>
                <h3 className="mt-4 text-base font-bold text-slate-900">Delete this record?</h3>
                <p className="mt-1.5 text-sm text-slate-500">Are you sure you want to delete <span className="font-semibold text-slate-800">"{itemName}"</span>? This can't be undone.</p>
                <div className="mt-6 flex gap-3">
                    <button onClick={onCancel} className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600">Delete</button>
                </div>
            </div>
        </div>
    );
};