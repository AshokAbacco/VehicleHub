import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Save, Loader2, User } from 'lucide-react';
import { useGetBuyerProfileQuery, useUpdateBuyerProfileMutation } from '../../services/buyerApiSlice.js';

export const BuyerSettingsPage = () => {
    const { data, isLoading } = useGetBuyerProfileQuery();
    const [updateProfile, { isLoading: saving }] = useUpdateBuyerProfileMutation();
    const [form, setForm] = useState({ fullName: '', phone: '' });

    useEffect(() => {
        if (data?.data) setForm({ fullName: data.data.fullName || '', phone: data.data.phone || '' });
    }, [data]);

    const handleSave = async () => {
        try {
            await updateProfile(form).unwrap();
            toast.success('Profile updated');
        } catch (err) {
            toast.error('Failed to update profile');
        }
    };

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" /></div>;

    return (
        <div className="space-y-6">
            <Helmet><title>Settings | VehicleHub</title></Helmet>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="mt-1 text-sm text-slate-500">Update your profile and preferences.</p>
            </div>
            <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900"><User size={16} className="text-[#001f3f]" /> Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Full Name</label>
                        <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:border-[#001f3f] focus:bg-white focus:outline-none" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Phone</label>
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:border-[#001f3f] focus:bg-white focus:outline-none" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email (cannot be changed)</label>
                        <input disabled value={data?.data?.email || ''} className="w-full rounded-xl border-2 border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500" />
                    </div>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#002a55] disabled:opacity-60">
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};