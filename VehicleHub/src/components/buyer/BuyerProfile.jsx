// VehicleHub/VehicleHub/src/components/buyer/BuyerProfile.jsx
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar, Heart, Loader2, Mail, Pencil, Phone, Save, ShoppingBag, User, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGetBuyerProfileQuery, useGetBuyerStatsQuery, useUpdateBuyerProfileMutation } from '../../services/buyerApiSlice.js';
import { AvatarImage } from '../ui/AvatarImage.jsx';

const StatChip = ({ icon: Icon, label, value, bg, color }) => (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}><Icon size={16} /></span>
        <div className="min-w-0"><p className="text-lg font-extrabold text-slate-900">{value}</p><p className="text-[11px] font-medium text-slate-500">{label}</p></div>
    </div>
);

const TextInput = (props) => (
    <input {...props} className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#001f3f] focus:bg-white focus:outline-none" />
);

export const BuyerProfile = () => {
    const { data, isLoading, isError } = useGetBuyerProfileQuery();
    const { data: statsData } = useGetBuyerStatsQuery();
    const [updateProfile, { isLoading: saving }] = useUpdateBuyerProfileMutation();
    const profile = data?.data;
    const stats = statsData?.data || {};
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ fullName: '', phone: '' });

    useEffect(() => {
        // Hydrate the editable form after the profile query resolves.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (profile) setForm({ fullName: profile.fullName || '', phone: profile.phone || '' });
    }, [profile]);

    const handleSave = async () => {
        if (!form.fullName.trim()) return toast.error('Full name is required');
        try {
            await updateProfile(form).unwrap();
            toast.success('Profile updated');
            setEditing(false);
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to update profile');
        }
    };

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" /></div>;
    if (isError || !profile) return <div className="flex h-64 items-center justify-center text-sm text-red-500">Failed to load profile.</div>;

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>My Profile | VehicleHub Buyer</title></Helmet>
            <div className="animate-fadeInUp">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#001f3f]">Buyer centre</p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">My Profile</h1>
                <p className="mt-1 text-sm text-slate-500">Manage your account details and marketplace activity.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="animate-fadeInUp space-y-6 lg:col-span-1">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#001f3f] to-[#2d6cdf] text-2xl font-bold text-white shadow-md">
                            <AvatarImage src={profile.avatar} name={profile.fullName || 'Buyer'} />
                        </div>
                        <h2 className="mt-4 text-lg font-bold">{profile.fullName || 'Buyer'}</h2>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#e6f2ff] px-3 py-1 text-xs font-bold text-[#001f3f]"><User size={11} /> BUYER</span>
                        <div className="mt-5 space-y-2.5 text-left">
                            <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5"><Mail size={14} className="shrink-0 text-slate-400" /><span className="truncate text-sm text-slate-700">{profile.email}</span></div>
                            <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5"><Phone size={14} className="shrink-0 text-slate-400" /><span className="truncate text-sm text-slate-700">{profile.phone || 'Not set'}</span></div>
                            <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5"><Calendar size={14} className="shrink-0 text-slate-400" /><span className="truncate text-sm text-slate-700">Joined {new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-bold">Your Activity</h3>
                        <div className="grid grid-cols-1 gap-2.5">
                            <StatChip icon={Heart} label="Saved vehicles" value={stats.wishlistCount ?? 0} bg="bg-red-50" color="text-red-500" />
                            <StatChip icon={ShoppingBag} label="Purchase requests" value={stats.inquiriesCount ?? 0} bg="bg-emerald-50" color="text-emerald-600" />
                            <StatChip icon={ShoppingBag} label="Purchased vehicles" value={stats.purchasedCount ?? 0} bg="bg-[#e6f2ff]" color="text-[#001f3f]" />
                        </div>
                    </div>
                </div>

                <div className="animate-fadeInUp lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]"><User size={15} /></span><h2 className="text-base font-bold">Profile Details</h2></div>
                            {!editing ? <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"><Pencil size={12} /> Edit</button> : <button onClick={() => { setEditing(false); setForm({ fullName: profile.fullName || '', phone: profile.phone || '' }); }} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"><X size={12} /> Cancel</button>}
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Full Name</label>{editing ? <TextInput value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Full name" /> : <p className="break-words rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-medium">{profile.fullName || '—'}</p>}</div>
                            <div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Phone</label>{editing ? <TextInput value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+91 98765 43210" /> : <p className="break-words rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-medium">{profile.phone || '—'}</p>}</div>
                            <div className="sm:col-span-2"><label className="mb-1.5 block text-xs font-semibold text-slate-600">Email (cannot be changed)</label><p className="break-all rounded-xl border border-slate-100 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500">{profile.email}</p></div>
                        </div>
                        {editing && <button onClick={handleSave} disabled={saving} className="mt-5 flex items-center gap-2 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#002a55] disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};