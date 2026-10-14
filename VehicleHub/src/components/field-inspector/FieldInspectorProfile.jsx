// VehicleHub/VehicleHub/src/components/field-inspector/FieldInspectorProfile.jsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import {
    User, Mail, Phone, Shield, Calendar, Pencil, X, Save, Loader2,
    KeyRound, ClipboardList, CheckCircle2, ShieldCheck, Eye, EyeOff,
} from 'lucide-react';
import {
    useGetProfileQuery,
    useUpdateInspectorProfileMutation,
    useChangeInspectorPasswordMutation,
} from '../../services/fieldInspectorApiSlice.js';
import { AvatarImage } from '../ui/AvatarImage.jsx';

const StatChip = ({ icon: Icon, label, value, bg, color }) => (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}>
            <Icon size={16} />
        </span>
        <div className="min-w-0">
            <p className="text-lg font-extrabold text-slate-900">{value}</p>
            <p className="text-[11px] font-medium text-slate-500">{label}</p>
        </div>
    </div>
);

const TextInput = (props) => (
    <input
        {...props}
        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#001f3f] focus:bg-white focus:outline-none"
    />
);

export const FieldInspectorProfile = () => {
    const { data, isLoading, isError } = useGetProfileQuery();
    const [updateProfile, { isLoading: saving }] = useUpdateInspectorProfileMutation();
    const [changePassword, { isLoading: changingPassword }] = useChangeInspectorPasswordMutation();

    const profile = data?.data;

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ fullName: '', phone: '' });

    const [pwOpen, setPwOpen] = useState(false);
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

    useEffect(() => {
        if (profile) setForm({ fullName: profile.fullName || '', phone: profile.phone || '' });
    }, [profile]);

    const handleSaveProfile = async () => {
        if (!form.fullName.trim()) return toast.error('Full name is required');
        try {
            await updateProfile(form).unwrap();
            toast.success('Profile updated');
            setEditing(false);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            return toast.error('New passwords do not match');
        }
        if (pwForm.newPassword.length < 8) {
            return toast.error('New password must be at least 8 characters');
        }
        try {
            await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }).unwrap();
            toast.success('Password changed successfully');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPwOpen(false);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to change password');
        }
    };

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#001f3f]" /></div>;
    }
    if (isError || !profile) {
        return <div className="flex h-64 items-center justify-center text-sm text-red-500">Failed to load profile.</div>;
    }


    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>My Profile | VehicleHub Inspector</title></Helmet>

            <div className="animate-fadeInUp">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#001f3f]">Field Inspector</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">My Profile</h1>
                <p className="mt-1 text-sm text-slate-500">Manage your account details and security.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left — profile card */}
                <div className="animate-fadeInUp space-y-6 lg:col-span-1">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#001f3f] to-[#003366] text-2xl font-bold text-white shadow-md">
                            <AvatarImage src={profile.avatar} name={profile.fullName || 'Field Inspector'} />
                        </div>
                        <h2 className="mt-4 text-lg font-bold text-slate-900">{profile.fullName || 'Field Inspector'}</h2>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#e6f2ff] px-3 py-1 text-xs font-bold text-[#001f3f]">
                            <Shield size={11} /> FIELD INSPECTOR
                        </span>

                        <div className="mt-5 space-y-2.5 text-left">
                            <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5">
                                <Mail size={14} className="shrink-0 text-slate-400" />
                                <span className="truncate text-sm text-slate-700">{profile.email}</span>
                            </div>
                            <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5">
                                <Phone size={14} className="shrink-0 text-slate-400" />
                                <span className="truncate text-sm text-slate-700">{profile.phone || 'Not set'}</span>
                            </div>
                            <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5">
                                <Calendar size={14} className="shrink-0 text-slate-400" />
                                <span className="truncate text-sm text-slate-700">
                                    Joined {new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-bold text-slate-900">Your Stats</h3>
                        <div className="grid grid-cols-1 gap-2.5">
                            <StatChip icon={ClipboardList} label="Total Inspections" value={profile.stats?.total ?? 0} bg="bg-[#e6f2ff]" color="text-[#001f3f]" />
                            <StatChip icon={CheckCircle2} label="Completed" value={profile.stats?.completed ?? 0} bg="bg-emerald-50" color="text-emerald-600" />
                            <StatChip icon={ShieldCheck} label="Verified Vehicles" value={profile.stats?.verified ?? 0} bg="bg-blue-50" color="text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Right — edit forms */}
                <div className="animate-fadeInUp space-y-6 lg:col-span-2">
                    {/* Profile details */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]"><User size={15} /></span>
                                <h2 className="text-base font-bold text-slate-900">Profile Details</h2>
                            </div>
                            {!editing ? (
                                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                                    <Pencil size={12} /> Edit
                                </button>
                            ) : (
                                <button onClick={() => { setEditing(false); setForm({ fullName: profile.fullName || '', phone: profile.phone || '' }); }} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                                    <X size={12} /> Cancel
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Full Name</label>
                                {editing ? (
                                    <TextInput value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" />
                                ) : (
                                    <p className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800">{profile.fullName || '—'}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Phone</label>
                                {editing ? (
                                    <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                                ) : (
                                    <p className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800">{profile.phone || '—'}</p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email (cannot be changed)</label>
                                <p className="rounded-xl border border-slate-100 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500">{profile.email}</p>
                            </div>
                        </div>

                        {editing && (
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="mt-5 flex items-center gap-2 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-[#001f3f]/20 transition hover:-translate-y-0.5 hover:bg-[#002a55] hover:shadow-md disabled:opacity-60"
                            >
                                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                Save Changes
                            </button>
                        )}
                    </div>

                    {/* Change password */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f2ff] text-[#001f3f]"><KeyRound size={15} /></span>
                                <h2 className="text-base font-bold text-slate-900">Change Password</h2>
                            </div>
                            {!pwOpen && (
                                <button onClick={() => setPwOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                                    <Pencil size={12} /> Change
                                </button>
                            )}
                        </div>

                        {pwOpen ? (
                            <form onSubmit={handleChangePassword} className="space-y-3">
                                {[
                                    { key: 'currentPassword', label: 'Current Password', show: 'current' },
                                    { key: 'newPassword', label: 'New Password', show: 'next' },
                                    { key: 'confirmPassword', label: 'Confirm New Password', show: 'confirm' },
                                ].map((f) => (
                                    <div key={f.key}>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">{f.label}</label>
                                        <div className="relative">
                                            <input
                                                type={showPw[f.show] ? 'text' : 'password'}
                                                value={pwForm[f.key]}
                                                onChange={(e) => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                                                required
                                                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 pr-11 text-sm text-slate-900 transition focus:border-[#001f3f] focus:bg-white focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPw({ ...showPw, [f.show]: !showPw[f.show] })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPw[f.show] ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => { setPwOpen(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                                        className="flex-1 rounded-xl border-2 border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={changingPassword}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#001f3f] py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#002a55] disabled:opacity-60"
                                    >
                                        {changingPassword ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p className="text-sm text-slate-400">••••••••••••</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};