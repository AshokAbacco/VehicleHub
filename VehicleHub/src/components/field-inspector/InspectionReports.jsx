import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Search, FileBarChart, Loader2, Eye, Image as ImageIcon } from 'lucide-react';
import { useGetInspectorReportsQuery } from '../../services/fieldInspectorApiSlice.js';

const resultBadge = {
    VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    NEEDS_CORRECTION: 'bg-amber-50 text-amber-700 border-amber-200',
    PENDING: 'bg-slate-100 text-slate-600 border-slate-200',
};

const resultFilters = [
    { value: '', label: 'All results' },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'NEEDS_CORRECTION', label: 'Needs Correction' },
];

export const InspectionReports = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [result, setResult] = useState('');

    const { data, isLoading, isError } = useGetInspectorReportsQuery({
        search: search || undefined,
        result: result || undefined,
    });
    const reports = data?.data || [];

    return (
        <div className="space-y-6 text-slate-900">
            <Helmet><title>Verification Reports | VehicleHub Inspector</title></Helmet>

            <div className="animate-fadeInUp">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#001f3f]">Field Inspector</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Verification Reports</h1>
                <p className="mt-1 text-sm text-slate-500">Your completed vehicle verification reports.</p>
            </div>

            {/* Filters */}
            <div className="animate-fadeInUp flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition focus-within:border-[#001f3f]/30 focus-within:bg-white">
                    <Search size={16} className="shrink-0 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by vehicle, seller, or report ID..."
                        className="w-full max-w-xs bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                </div>
                <select
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:border-[#001f3f]/30 focus:outline-none"
                >
                    {resultFilters.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Reports list */}
            <div className="animate-fadeInUp rounded-2xl border border-slate-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#001f3f]" /></div>
                ) : isError ? (
                    <div className="flex h-48 items-center justify-center text-sm text-red-500">Failed to load reports.</div>
                ) : reports.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-400">
                        <FileBarChart size={24} />
                        <p className="text-sm font-medium">No completed reports yet.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full min-w-[800px] text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3.5">Report ID</th>
                                        <th className="px-5 py-3.5">Vehicle</th>
                                        <th className="px-5 py-3.5">Seller</th>
                                        <th className="px-5 py-3.5">Inspection Date</th>
                                        <th className="px-5 py-3.5">Result</th>
                                        <th className="px-5 py-3.5">Photos</th>
                                        <th className="px-5 py-3.5">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {reports.map((r) => (
                                        <tr key={r.id} className="transition hover:bg-slate-50">
                                            <td className="px-5 py-4 font-mono text-xs font-medium text-[#001f3f]">{r.inspectionNo}</td>
                                            <td className="px-5 py-4 font-semibold text-slate-900">{r.vehicleListing?.title}</td>
                                            <td className="px-5 py-4 text-slate-500">{r.seller?.fullName}</td>
                                            <td className="px-5 py-4 text-slate-500">
                                                {r.completedAt ? new Date(r.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${resultBadge[r.result] || resultBadge.PENDING}`}>
                                                    {r.result.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">
                                                <span className="flex items-center gap-1"><ImageIcon size={13} /> {r.photos?.length || 0}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => navigate(`/field-inspector/reports/${r.id}`)}
                                                    className="flex items-center gap-1.5 rounded-full border border-[#001f3f]/20 bg-[#e6f2ff] px-3 py-1.5 text-xs font-semibold text-[#001f3f] transition hover:bg-[#d5eaff]"
                                                >
                                                    <Eye size={13} /> View Report
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="space-y-2.5 p-4 sm:hidden">
                            {reports.map((r) => (
                                <div key={r.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-medium text-[#001f3f]">{r.inspectionNo}</span>
                                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${resultBadge[r.result] || resultBadge.PENDING}`}>
                                            {r.result.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm font-semibold text-slate-900">{r.vehicleListing?.title}</p>
                                    <p className="text-xs text-slate-500">{r.seller?.fullName}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <p className="text-xs text-slate-400">
                                            {r.completedAt ? new Date(r.completedAt).toLocaleDateString('en-IN') : '—'}
                                        </p>
                                        <button
                                            onClick={() => navigate(`/field-inspector/reports/${r.id}`)}
                                            className="flex items-center gap-1.5 rounded-full border border-[#001f3f]/20 bg-[#e6f2ff] px-3 py-1.5 text-xs font-semibold text-[#001f3f]"
                                        >
                                            <Eye size={13} /> View
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};