// VehicleHub/VehicleHub/src/pages/public/FaqPage.jsx
// Help center / FAQ (/faq) — light theme. Content from "The Motor Desk" FAQ document.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Search, ChevronDown, HelpCircle, ShoppingBag, Store, Mail, Phone, ArrowRight, X,
} from 'lucide-react';
import { COMPANY_CONTACT } from '../../services/contactApiSlice.js';

// Content from "The Motor Desk" FAQ document. An answer is { a } text, with an optional
// { list } of bullet points and an optional { note } shown in italics.
const SECTIONS = [
    {
        id: 'general', title: 'General Questions', icon: HelpCircle,
        items: [
            {
                q: 'What is The Motor Desk?',
                a: 'The Motor Desk is an online marketplace connecting individual sellers, certified pre-owned dealers, and vehicle buyers across India. We provide a trusted digital space where individuals and dealerships can showcase second-hand cars and two-wheelers directly to verified buyers.',
            },
            {
                q: 'Does The Motor Desk buy or sell vehicles directly?',
                a: 'No. The Motor Desk acts solely as a discovery and listing facilitator. We do not own, purchase, inspect on-site, or hold inventory. All transactions, negotiations, ownership transfers (RTO paperwork), and payments happen directly between the buyer and the seller/dealer.',
            },
            {
                q: 'What does "Verified Profile / Verified Vehicle" mean?',
                a: 'When a vehicle or seller shows a Verified badge, it means our operations team has reviewed the submitted documentation—such as registration certificate (RC) details, government ID verification of the seller/dealership, and primary chassis/engine details—against public records/database checks to confirm authenticity.',
                note: 'Verification does not guarantee mechanical condition; buyers must conduct their own technical inspection.',
            },
        ],
    },
    {
        id: 'sellers', title: 'For Individual Sellers & Dealers', icon: Store,
        items: [
            {
                q: 'Who can list vehicles on The Motor Desk?',
                list: [
                    ['Individual Owners:', 'Private vehicle owners looking to sell their personal car or bike directly.'],
                    ['Auto Dealerships:', 'Certified multi-brand second-hand car and bike dealers who want to manage an inventory showcase online.'],
                ],
            },
            {
                q: 'How much does it cost to list a vehicle?',
                a: 'The Motor Desk operates on an Annual Membership Model.',
                list: [
                    'We do not take transaction cuts or commissions on individual vehicle sales.',
                    'Members pay an annual subscription fee based on their chosen tier (Individual Seller Tier or Dealer Multi-Listing Tier), granting listing slots, badge verification privileges, and customer inquiries for a full 365 days.',
                ],
            },
            {
                q: 'What documents are needed to get the "Verified" badge?',
                a: 'To receive the Verified status, you must upload:',
                list: [
                    'High-resolution exterior & interior photos.',
                    'A clear copy of the RC (Registration Certificate).',
                    'Valid Insurance Certificate and PUC.',
                    'Seller ID proof (Aadhaar / Voter ID / Driving License) or Trade License / GSTIN (for Commercial Dealers).',
                ],
            },
            {
                q: 'How long does the verification process take?',
                a: 'Once you submit your vehicle photos and documents, our team typically verifies the profile within 24 to 48 business hours.',
            },
        ],
    },
    {
        id: 'buyers', title: 'For Buyers', icon: ShoppingBag,
        items: [
            {
                q: 'How do I contact a seller or dealer?',
                a: 'Click on any vehicle listing to view the seller\'s contact details, send a direct WhatsApp/Call inquiry, or schedule an in-person test drive.',
            },
            {
                q: 'Can I pay for the vehicle through The Motor Desk?',
                a: 'No. We do not handle vehicle purchase payments or escrow services. You negotiate, pay, and finalize the purchase directly with the private seller or dealer.',
            },
            {
                q: 'What precautions should I take before buying?',
                list: [
                    'Always inspect the vehicle in person during daylight.',
                    'Bring a trusted mechanic to evaluate the engine, suspension, and chassis condition.',
                    'Verify original paperwork (RC, active insurance, NOC if moving RTO, tax receipts, loan hypothecation clearance/Form 35).',
                    'Avoid transferring advance tokens without physically meeting the seller and verifying document ownership.',
                ],
            },
        ],
    },
];

const itemText = (it) =>
    [it.q, it.a, it.note, ...(it.list || []).map((l) => (Array.isArray(l) ? l.join(' ') : l))].filter(Boolean).join(' ');

