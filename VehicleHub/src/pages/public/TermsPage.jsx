// VehicleHub/VehicleHub/src/pages/public/TermsPage.jsx
// Terms & Conditions (/terms) — light theme. Content from "The Motor Desk" Terms & Conditions document.
// Each section has an optional intro, then either numbered points ({ label, text }) or bullet points.
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileText, Mail, Phone, MapPin, Building2, ShieldAlert } from 'lucide-react';
import { COMPANY_CONTACT } from '../../services/contactApiSlice.js';

const LAST_UPDATED = 'October 2026';

const SECTIONS = [
    {
        id: 'scope', title: 'Platform Nature & Scope of Service',
        numbered: [
            { label: 'Intermediary Role:', text: 'The Motor Desk is strictly an online classified and inventory discovery platform (intermediary as defined under Section 79 of the Information Technology Act, 2000).' },
            { label: 'Non-Party to Deals:', text: 'The Motor Desk is not an automobile dealer, broker, insurer, escrow agent, or financial institution. We do not own, buy, sell, trade, inspect physical mechanics, guarantee title purity, or take custody of any listed vehicle.' },
            { label: 'Contracts:', text: 'Any contract, agreement, sale deed, token transfer, or financial transaction is strictly and solely between the Buyer and the Seller / Dealer.' },
        ],
    },
    {
        id: 'accounts', title: 'User Accounts & Listing Eligibility',
        numbered: [
            { label: 'Eligibility:', text: 'You must be at least 18 years of age and legally competent to enter into binding contracts.' },
            { label: 'Individual Sellers:', text: 'Private individuals may only list vehicles registered legally under their own name, or must have written legal authorization/power of attorney from the registered owner.' },
            { label: 'Dealers:', text: 'Automotive dealerships must provide valid business identification (e.g., GST certificate, Trade License, or Shop & Establishment registration).' },
        ],
    },
    {
        id: 'membership', title: 'Annual Membership & Payment Terms',
        numbered: [
            { label: 'Subscription Model:', text: 'Access to list vehicles, receive buyer leads, and maintain an active dealer storefront is provided under an Annual Membership Plan.' },
            { label: 'Zero Commission:', text: 'The Motor Desk does not charge any percentage-based sales commission upon the completion of a vehicle sale.' },
            { label: 'Renewals & Expiry:', text: 'Memberships are valid for 365 days from the date of activation. Failure to renew will result in automatic de-listing of inventory and removal of active verified badges.' },
            { label: 'No Refunds:', text: 'Membership fees are strictly non-refundable and non-transferable once the account or listing has been activated and verified.' },
        ],
    },
    {
        id: 'verification', title: 'Vehicle Verification Policy & Disclaimers',
        numbered: [
            { label: 'Scope of Verification:', text: 'The "Verified" badge indicates only that The Motor Desk has reviewed digital copies of documents (such as Registration Certificate, Seller Identity, and basic chassis/RTO records) to reduce fraudulent listings.' },
            { label: 'No Technical Warranty:', text: 'Verification DOES NOT constitute an endorsement, mechanical health report, roadworthiness certificate, or odometer rollback guarantee.' },
            { label: 'Buyer Due Diligence:', text: 'The Buyer assumes 100% responsibility for physically inspecting the vehicle, hiring an independent mechanic, verifying hypothecation status (bank loans), checking pending traffic challans, and ensuring clean ownership transfer at the respective Regional Transport Office (RTO).' },
        ],
    },
    {
        id: 'obligations', title: 'Seller & Dealer Obligations',
        intro: 'When listing a vehicle on The Motor Desk, you warrant and agree that:',
        bullets: [
            'All uploaded photographs reflect the actual, current condition of the vehicle without deceptive editing.',
            'The vehicle is free from undisclosed total loss claims, major accidental structural rebuilds, stolen property claims, or ongoing police litigation.',
            'You will provide legitimate RC, Insurance, and Identity details upon request.',
            'You will promptly mark the listing as "Sold" or remove it once the vehicle is no longer available.',
            'You will not post misleading prices, duplicate listings, or unauthorized promotional links.',
        ],
    },
    {
        id: 'prohibited', title: 'Prohibited Activities',
        intro: 'Users must not:',
        bullets: [
            'List stolen, illegal, scrap, or blacklisted vehicles.',
            'Misrepresent vehicle mileage, model year, number of previous owners, or variant specifications.',
            'Harass, spam, defraud, or solicit buyers outside the legitimate scope of automobile transactions.',
            'Scrape, reverse-engineer, or systematically harvest platform listings or user contact numbers.',
        ],
    },
    {
        id: 'liability', title: 'Limitation of Liability',
        intro: 'To the maximum extent permitted by applicable Indian law:',
        bullets: [
            'The Motor Desk, its directors, officers, and employees shall not be liable for any direct, indirect, punitive, or consequential damages resulting from transactions conducted between users.',
            'We bear no liability for cash scams, online advance payment frauds, dishonored cheques, defective vehicles, non-transfer of RC by buyers, or undisclosed vehicle defects.',
            'All listings and services are provided strictly on an "As Is" and "As Available" basis.',
        ],
    },
    {
        id: 'termination', title: 'Termination & Suspension',
        intro: 'The Motor Desk reserves the right to suspend, deactivate, or permanently ban any individual seller or dealer account without refund if:',
        bullets: [
            'Fraudulent, stolen, or forged vehicle papers are submitted.',
            'Multiple user complaints or unresolved disputes are lodged against the account.',
            'Any violation of these Terms or applicable local laws occurs.',
        ],
    },
    {
        id: 'law', title: 'Governing Law & Dispute Resolution',
        paragraphs: [
            'These Terms are governed by and construed in accordance with the laws of India. Any legal dispute, claim, or controversy arising out of or related to platform usage shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.',
        ],
    },
];

