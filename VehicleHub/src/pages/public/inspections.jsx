// VehicleHub/VehicleHub/src/pages/public/inspections.jsx
// "How inspections work" (/inspection — linked from the footer). Light theme only.
// Describes the real field-inspection workflow: admin assigns an inspector -> inspector accepts ->
// on-site 10-step verification -> report with a result (Verified / Needs correction / Rejected).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    ClipboardCheck, UserCheck, FileText, Fingerprint, Car, Sofa, Wrench, Gauge, MapPin, Camera, BadgeCheck,
    CheckCircle2, XCircle, AlertTriangle, ArrowRight, ShieldCheck, CalendarClock, Hand, PlayCircle, Send,
    Search, Store, ChevronDown, KeyRound, FolderOpen, Users,
} from 'lucide-react';

const STAGES = [
    { icon: Store, title: 'Vehicle listed', status: 'Listing', text: 'A seller or dealer lists a vehicle with photos, price, RC and insurance details.' },
    { icon: CalendarClock, title: 'Inspection scheduled', status: 'Assigned', text: 'Our admin team creates an inspection and assigns a MotorDesk field inspector, with a priority and deadline.' },
    { icon: Hand, title: 'Inspector accepts', status: 'Accepted', text: 'The inspector accepts the job and plans the visit. The seller can follow its status in their dashboard.' },
    { icon: PlayCircle, title: 'On-site verification', status: 'In progress', text: 'The inspector visits the vehicle and works through a 10-step checklist, saving progress as they go.' },
    { icon: Send, title: 'Report submitted', status: 'Completed', text: 'A full report with ratings, notes and photos is submitted with a final result.' },
    { icon: BadgeCheck, title: 'Result published', status: 'Verified', text: 'Passed vehicles get the MotorDesk Verified badge. The seller and our admin team are notified of the result.' },
];

const CHECKS = [
    { icon: UserCheck, title: 'Seller verification', items: ['Identity matches the account', 'Seller present at the visit', 'Mobile number and address confirmed', 'Owns or is authorised to sell the vehicle'] },
    { icon: FileText, title: 'Document verification', items: ['Registration Certificate (RC)', 'Insurance', 'Pollution certificate (PUC)', 'Ownership proof and other papers'] },
    { icon: Fingerprint, title: 'Vehicle identity', items: ['Registration number', 'Chassis / VIN number', 'Engine number', 'All match the RC and the listing'] },
    { icon: Car, title: 'Exterior inspection', items: ['Front, rear and both sides', 'Bonnet, boot, doors and bumpers', 'Lights, windows and windshield', 'Tyres'] },
    { icon: Sofa, title: 'Interior inspection', items: ['Dashboard, seats and seat belts', 'AC and infotainment', 'Power windows and central locking', 'Steering, horn and floor'] },
    { icon: Wrench, title: 'Engine & mechanical', items: ['Engine start and engine sound', 'Oil and coolant leakage', 'Brakes, clutch and gearbox', 'Suspension and battery'] },
    { icon: Gauge, title: 'Test drive', items: ['Driven where possible', 'Rated for how it drives', 'Notes on anything unusual'] },
    { icon: MapPin, title: 'Location verification', items: ['GPS location recorded', 'Matches the listed location', 'Vehicle and seller present'] },
    { icon: Camera, title: 'Photos & evidence', items: ['Photos of the vehicle and documents', 'Attached to the report as proof'] },
    { icon: ClipboardCheck, title: 'Final decision', items: ['Overall rating out of 5', 'Inspector\'s final notes', 'Result: Verified, Needs correction or Rejected'] },
];

const RESULTS = [
    {
        icon: CheckCircle2, title: 'Verified', tone: 'emerald',
        text: 'The vehicle, its documents and the seller checked out. The listing shows the MotorDesk Verified badge.',
    },
    {
        icon: AlertTriangle, title: 'Needs correction', tone: 'amber',
        text: 'Something must be fixed first — for example a missing document or wrong detail. The seller is told exactly what to correct.',
    },
    {
        icon: XCircle, title: 'Rejected', tone: 'red',
        text: 'The vehicle failed verification. The seller receives the reason, and the listing does not get the Verified badge.',
    },
];