const Item = ({ q, a, list, note, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className={`rounded-2xl border bg-white transition ${open ? 'border-[#001f3f]/20 shadow-sm' : 'border-slate-200'}`}>
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="text-sm font-semibold text-slate-900 sm:text-[15px]">{q}</span>
                <ChevronDown size={18} className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="px-5 pb-4 text-sm leading-6 text-slate-600">
                    {a && <p>{a}</p>}
                    {list && (
                        <ul className={`${a ? 'mt-2' : ''} space-y-1.5`}>
                            {list.map((l) => (
                                <li key={Array.isArray(l) ? l[0] : l} className="flex gap-2.5">
                                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2d6cdf]" />
                                    <span>{Array.isArray(l) ? <><strong className="font-semibold text-slate-800">{l[0]}</strong> {l[1]}</> : l}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {note && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs italic text-amber-800">Note: {note}</p>}
                </div>
            )}
        </div>
    );
};

export const FaqPage = () => {
    const [query, setQuery] = useState('');
    const q = query.trim().toLowerCase();

    const sections = useMemo(
        () =>
            SECTIONS.map((s) => ({
                ...s,
                items: q ? s.items.filter((it) => itemText(it).toLowerCase().includes(q)) : s.items,
            })).filter((s) => s.items.length),
        [q],
    );
    const total = sections.reduce((n, s) => n + s.items.length, 0);

    return (
        <div className="bg-white text-slate-900">
            <Helmet>
                <title>Frequently Asked Questions | The Motor Desk</title>
                <meta name="description" content="Answers to common questions about The Motor Desk for buyers, individual sellers and dealers." />
            </Helmet>

            {/* Hero + search */}
            <section className="bg-[radial-gradient(circle_at_top_left,_rgba(45,108,223,0.14),_transparent_45%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)]">
                <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:py-20 lg:px-8">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2d6cdf]">Help center</p>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">How can we help?</h1>
                    <p className="mx-auto mt-4 max-w-7xl text-sm leading-6 text-slate-600 sm:text-base">
                        Frequently asked questions about The Motor Desk — for buyers, individual sellers and dealers.
                    </p>
                    <div className="relative mx-auto mt-8 max-w-xl">
                        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search questions, e.g. verified, documents, payment"
                            aria-label="Search the FAQ"
                            className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#001f3f]"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-700">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    {/* Topic shortcuts */}
                    {!q && (
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            {SECTIONS.map(({ id, title, icon: Icon }) => (
                                <a key={id} href={`#${id}`} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#001f3f]/30 hover:text-[#001f3f]">
                                    <Icon size={14} /> {title}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Questions */}
            <section className="mx-auto max-w-5xl px-4 py-12 sm:py-14 lg:px-8">
                {q && <p className="mb-6 text-sm text-slate-500">{total} result{total === 1 ? '' : 's'} for “{query.trim()}”</p>}
                {sections.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
                        <p className="font-semibold text-slate-900">No answers found</p>
                        <p className="mt-1 text-sm text-slate-500">Try other words, or ask our team directly.</p>
                        <Link to="/contact" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#001f3f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#002a55]">Contact us <ArrowRight size={15} /></Link>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {sections.map(({ id, title, icon: Icon, items }) => (
                            <div key={id} id={id} className="scroll-mt-40">
                                <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f2ff] text-[#001f3f]"><Icon size={17} /></span>
                                    {title}
                                </h2>
                                <div className="space-y-3">
                                    {/* searching -> matching answers open by themselves */}
                                    {items.map((it) => <Item key={`${it.q}|${q ? 'search' : 'all'}`} {...it} defaultOpen={Boolean(q)} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Still need help */}
            <section className="px-4 pb-16 lg:px-8">
                <div className="mx-auto grid max-w-3xl gap-6 rounded-3xl border border-[#001f3f]/10 bg-[linear-gradient(135deg,_#e6f2ff_0%,_#ffffff_65%)] p-7 sm:grid-cols-[1fr_auto] sm:items-center sm:p-9">
                    <div>
                        <h2 className="text-xl font-extrabold">Still need help?</h2>
                        <p className="mt-2 text-sm text-slate-600">Our support team replies within 24 hours.</p>
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-700">
                            <a href={`mailto:${COMPANY_CONTACT.email}`} className="inline-flex items-center gap-1.5 hover:text-[#001f3f]"><Mail size={15} /> {COMPANY_CONTACT.email}</a>
                            <a href={COMPANY_CONTACT.phoneHref} className="inline-flex items-center gap-1.5 hover:text-[#001f3f]"><Phone size={15} /> {COMPANY_CONTACT.phone}</a>
                        </div>
                    </div>
                    <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#001f3f] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 hover:bg-[#002a55]">
                        Contact us <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </div>
    );
};