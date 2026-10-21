// VehicleHub/VehicleHub/src/pages/public/FaqPage.jsx
// Help center / FAQ (/faq) — light theme. Answers describe how VehicleHub actually works.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Search, ChevronDown, HelpCircle, ShoppingBag, Store, CreditCard, ShieldCheck, UserCircle2, Mail, Phone, ArrowRight, X,
} from 'lucide-react';
import { COMPANY_CONTACT } from '../../services/contactApiSlice.js';

const SECTIONS = [
    {
        id: 'general', title: 'General', icon: HelpCircle,
        items: [
            { q: 'What is VehicleHub?', a: 'VehicleHub is MotorDesk\'s online vehicle marketplace. Buyers can find cars, bikes, scooters, trucks, EVs, tractors and commercial vehicles listed by individual sellers and dealers.' },
            { q: 'Who runs VehicleHub?', a: 'VehicleHub is run by MotorDesk, based in Bengaluru, Karnataka.' },
            { q: 'Is VehicleHub the seller of the vehicles?', a: 'No. Vehicles are listed and sold by individual sellers and dealers. VehicleHub connects buyers and sellers, reviews accounts and listings, and can inspect vehicles — the sale itself is between the buyer and the seller.' },
            { q: 'How do I contact support?', a: `Email ${COMPANY_CONTACT.email}, call ${COMPANY_CONTACT.phone}, use the Contact Us page, or "Raise a Ticket" at the bottom of any page. We aim to reply within 24 hours.` },
        ],
    },
    {
        id: 'buying', title: 'Buying a vehicle', icon: ShoppingBag,
        items: [
            { q: 'Do I need an account to browse?', a: 'No. Anyone can browse and search vehicles. You need a free buyer account to save vehicles to your wishlist, see a seller\'s number or send a purchase request.' },
            { q: 'How do I buy a vehicle?', a: 'Open the vehicle and tap "Buy Now". Enter your offer price and details and send the purchase request. The seller is notified and can accept or decline. You can follow your requests under "My Orders" in your buyer dashboard.' },
            { q: 'Can I contact the seller directly?', a: 'Yes. Use "Contact Number" on the vehicle page, or — if the seller has added WhatsApp — continue on WhatsApp right after sending your purchase request, with a message already filled in.' },
            { q: 'Can I cancel a purchase request?', a: 'Yes, while it is still pending. Once a seller accepts it, the vehicle is marked as sold to you and you arrange the payment and paperwork with the seller.' },
            { q: 'Do I pay for the vehicle on VehicleHub?', a: 'No. Payment for the vehicle and the ownership transfer are arranged directly between you and the seller. Always see the vehicle and check the RC and other documents before you pay.' },
            { q: 'What do "Verified" and "Unverified" mean?', a: 'Verified listings were reviewed by our team and may have been inspected in person. Unverified listings were published by the seller without our review — they are clearly labelled so you can take extra care.' },
        ],
    },
    {
        id: 'selling', title: 'Selling & dealers', icon: Store,
        items: [
            { q: 'How do I start selling?', a: 'Go to "Sell" or the Seller Registration page, choose Seller (individual) or Dealer (shop / business), and fill in your details, PAN and address. Our admin team reviews your application, usually within 24 hours.' },
            { q: 'What is the difference between a Seller and a Dealer?', a: 'A Seller is an individual selling their own vehicle — one listing at a time. A Dealer runs a shop and can list and manage many vehicles from the dealer dashboard.' },
            { q: 'Can I use VehicleHub before my seller account is approved?', a: 'Yes — you can use the site as a buyer. The Seller / Dealer dashboard opens once an admin approves your application, and you will get a notification.' },
            { q: 'Should I choose "Verify Vehicle" or "Unverified Vehicle"?', a: '"Verify Vehicle" sends your listing to our team for review first; once approved it shows the Verified badge. "Unverified Vehicle" publishes it immediately, with an Unverified badge that buyers can see.' },
            { q: 'How do I receive buyer offers?', a: 'Buyers send purchase requests, which appear under "Purchase Requests" in your dashboard with a count of new ones. Accepting a request marks the vehicle as sold to that buyer and declines the others automatically.' },
            { q: 'Can buyers message me on WhatsApp?', a: 'Yes, if you add your WhatsApp number during registration or later in your profile. Buyers are then taken to WhatsApp with their offer details after sending a request.' },
        ],
    },
    {
        id: 'plans', title: 'Plans & payments', icon: CreditCard,
        items: [
            { q: 'How much does the Premium plan cost?', a: 'Premium is ₹500 per month in urban cities and ₹350 per month in rural areas. You can pay for 1, 3, 6 or 12 months at a time — see the Pricing page.' },
            { q: 'How do I pay?', a: 'On the Pricing page, choose your area and duration, fill in your shop and contact details, and pay securely through Razorpay (cards, UPI, net banking and other options Razorpay offers).' },
            { q: 'Will I get an invoice?', a: 'Yes. After the payment is confirmed, a PDF invoice is emailed to the address you entered in the payment form.' },
            { q: 'My payment failed or was cancelled. Was I charged?', a: 'A plan is only recorded after we confirm the payment with Razorpay. If money was deducted but you did not get a confirmation or invoice, contact support with your Razorpay payment ID.' },
            { q: 'Why can\'t I pay with my email or phone number?', a: 'If that email or number already belongs to a VehicleHub account, please sign in first and then buy the plan from the Pricing page.' },
        ],
    },
    {
        id: 'inspections', title: 'Inspections & verification', icon: ShieldCheck,
        items: [
            { q: 'What is a field inspection?', a: 'A MotorDesk field inspector visits the vehicle and checks the seller, the documents, the vehicle\'s identity and condition, a test drive and the location — then files a report.' },
            { q: 'What are the possible results?', a: 'Verified (the listing gets the Verified badge), Needs correction (the seller is told what to fix) or Rejected (the seller receives the reason).' },
            { q: 'Where can sellers follow an inspection?', a: 'Under "Inspection Requests" in the Seller / Dealer dashboard — with the status, inspector and result.' },
        ],
    },
    {
        id: 'account', title: 'Account & login', icon: UserCircle2,
        items: [
            { q: 'How do I sign in?', a: 'Use your email address or mobile number and your password on the Login page.' },
            { q: 'I forgot my password. What should I do?', a: 'Please contact our support team by email or phone and we will help you reset it.' },
            { q: 'Can I change my details?', a: 'Yes. Buyers can update their profile in the buyer dashboard; sellers and dealers can update their business profile, phone and WhatsApp number in the seller dashboard.' },
        ],
    },
];

