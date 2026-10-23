// VehicleHub/VehicleHub/src/components/admin/FieldInspectorsPage.jsx
// Admin > Field Inspectors (/admin/dashboard/field-inspectors): add, edit, activate/deactivate
// Field Inspector accounts and resend their sign-in email. Assigning jobs stays on the
// Field Inspections page. Passwords are never emailed — inspectors set their own with
// "Forgot password" (or use one the admin gives them).
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import {
    UserCog, UserPlus, Search, X, Loader2, Pencil, Mail, Power, ClipboardCheck, Eye, EyeOff, KeyRound, Users, Briefcase, CheckCircle2,
} from 'lucide-react';
import {
    useGetFieldInspectorsQuery,
    useCreateFieldInspectorMutation,
    useUpdateFieldInspectorMutation,
    useSendInspectorInviteMutation,
} from '../../services/adminApiSlice.js';
import { AdminLoading, AdminError, AdminEmpty } from './AdminState.jsx';

const PASSWORD_MIN = 6;
const inputCls = 'w-full rounded-xl border-2 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:bg-white focus:outline-none';
const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const errText = (err, fallback) => (err?.status === 'FETCH_ERROR' ? "Can't reach the server. Please try again." : err?.data?.message || fallback);

const Field = ({ label, error, hint, children }) => (
    <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
        {children}
        {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
    </label>
);

const InspectorModal = ({ inspector, onClose }) => {
    const editing = Boolean(inspector);
    const [form, setForm] = useState({
        fullName: inspector?.fullName || '',
        email: inspector?.email || '',
        phone: inspector?.phone?.replace(/^\+91/, '') || '',
        password: '',
        sendEmail: true,
    });
    const [setPassword, setSetPassword] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [errors, setErrors] = useState({});
    const [create, { isLoading: creating }] = useCreateFieldInspectorMutation();
    const [update, { isLoading: updating }] = useUpdateFieldInspectorMutation();
    const saving = creating || updating;
    const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

    const check = () => {
        const e = {};
        if (form.fullName.trim().length < 2) e.fullName = "Enter the inspector's full name.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'Enter a valid email address.';
        if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, ''))) e.phone = 'Enter a valid 10-digit mobile number.';
        if (setPassword && form.password.length < PASSWORD_MIN) e.password = `At least ${PASSWORD_MIN} characters.`;
        return e;
    };

    const submit = async (ev) => {
        ev.preventDefault();
        const e = check();
        setErrors(e);
        if (Object.keys(e).length) return;
        const body = {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, ''),
            ...(setPassword && form.password ? { password: form.password } : {}),
        };
        try {
            const res = editing
                ? await update({ id: inspector.id, ...body }).unwrap()
                : await create({ ...body, sendEmail: form.sendEmail }).unwrap();
            toast.success(res?.message || 'Saved');
            onClose();
        } catch (err) {
            if (err?.data?.errors) setErrors(err.data.errors);
            toast.error(errText(err, 'Could not save the inspector'));
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <form onSubmit={submit} noValidate className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label={editing ? 'Edit field inspector' : 'Add field inspector'}>
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-[#001f3f]">Field inspector</p>
                        <h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit inspector' : 'Add a field inspector'}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={18} /></button>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    <Field label="Full name" error={errors.fullName}>
                        <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="e.g. Suresh Babu" autoFocus className={`${inputCls} ${errors.fullName ? 'border-red-300' : 'border-slate-200 focus:border-[#001f3f]'}`} />
                    </Field>
                    <Field label="Email" error={errors.email} hint="Sign-in details and password codes go to this email.">
                        <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="inspector@example.com" className={`${inputCls} ${errors.email ? 'border-red-300' : 'border-slate-200 focus:border-[#001f3f]'}`} />
                    </Field>
                    <Field label="Mobile number" error={errors.phone} hint="The inspector can also sign in with this number.">
                        <div className="flex">
                            <span className="flex items-center rounded-l-xl border-2 border-r-0 border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-500">+91</span>
                            <input inputMode="numeric" value={form.phone} onChange={(e) => set('phone', e.target.value.replace(/[^\d\s]/g, '').slice(0, 12))} placeholder="98765 43210" className={`${inputCls} rounded-l-none ${errors.phone ? 'border-red-300' : 'border-slate-200 focus:border-[#001f3f]'}`} />
                        </div>
                    </Field>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                        <label className="flex cursor-pointer items-start gap-2.5">
                            <input type="checkbox" checked={setPassword} onChange={(e) => { setSetPassword(e.target.checked); set('password', ''); }} className="mt-0.5 h-4 w-4 accent-[#001f3f]" />
                            <span>
                                <span className="block text-sm font-semibold text-slate-800">{editing ? 'Set a new password' : 'Set a password now'}</span>
                                <span className="block text-xs text-slate-500">
                                    {editing ? 'Signs the inspector out everywhere. Tell them the new password yourself.' : 'Optional. Otherwise the inspector sets their own password with a code sent to their email.'}
                                </span>
                            </span>
                        </label>
                        {setPassword && (
                            <div className="mt-3">
                                <div className="relative">
                                    <KeyRound size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder={`At least ${PASSWORD_MIN} characters`} autoComplete="new-password" className={`${inputCls} pl-10 pr-11 ${errors.password ? 'border-red-300' : 'border-slate-200 focus:border-[#001f3f]'}`} />
                                    <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-700">
                                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {errors.password && <span className="mt-1 block text-xs text-red-600">{errors.password}</span>}
                                <span className="mt-1 block text-xs text-slate-400">Passwords are never emailed.</span>
                            </div>
                        )}
                    </div>

                    {!editing && (
                        <label className="flex cursor-pointer items-start gap-2.5">
                            <input type="checkbox" checked={form.sendEmail} onChange={(e) => set('sendEmail', e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#001f3f]" />
                            <span>
                                <span className="block text-sm font-semibold text-slate-800">Send a welcome email</span>
                                <span className="block text-xs text-slate-500">With the login link and how to set a password.</span>
                            </span>
                        </label>
                    )}
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
                    <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-[#001f3f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#002a55] disabled:opacity-60">
                        {saving ? <Loader2 size={15} className="animate-spin" /> : editing ? <CheckCircle2 size={15} /> : <UserPlus size={15} />}
                        {editing ? 'Save changes' : 'Add inspector'}
                    </button>
                </div>
            </form>
        </div>,
        document.body,
    );
};

export const FieldInspectorsPage = () => {
    const { data, isLoading, isError, error, refetch } = useGetFieldInspectorsQuery();
    const [update] = useUpdateFieldInspectorMutation();
    const [sendInvite] = useSendInspectorInviteMutation();
    const [modal, setModal] = useState(null); // null | 'new' | inspector
    const [busy, setBusy] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('active');

    const all = useMemo(() => data?.data || [], [data]);
    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return all
            .filter((u) => (filter === 'all' ? true : filter === 'active' ? u.isActive : !u.isActive))
            .filter((u) => !q || [u.fullName, u.email, u.phone].some((f) => String(f || '').toLowerCase().includes(q)));
    }, [all, search, filter]);
    const stats = {
        total: all.length,
        active: all.filter((u) => u.isActive).length,
        open: all.reduce((n, u) => n + u.openInspections, 0),
        completed: all.reduce((n, u) => n + u.completedInspections, 0),
    };

    const toggleActive = async (u) => {
        if (u.isActive && !window.confirm(`Deactivate ${u.fullName}? They won't be able to sign in or be assigned inspections.`)) return;
        setBusy(u.id);
        try {
            const res = await update({ id: u.id, isActive: !u.isActive }).unwrap();
            toast.success(res?.message || 'Updated');
        } catch (err) {
            toast.error(errText(err, 'Could not update the inspector'));
        } finally {
            setBusy(null);
        }
    };

    const invite = async (u) => {
        setBusy(u.id);
        try {
            const res = await sendInvite(u.id).unwrap();
            toast.success(res?.message || 'Email sent');
        } catch (err) {
            toast.error(errText(err, 'Could not send the email'));
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="space-y-6">
            <Helmet><title>Field Inspectors | Admin</title></Helmet>
            <div className="flex flex-wrap items-end justify-between gap-3 animate-fadeInUp">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><UserCog size={22} className="text-[#001f3f]" /> Field Inspectors</h1>
                    <p className="text-sm text-slate-500">Add and manage the people who inspect vehicles. Assign them jobs from <Link to="/admin/dashboard/inspections" className="font-semibold text-[#001f3f] hover:underline">Field Inspections</Link>.</p>
                </div>
                <button type="button" onClick={() => setModal('new')} className="flex items-center gap-2 rounded-xl bg-[#001f3f] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 hover:bg-[#002a55]">
                    <UserPlus size={16} /> Add inspector
                </button>
            </div>

            {isLoading ? (
                <AdminLoading label="Loading inspectors..." />
            ) : isError ? (
                <AdminError error={error} onRetry={refetch} label="Failed to load field inspectors." />
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {[
                            { label: 'Inspectors', value: stats.total, icon: Users, tone: 'bg-[#e6f2ff] text-[#001f3f]' },
                            { label: 'Active', value: stats.active, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
                            { label: 'Open jobs', value: stats.open, icon: Briefcase, tone: 'bg-amber-50 text-amber-700' },
                            { label: 'Completed jobs', value: stats.completed, icon: ClipboardCheck, tone: 'bg-indigo-50 text-indigo-700' },
                        ].map((c, i) => {
                            const Icon = c.icon;
                            return (
                                <div key={c.label} style={{ animationDelay: `${i * 60}ms` }} className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.tone}`}><Icon size={17} /></span>
                                    <p className="mt-3 text-xs font-semibold uppercase text-slate-400">{c.label}</p>
                                    <p className="mt-1 text-2xl font-extrabold text-slate-900">{c.value}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                            <Search size={16} className="shrink-0 text-slate-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or mobile..." aria-label="Search inspectors" className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
                        </div>
                        <div className="flex w-fit gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                            {[['active', 'Active'], ['inactive', 'Inactive'], ['all', 'All']].map(([id, label]) => (
                                <button key={id} type="button" onClick={() => setFilter(id)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${filter === id ? 'bg-[#001f3f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {rows.length === 0 ? (
                        all.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
                                <UserCog size={26} className="text-slate-300" />
                                <p className="text-sm font-semibold text-slate-700">No field inspectors yet</p>
                                <p className="max-w-sm text-xs text-slate-500">Add your first inspector. They'll get an email with the login link and how to set their password.</p>
                                <button type="button" onClick={() => setModal('new')} className="mt-1 flex items-center gap-2 rounded-xl bg-[#001f3f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#002a55]"><UserPlus size={15} /> Add inspector</button>
                            </div>
                        ) : (
                            <AdminEmpty icon={Search} title="No inspectors match" text="Try another search or filter." />
                        )
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <table className="w-full min-w-[900px] text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Inspector</th>
                                        <th className="px-5 py-3">Contact</th>
                                        <th className="px-5 py-3">Jobs</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Added</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rows.map((u) => (
                                        <tr key={u.id} className={`hover:bg-slate-50 ${u.isActive ? '' : 'opacity-60'}`}>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#001f3f] text-xs font-bold text-white">
                                                        {(u.fullName || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-slate-900">{u.fullName}</p>
                                                        {!u.hasPassword && <p className="text-[11px] font-medium text-amber-600">Password not set yet</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="max-w-[220px] truncate text-slate-700">{u.email}</p>
                                                <p className="text-xs text-slate-500">{u.phone || '—'}</p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-slate-800"><strong>{u.openInspections}</strong> open · <strong>{u.completedInspections}</strong> done</p>
                                                <p className="text-xs text-slate-400">{u.lastCompletedAt ? `Last report ${day(u.lastCompletedAt)}` : 'No reports yet'}</p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{day(u.createdAt)}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex justify-end gap-1.5">
                                                    <button type="button" onClick={() => setModal(u)} title="Edit" aria-label={`Edit ${u.fullName}`} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"><Pencil size={14} /></button>
                                                    <button type="button" onClick={() => invite(u)} disabled={!u.isActive || busy === u.id} title="Resend sign-in email" aria-label={`Resend sign-in email to ${u.fullName}`} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40">
                                                        {busy === u.id ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleActive(u)}
                                                        disabled={busy === u.id}
                                                        title={u.isActive ? 'Deactivate' : 'Activate'}
                                                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40 ${u.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                                                    >
                                                        <Power size={13} /> {u.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {modal && <InspectorModal inspector={modal === 'new' ? null : modal} onClose={() => setModal(null)} />}
        </div>
    );
};