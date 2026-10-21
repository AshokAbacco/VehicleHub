// VehicleHub/VehicleHub/src/pages/public/AboutPage.jsx
// About Us (/about) — light theme only.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    ShieldCheck, Search, Store, Car, ClipboardCheck, BadgeCheck, MessageCircle, CreditCard,
    FileCheck2, Eye, HeartHandshake, MapPin, Sparkles, ArrowRight, Mail, Phone, Users, CheckCircle2,
} from 'lucide-react';
import { COMPANY_CONTACT } from '../../services/contactApiSlice.js';

const AUDIENCES = [
    {
        icon: Search,
        title: 'Buyers',
        text: 'Browse cars, bikes, scooters, trucks, EVs and commercial vehicles. Compare listings, save favourites, and send a purchase request with your own offer.',
        points: ['Filter by type, brand, budget and fuel', 'Clear Verified / Unverified labels', 'Contact sellers directly'],
        cta: { to: '/search', label: 'Browse vehicles' },
    },
    {
        icon: Car,
        title: 'Individual Sellers',
        text: 'Selling your own vehicle? Register once, add your vehicle with photos and documents, and reach serious buyers without middlemen.',
        points: ['Simple step-by-step listing form', 'Purchase requests with alerts', 'Buyer enquiries on WhatsApp'],
        cta: { to: '/seller-Register', label: 'Register as a seller' },
    },
    {
        icon: Store,
        title: 'Dealers & Shops',
        text: 'Run a vehicle shop? Manage your whole inventory from one dealer dashboard and grow with the Premium plan for urban and rural businesses.',
        points: ['List and manage many vehicles', 'Dealer dashboard and sales tracking', 'Premium plans from ₹350/month'],
        cta: { to: '/pricing', label: 'See pricing' },
    },
];

const STEPS = [
    { icon: Users, title: 'Register', text: 'Sellers and dealers sign up with their business details. Our team reviews every application before selling access is switched on.' },
    { icon: Car, title: 'List the vehicle', text: 'Add photos, price, condition, RC and insurance details. Choose to send it for verification, or publish right away as unverified.' },
    { icon: ClipboardCheck, title: 'Verification', text: 'Our admin team reviews listings, and field inspectors can check the vehicle in person — so Verified really means verified.' },
    { icon: HeartHandshake, title: 'Connect & close', text: 'Buyers send purchase requests or message the seller on WhatsApp. The seller accepts the best offer and completes the sale.' },
];

const TRUST = [
    { icon: BadgeCheck, title: 'Verified listings', text: 'Listings reviewed by our team carry the MotorDesk Verified badge.' },
    { icon: Eye, title: 'Honest labels', text: 'Listings published without review are clearly marked Unverified, so buyers always know.' },
    { icon: ClipboardCheck, title: 'Field inspections', text: 'Inspectors visit, check the vehicle and its documents, and file a report.' },
    { icon: FileCheck2, title: 'Document checks', text: 'RC, insurance and other papers are collected with every listing.' },
    { icon: CreditCard, title: 'Secure payments', text: 'Plan payments go through Razorpay and are confirmed on our server before anything is recorded.' },
    { icon: MessageCircle, title: 'Direct contact', text: 'Buyers reach sellers directly — by purchase request, phone or WhatsApp.' },
];

const VALUES = [
    { title: 'Transparency', text: 'Clear prices, clear labels and no hidden charges on plans.' },
    { title: 'Trust', text: 'People and listings are reviewed before they get the badge.' },
    { title: 'Local first', text: 'Built for dealers and sellers in cities, towns and villages across India.' },
    { title: 'Simplicity', text: 'Easy forms and dashboards that work just as well on a phone.' },
];

const SectionTitle = ({ eyebrow, title, text, center = true }) => (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2d6cdf]">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        {text && <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">{text}</p>}
    </div>
);