const TONES = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    red: 'border-red-200 bg-red-50 text-red-700',
};

const FAQS = [
    {
        q: 'Who carries out the inspections?',
        a: 'Trained MotorDesk field inspectors. Our admin team assigns each inspection to an inspector, who visits the vehicle in person.',
    },
    {
        q: 'How do I get my vehicle inspected?',
        a: 'List your vehicle and choose "Verify Vehicle". Our team reviews it and can schedule a field inspection. You can also contact our support team to ask for one.',
    },
    {
        q: 'Where can sellers see the inspection?',
        a: 'In the Seller / Dealer dashboard under "Inspection Requests" — with the status, the assigned inspector and, once finished, the result and notes.',
    },
    {
        q: 'What does "Verified" mean for buyers?',
        a: 'It means our inspector checked the vehicle, its documents and the seller on the inspection date. We still recommend seeing the vehicle and checking the papers yourself before you pay.',
    },
    {
        q: 'What is an "Unverified" listing?',
        a: 'A listing the seller chose to publish straight away, without our review. It is clearly labelled so buyers can take extra care.',
    },
];

const SectionTitle = ({ eyebrow, title, text }) => (
    <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2d6cdf]">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        {text && <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">{text}</p>}
    </div>
);

const Faq = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-2xl border border-slate-200 bg-white">
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="text-sm font-semibold text-slate-900 sm:text-base">{q}</span>
                <ChevronDown size={18} className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <p className="px-5 pb-4 text-sm leading-6 text-slate-600">{a}</p>}
        </div>
    );
};

