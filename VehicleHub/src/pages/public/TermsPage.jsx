// VehicleHub/VehicleHub/src/pages/public/TermsPage.jsx
// Terms & Conditions (/terms) — light theme. Written for how VehicleHub works today.
// Have it reviewed by a legal professional before relying on it.
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileText, Mail, Phone, MapPin } from 'lucide-react';
import { COMPANY_CONTACT } from '../../services/contactApiSlice.js';

const LAST_UPDATED = '21 October 2026';

const SECTIONS = [
    {
        id: 'acceptance', title: 'About these terms',
        body: [
            'These Terms & Conditions ("Terms") apply to your use of VehicleHub, the online vehicle marketplace operated by MotorDesk ("MotorDesk", "we", "us"), including the website, buyer, seller, dealer and inspector dashboards and related services (together, the "Platform").',
            'By creating an account, listing a vehicle, sending a purchase request, buying a plan or otherwise using the Platform, you agree to these Terms. If you do not agree, please do not use the Platform.',
        ],
    },
    {
        id: 'service', title: 'What VehicleHub does',
        body: [
            'VehicleHub is a marketplace that lets individual sellers and dealers list vehicles and lets buyers discover them, send purchase requests and contact sellers.',
            'MotorDesk is not the owner or seller of any vehicle listed by users, and is not a party to the sale between a buyer and a seller. The price, payment, delivery, documents and transfer of ownership of a vehicle are agreed and completed directly between the buyer and the seller.',
        ],
    },
    {
        id: 'accounts', title: 'Accounts',
        list: [
            'You must be at least 18 years old and able to enter into a binding contract to create an account.',
            'The information you give us (name, email, phone number, business and identity details) must be true, complete and kept up to date.',
            'You are responsible for keeping your password secret and for all activity on your account. Tell us straight away if you think your account has been misused.',
            'One person or business should not hold more than one account of the same type without our permission.',
        ],
    },
    {
        id: 'sellers', title: 'Sellers and dealers',
        list: [
            'Seller and dealer accounts are reviewed by our team. Selling features are available only after your application is approved, and we may decline or withdraw approval.',
            'An individual Seller account may have one active listing at a time; a Dealer account may list multiple vehicles.',
            'You must own the vehicle you list or be authorised by the owner to sell it, and the vehicle must be legally saleable.',
            'Listing details — including price, condition, kilometres driven, ownership, accident history, RC, insurance and other documents and photos — must be accurate and must not mislead buyers.',
            'You must respond honestly to purchase requests and enquiries, and mark a vehicle as sold once it is sold.',
        ],
    },
    {
        id: 'listings', title: 'Listings, verification and inspections',
        list: [
            '"Verify Vehicle" listings are reviewed by our team before they are published. "Unverified Vehicle" listings are published immediately by the seller without our review and are labelled "Unverified".',
            'A "Verified" badge means our team reviewed the listing and, where a field inspection took place, that our inspector checked the vehicle, its documents and the seller on the inspection date. It is not a warranty or guarantee of the vehicle\'s condition, history or future performance.',
            'Inspection results (Verified, Needs correction or Rejected) reflect the inspector\'s findings at the time of the visit.',
            'We may edit, refuse, hide or remove any listing, or ask for more information, if we believe it breaks these Terms or the law.',
        ],
    },
    {
        id: 'buyers', title: 'Buyers',
        list: [
            'A purchase request is an offer to the seller. It becomes an agreement to buy only when the seller accepts it, and the sale is completed directly with the seller.',
            'You are responsible for seeing the vehicle, checking its documents (including the RC and insurance) and satisfying yourself before you pay.',
            'Do not send money for a vehicle you have not seen, and be careful of anyone asking for advance payments outside a proper sale.',
        ],
    },
    {
        id: 'plans', title: 'Plans, payments and invoices',
        list: [
            'Premium plans are priced per month and paid in advance for the selected duration (1, 3, 6 or 12 months). Prices are shown in Indian Rupees on the Pricing page and may change for future purchases.',
            'Payments are processed by Razorpay. A plan is recorded only after the payment is confirmed. We do not store your card or bank details.',
            'An invoice is emailed to the address given in the payment form after a successful payment.',
            'If a payment is deducted but not confirmed, or for any question about refunds, contact our support team with your payment ID. Any approved refund is made to the original payment method.',
            'Buying a plan does not by itself approve a seller or dealer account; your registration is still reviewed by our team.',
        ],
    },
    {
        id: 'conduct', title: 'Things you must not do',
        list: [
            'List stolen, illegally modified or otherwise unlawful vehicles, or vehicles you are not authorised to sell.',
            'Post false, misleading or duplicate listings, fake reviews or someone else\'s photos without permission.',
            'Harass, threaten or defraud other users, or use the Platform to send spam.',
            'Try to access accounts or data that are not yours, interfere with the Platform\'s security, or copy content from the Platform in bulk.',
        ],
    },
    {
        id: 'content', title: 'Your content',
        body: [
            'You keep ownership of the photos, descriptions and documents you upload, and you give MotorDesk permission to store, display and use them to run and promote the Platform and to review your listing. You confirm you have the right to upload them.',
        ],
    },
    {
        id: 'privacy', title: 'Your information',
        body: [
            'We use the information you provide to run the Platform — for example to review accounts and listings, connect buyers and sellers, process plan payments and send invoices and service emails. Your contact details are shared with other users only as needed for a sale (for example, a buyer\'s purchase request is shown to the seller). We handle your information in line with applicable Indian law.',
        ],
    },
    {
        id: 'liability', title: 'Limitation of liability',
        body: [
            'The Platform is provided "as is". To the extent permitted by law, MotorDesk is not responsible for the condition, legality or ownership of vehicles listed by users, for the accuracy of users\' listings, or for any loss arising from a transaction between a buyer and a seller.',
            'Nothing in these Terms limits any liability that cannot be limited under applicable law.',
        ],
    },
    {
        id: 'termination', title: 'Suspension and closure',
        body: [
            'We may suspend or close an account, or remove listings, if we reasonably believe these Terms or the law have been broken, or to protect other users. You may stop using the Platform at any time and can contact support to close your account.',
        ],
    },
    {
        id: 'law', title: 'Governing law',
        body: [
            'These Terms are governed by the laws of India. Subject to applicable law, the courts at Bengaluru, Karnataka will have jurisdiction over any dispute arising from them.',
        ],
    },
    {
        id: 'changes', title: 'Changes to these terms',
        body: [
            'We may update these Terms from time to time. The "Last updated" date at the top shows when they last changed. Continuing to use the Platform after a change means you accept the updated Terms.',
        ],
    },
];