const Dot = () => <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2d6cdf]" />;

export const TermsPage = () => (
    <div className="bg-white text-slate-900">
        <Helmet>
            <title>Terms & Conditions | The Motor Desk</title>
            <meta name="description" content="Terms and Conditions for using The Motor Desk vehicle marketplace." />
        </Helmet>

        <section className="bg-[radial-gradient(circle_at_top_left,_rgba(45,108,223,0.12),_transparent_45%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)]">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16 lg:px-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#001f3f]/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#001f3f] shadow-sm">
                    <FileText size={14} className="text-[#2d6cdf]" /> Legal
                </span>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Terms & Conditions</h1>
                <p className="mt-2 text-xs font-medium text-slate-500">Last Updated: {LAST_UPDATED}</p>
                <p className="mt-4 max-w-5xl text-sm leading-7 text-slate-600 sm:text-base">
                    Welcome to <strong className="text-slate-900">The Motor Desk</strong>. By accessing or using our website, mobile application, or any associated
                    platform services (collectively, the <strong className="text-slate-900">&quot;Platform&quot;</strong>), you agree to comply with and be bound by the
                    following Terms and Conditions (<strong className="text-slate-900">&quot;Terms&quot;</strong>). Please read them carefully before creating an account
                    or posting a listing.
                </p>
            </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[230px_1fr] lg:px-8">
            {/* Contents */}
            <nav aria-label="Contents" className="hidden lg:block">
                <div className="sticky top-36 rounded-2xl border border-slate-200 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Contents</p>
                    <ol className="space-y-2 text-sm">
                        {[...SECTIONS, { id: 'grievance', title: 'Contact & Grievance Officer' }].map((s, i) => (
                            <li key={s.id}>
                                <a href={`#${s.id}`} className="flex gap-2 text-slate-600 hover:text-[#001f3f]">
                                    <span className="w-5 shrink-0 text-slate-400">{i + 1}.</span> {s.title}
                                </a>
                            </li>
                        ))}
                    </ol>
                </div>
            </nav>

            <article className="space-y-9">
                {SECTIONS.map((s, i) => (
                    <section key={s.id} id={s.id} className="scroll-mt-36">
                        <h2 className="flex items-baseline gap-3 text-lg font-bold text-slate-900 sm:text-xl">
                            <span className="text-sm font-bold text-[#2d6cdf]">{i + 1}.</span> {s.title}
                        </h2>

                        {s.paragraphs?.map((p) => (
                            <p key={p.slice(0, 40)} className="mt-3 text-sm leading-7 text-slate-600 sm:text-[15px]">{p}</p>
                        ))}
                        {s.intro && <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-[15px]">{s.intro}</p>}

                        {s.numbered && (
                            <ol className="mt-3 space-y-3">
                                {s.numbered.map((n, j) => (
                                    <li key={n.label} className="flex gap-3 text-sm leading-7 text-slate-600 sm:text-[15px]">
                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e6f2ff] text-xs font-bold text-[#001f3f]">{j + 1}</span>
                                        <span><strong className="font-semibold text-slate-900">{n.label}</strong> {n.text}</span>
                                    </li>
                                ))}
                            </ol>
                        )}

                        {s.bullets && (
                            <ul className="mt-3 space-y-2.5">
                                {s.bullets.map((li) => (
                                    <li key={li.slice(0, 40)} className="flex gap-3 text-sm leading-7 text-slate-600 sm:text-[15px]">
                                        <Dot /> <span>{li}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                    </section>
                ))}

                {/* 10. Contact & Grievance Officer */}
                <section id="grievance" className="scroll-mt-36 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
                    <h2 className="flex items-baseline gap-3 text-lg font-bold sm:text-xl">
                        <span className="text-sm font-bold text-[#2d6cdf]">{SECTIONS.length + 1}.</span> Contact & Grievance Officer
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                        In accordance with the Information Technology Act, 2000 and consumer protection guidelines, questions or platform grievances may be submitted to:
                    </p>
                    <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                        <p className="flex items-start gap-2.5"><Building2 size={15} className="mt-0.5 shrink-0 text-[#2d6cdf]" /> <span><strong className="font-semibold">Platform Name:</strong> The Motor Desk</span></p>
                        <p className="flex items-start gap-2.5"><ShieldAlert size={15} className="mt-0.5 shrink-0 text-[#2d6cdf]" /> <span><strong className="font-semibold">Grievance Officer:</strong> Grievance Cell, The Motor Desk</span></p>
                        <a href={`mailto:${COMPANY_CONTACT.email}`} className="flex items-start gap-2.5 hover:text-[#001f3f]"><Mail size={15} className="mt-0.5 shrink-0 text-[#2d6cdf]" /> <span><strong className="font-semibold">Email:</strong> {COMPANY_CONTACT.email}</span></a>
                        <a href={COMPANY_CONTACT.phoneHref} className="flex items-start gap-2.5 hover:text-[#001f3f]"><Phone size={15} className="mt-0.5 shrink-0 text-[#2d6cdf]" /> <span><strong className="font-semibold">Phone:</strong> {COMPANY_CONTACT.phone}</span></a>
                        <p className="flex items-start gap-2.5 sm:col-span-2"><MapPin size={15} className="mt-0.5 shrink-0 text-[#2d6cdf]" /> <span><strong className="font-semibold">Address:</strong> {COMPANY_CONTACT.address}</span></p>
                    </div>
                    <p className="mt-5 text-xs text-slate-500">See also our <Link to="/faq" className="font-semibold text-[#001f3f] hover:underline">Frequently Asked Questions</Link>.</p>
                </section>
            </article>
        </div>
    </div>
);