export const InspectionsInfoPage = () => {
    // open at the top (e.g. when coming from the footer link)
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

    return (
    <div className="bg-white text-slate-900">
        <Helmet>
            <title>How inspections work | VehicleHub by MotorDesk</title>
            <meta name="description" content="How MotorDesk field inspectors verify vehicles: seller, documents, identity, condition, test drive, location and photos — and what Verified means." />
        </Helmet>

        {/* Hero */}
        <section className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(45,108,223,0.12),_transparent_42%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)]">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
                        <ShieldCheck size={14} /> Field inspections
                    </span>
                    <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                        How vehicle <span className="text-emerald-600">inspections</span> work
                    </h1>
                    <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                        Before a listing earns the MotorDesk Verified badge, one of our field inspectors can visit the vehicle in person —
                        checking the seller, the documents and the vehicle itself against a detailed 10-step checklist.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link to="/search" className="inline-flex items-center gap-2 rounded-xl bg-[#001f3f] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:bg-[#002a55]">
                            Browse vehicles <ArrowRight size={16} />
                        </Link>
                        <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#001f3f] transition hover:border-[#001f3f]/30">
                            Ask about an inspection
                        </Link>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-xl shadow-slate-200/60 sm:p-8">
                    <p className="text-sm font-bold text-slate-900">An inspection covers</p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                        {[
                            [UserCheck, 'The seller'],
                            [FileText, 'Documents'],
                            [Fingerprint, 'Vehicle identity'],
                            [Car, 'Condition'],
                            [Gauge, 'Test drive'],
                            [MapPin, 'Location'],
                        ].map(([Icon, label]) => (
                            <div key={label} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><Icon size={16} /></span>
                                <span className="text-sm font-medium text-slate-700">{label}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-5 flex items-start gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-xs leading-5 text-emerald-800">
                        <BadgeCheck size={16} className="mt-0.5 shrink-0" />
                        Vehicles that pass are marked Verified, so buyers can see at a glance which listings were checked.
                    </p>
                </div>
            </div>
        </section>

        {/* Process */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16 lg:px-8">
            <SectionTitle eyebrow="The process" title="From listing to Verified, step by step" text="Every inspection moves through the same clear stages, so sellers always know where things stand." />
            <ol className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {STAGES.map(({ icon: Icon, title, status, text }, i) => (
                    <li key={title} className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#001f3f] text-white"><Icon size={19} /></span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">Step {i + 1} · {status}</span>
                        </div>
                        <h3 className="mt-4 font-bold">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                    </li>
                ))}
            </ol>
        </section>

        {/* What we check */}
        <section className="bg-slate-50 py-14 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 lg:px-8">
                <SectionTitle eyebrow="The checklist" title="What our inspectors check" text="The same 10 steps are followed on every visit. Each item is marked, with notes where needed." />
                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {CHECKS.map(({ icon: Icon, title, items }, i) => (
                        <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f2ff] text-[#001f3f]"><Icon size={18} /></span>
                                <span className="text-[11px] font-bold text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                            </div>
                            <h3 className="mt-3 text-sm font-bold">{title}</h3>
                            <ul className="mt-2 space-y-1.5">
                                {items.map((it) => (
                                    <li key={it} className="flex items-start gap-1.5 text-xs leading-5 text-slate-600">
                                        <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-600" /> {it}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Results */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16 lg:px-8">
            <SectionTitle eyebrow="The result" title="Three possible outcomes" text="Each inspection ends with one clear result. The seller and our admin team are notified straight away." />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
                {RESULTS.map(({ icon: Icon, title, text, tone }) => (
                    <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6">
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold ${TONES[tone]}`}>
                            <Icon size={16} /> {title}
                        </span>
                        <p className="mt-4 text-sm leading-6 text-slate-600">{text}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Buyers & sellers */}
        <section className="bg-gradient-to-b from-[#eef4ff] to-white py-14 sm:py-16">
            <div className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-2 lg:px-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-7">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6f2ff] text-[#001f3f]"><Search size={20} /></span>
                    <h3 className="mt-4 text-lg font-bold">For buyers</h3>
                    <ul className="mt-4 space-y-3 text-sm text-slate-600">
                        <li className="flex gap-2"><BadgeCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" /> Look for the Verified badge on vehicle cards.</li>
                        <li className="flex gap-2"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" /> Listings marked Unverified were not reviewed — take extra care.</li>
                        <li className="flex gap-2"><KeyRound size={16} className="mt-0.5 shrink-0 text-[#2d6cdf]" /> Always see the vehicle and check the RC before you pay.</li>
                    </ul>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-7">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Users size={20} /></span>
                    <h3 className="mt-4 text-lg font-bold">For sellers & dealers — be ready for the visit</h3>
                    <ul className="mt-4 space-y-3 text-sm text-slate-600">
                        <li className="flex gap-2"><FolderOpen size={16} className="mt-0.5 shrink-0 text-[#2d6cdf]" /> Keep the RC, insurance, PUC and ownership papers at hand.</li>
                        <li className="flex gap-2"><KeyRound size={16} className="mt-0.5 shrink-0 text-[#2d6cdf]" /> Have the keys ready so the engine and test drive can be checked.</li>
                        <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-[#2d6cdf]" /> Keep the vehicle at the location in your listing, and be present.</li>
                        <li className="flex gap-2"><ClipboardCheck size={16} className="mt-0.5 shrink-0 text-[#2d6cdf]" /> Follow the status under "Inspection Requests" in your dashboard.</li>
                    </ul>
                </div>
            </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-14 sm:py-16 lg:px-8">
            <SectionTitle eyebrow="FAQ" title="Common questions" />
            <div className="mt-8 space-y-3">
                {FAQS.map((f) => <Faq key={f.q} {...f} />)}
            </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-16 lg:px-8">
            <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-3xl border border-emerald-100 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_45%),linear-gradient(135deg,_#ecfdf5_0%,_#ffffff_65%)] p-7 sm:p-10 md:flex-row md:items-center">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight">Want your vehicle verified?</h2>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">List it on VehicleHub and choose "Verify Vehicle" — or talk to our team about an inspection.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link to="/seller-Register" className="inline-flex items-center gap-2 rounded-xl bg-[#001f3f] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:bg-[#002a55]">
                        Start selling <ArrowRight size={16} />
                    </Link>
                    <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#001f3f] transition hover:border-[#001f3f]/30">
                        Contact us
                    </Link>
                </div>
            </div>
        </section>
    </div>
    );
};

export default InspectionsInfoPage;