export const TermsPage = () => (
    <div className="bg-white text-slate-900">
        <Helmet>
            <title>Terms & Conditions | VehicleHub by MotorDesk</title>
            <meta name="description" content="The Terms & Conditions for using VehicleHub, the vehicle marketplace by MotorDesk." />
        </Helmet>

        <section className="bg-[radial-gradient(circle_at_top_left,_rgba(45,108,223,0.12),_transparent_45%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)]">
            <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16 lg:px-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#001f3f]/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#001f3f] shadow-sm">
                    <FileText size={14} className="text-[#2d6cdf]" /> Legal
                </span>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Terms & Conditions</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                    Please read these terms carefully. They explain the rules for buying, selling and using VehicleHub.
                </p>
                <p className="mt-4 text-xs font-medium text-slate-500">Last updated: {LAST_UPDATED}</p>
            </div>
        </section>

        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-[220px_1fr] lg:px-8">
            {/* Contents */}
            <nav aria-label="Contents" className="hidden lg:block">
                <div className="sticky top-36 rounded-2xl border border-slate-200 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Contents</p>
                    <ol className="space-y-2 text-sm">
                        {SECTIONS.map((s, i) => (
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
                            <span className="text-sm font-bold text-[#2d6cdf]">{String(i + 1).padStart(2, '0')}</span> {s.title}
                        </h2>
                        {s.body?.map((p) => (
                            <p key={p.slice(0, 40)} className="mt-3 text-sm leading-7 text-slate-600 sm:text-[15px]">{p}</p>
                        ))}
                        {s.list && (
                            <ul className="mt-3 space-y-2.5">
                                {s.list.map((li) => (
                                    <li key={li.slice(0, 40)} className="flex gap-3 text-sm leading-7 text-slate-600 sm:text-[15px]">
                                        <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2d6cdf]" /> <span>{li}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}

                <section id="contact" className="scroll-mt-36 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
                    <h2 className="text-lg font-bold">Questions about these terms?</h2>
                    <p className="mt-2 text-sm text-slate-600">Contact MotorDesk:</p>
                    <div className="mt-4 space-y-2.5 text-sm text-slate-700">
                        <a href={`mailto:${COMPANY_CONTACT.email}`} className="flex items-center gap-2.5 hover:text-[#001f3f]"><Mail size={15} className="text-[#2d6cdf]" /> {COMPANY_CONTACT.email}</a>
                        <a href={COMPANY_CONTACT.phoneHref} className="flex items-center gap-2.5 hover:text-[#001f3f]"><Phone size={15} className="text-[#2d6cdf]" /> {COMPANY_CONTACT.phone}</a>
                        <p className="flex items-start gap-2.5"><MapPin size={15} className="mt-0.5 shrink-0 text-[#2d6cdf]" /> {COMPANY_CONTACT.address}</p>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">See also our <Link to="/faq" className="font-semibold text-[#001f3f] hover:underline">Help center / FAQ</Link>.</p>
                </section>
            </article>
        </div>
    </div>
);