export const AboutPage = () => {
    // open at the top (e.g. when coming from the footer link)
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

    return (
    <div className="bg-white text-slate-900">
        <Helmet>
            <title>About Us | VehicleHub by MotorDesk</title>
            <meta name="description" content="VehicleHub by MotorDesk is a vehicle marketplace connecting buyers with verified sellers and dealers across India." />
        </Helmet>

        {/* Hero */}
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(45,108,223,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.10),_transparent_40%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)]">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#001f3f]/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#001f3f] shadow-sm">
                        <Sparkles size={14} className="text-[#2d6cdf]" /> About MotorDesk
                    </span>
                    <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                        Buying and selling vehicles, <span className="text-[#2d6cdf]">made trustworthy.</span>
                    </h1>
                    <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                        VehicleHub is MotorDesk&apos;s vehicle marketplace. We bring buyers, individual sellers and dealers together on one
                        simple platform — with verified listings, field inspections and direct contact, so every deal starts with confidence.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link to="/search" className="inline-flex items-center gap-2 rounded-xl bg-[#001f3f] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:bg-[#002a55]">
                            Browse vehicles <ArrowRight size={16} />
                        </Link>
                        <Link to="/seller-Register" className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#001f3f] transition hover:border-[#001f3f]/30">
                            Start selling
                        </Link>
                    </div>
                </div>

                {/* Highlights card */}
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8">
                    <p className="text-sm font-bold text-slate-900">What you get with VehicleHub</p>
                    <ul className="mt-5 space-y-4">
                        {[
                            ['Every kind of vehicle', 'Cars, bikes, scooters, trucks, EVs, tractors and commercial vehicles.'],
                            ['Verified sellers', 'Seller and dealer accounts are approved by our team.'],
                            ['Inspected listings', 'Field inspectors can check vehicles and documents in person.'],
                            ['Fair plans for dealers', 'Premium from ₹500/month in cities and ₹350/month in rural areas.'],
                        ].map(([t, d]) => (
                            <li key={t} className="flex gap-3">
                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                    <CheckCircle2 size={15} />
                                </span>
                                <span>
                                    <span className="block text-sm font-semibold text-slate-900">{t}</span>
                                    <span className="block text-sm text-slate-500">{d}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>

        {/* Mission */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#e6f2ff] to-white p-7">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#001f3f] text-white"><ShieldCheck size={20} /></span>
                    <h3 className="mt-4 text-lg font-bold">Our mission</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        To make every vehicle deal in India transparent and safe — by checking who is selling, what is being sold,
                        and giving buyers the information they need before they pay.
                    </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-7">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white"><MapPin size={20} /></span>
                    <h3 className="mt-4 text-lg font-bold">Who we are</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        MotorDesk is based in Bengaluru. We build tools for vehicle sellers and dealers — from a one-car owner to a
                        busy multi-vehicle shop — and a marketplace where buyers can find them.
                    </p>
                </div>
            </div>
        </section>

        {/* Who it's for */}
        <section className="bg-slate-50 py-14 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 lg:px-8">
                <SectionTitle eyebrow="Built for everyone" title="One marketplace, three ways to use it" text="Whether you are buying your next vehicle or selling a whole showroom, VehicleHub has a place for you." />
                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {AUDIENCES.map(({ icon: Icon, title, text, points, cta }) => (
                        <div key={title} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6f2ff] text-[#001f3f]"><Icon size={20} /></span>
                            <h3 className="mt-4 text-lg font-bold">{title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                            <ul className="mt-4 space-y-2">
                                {points.map((p) => (
                                    <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" /> {p}
                                    </li>
                                ))}
                            </ul>
                            <Link to={cta.to} className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#2d6cdf] hover:underline">
                                {cta.label} <ArrowRight size={15} />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16 lg:px-8">
            <SectionTitle eyebrow="How it works" title="From listing to handshake" text="A clear process that keeps both sides informed at every step." />
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {STEPS.map(({ icon: Icon, title, text }, i) => (
                    <li key={title} className="relative rounded-3xl border border-slate-200 bg-white p-6">
                        <span className="absolute right-5 top-5 text-3xl font-black text-slate-100">0{i + 1}</span>
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#001f3f] text-white"><Icon size={19} /></span>
                        <h3 className="mt-4 font-bold">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                    </li>
                ))}
            </ol>
        </section>

        {/* Trust & safety */}
        <section className="bg-gradient-to-b from-[#eef4ff] to-white py-14 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 lg:px-8">
                <SectionTitle eyebrow="Trust & safety" title="Why people trust VehicleHub" text="Safety is built into the platform, not added as an afterthought." />
                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {TRUST.map(({ icon: Icon, title, text }) => (
                        <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Icon size={19} /></span>
                            <div>
                                <h3 className="text-sm font-bold">{title}</h3>
                                <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16 lg:px-8">
            <SectionTitle eyebrow="Our values" title="What we stand for" />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {VALUES.map(({ title, text }) => (
                    <div key={title} className="rounded-2xl border border-slate-200 p-5 text-center">
                        <p className="text-base font-bold text-[#001f3f]">{title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Contact / CTA (light) */}
        <section className="px-4 pb-16 lg:px-8">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#001f3f]/10 bg-[radial-gradient(circle_at_top_right,_rgba(45,108,223,0.16),_transparent_45%),linear-gradient(135deg,_#e6f2ff_0%,_#ffffff_60%)] p-7 sm:p-10">
                <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Let&apos;s talk</h2>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
                            Questions about buying, selling, dealer plans or inspections? Our team is happy to help — we reply within 24 hours.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-[#001f3f] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:bg-[#002a55]">
                                Contact us <ArrowRight size={16} />
                            </Link>
                            <Link to="/pricing" className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#001f3f] transition hover:border-[#001f3f]/30">
                                View dealer plans
                            </Link>
                        </div>
                    </div>
                    <div className="space-y-3 rounded-2xl bg-white/80 p-5 shadow-sm">
                        <a href={`mailto:${COMPANY_CONTACT.email}`} className="flex items-center gap-3 text-sm text-slate-700 hover:text-[#001f3f]">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e6f2ff] text-[#001f3f]"><Mail size={16} /></span>
                            <span className="break-all">{COMPANY_CONTACT.email}</span>
                        </a>
                        <a href={COMPANY_CONTACT.phoneHref} className="flex items-center gap-3 text-sm text-slate-700 hover:text-[#001f3f]">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e6f2ff] text-[#001f3f]"><Phone size={16} /></span>
                            {COMPANY_CONTACT.phone}
                        </a>
                        <p className="flex items-start gap-3 text-sm text-slate-700">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e6f2ff] text-[#001f3f]"><MapPin size={16} /></span>
                            <span className="leading-6">{COMPANY_CONTACT.address}</span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>
    );
};