const Item = ({ q, a, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className={`rounded-2xl border bg-white transition ${open ? 'border-[#001f3f]/20 shadow-sm' : 'border-slate-200'}`}>
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="text-sm font-semibold text-slate-900 sm:text-[15px]">{q}</span>
                <ChevronDown size={18} className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <p className="px-5 pb-4 text-sm leading-6 text-slate-600">{a}</p>}
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
                items: q ? s.items.filter((it) => `${it.q} ${it.a}`.toLowerCase().includes(q)) : s.items,
            })).filter((s) => s.items.length),
        [q],
    );
    const total = sections.reduce((n, s) => n + s.items.length, 0);

    return (
        <div className="bg-white text-slate-900">
            <Helmet>
                <title>Help Center & FAQ | VehicleHub by MotorDesk</title>
                <meta name="description" content="Answers to common questions about buying, selling, dealer plans, payments, inspections and your VehicleHub account." />
            </Helmet>

            {/* Hero + search */}
            <section className="bg-[radial-gradient(circle_at_top_left,_rgba(45,108,223,0.14),_transparent_45%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)]">
                <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:py-20 lg:px-8">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2d6cdf]">Help center</p>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">How can we help?</h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                        Answers to the most common questions about buying, selling, plans and inspections on VehicleHub.
                    </p>
                    <div className="relative mx-auto mt-8 max-w-xl">
                        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search questions, e.g. invoice, WhatsApp, inspection"
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
            <section className="mx-auto max-w-3xl px-4 py-12 sm:py-14 lg:px-8">
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