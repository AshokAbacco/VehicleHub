// VehicleHub/VehicleHub/src/components/layout/Footer.jsx
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, AlertCircle, TicketCheck, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useRaiseSupportTicketMutation, validateContactForm, contactErrorMessage, COMPANY_CONTACT } from '../../services/contactApiSlice.js';

// Inline brand SVGs — no separate SocialIcons.jsx import needed
const FacebookIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
);

const InstagramIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
);

const TwitterIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M18.9 2H22l-7.6 8.68L23.3 22h-6.9l-5.4-6.6L4.7 22H1.6l8.1-9.26L1 2h7.1l4.9 6.03L18.9 2Zm-1.2 18h1.9L7.4 4H5.4l12.3 16Z" />
    </svg>
);

const YoutubeIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M21.6 7.2s-.2-1.5-.85-2.15c-.8-.85-1.7-.85-2.1-.9C15.8 4 12 4 12 4h-.01s-3.8 0-6.65.15c-.4.05-1.3.05-2.1.9C2.6 5.7 2.4 7.2 2.4 7.2S2.2 9 2.2 10.8v1.4c0 1.8.2 3.6.2 3.6s.2 1.5.85 2.15c.8.85 1.85.82 2.32.91C7.2 19 12 19 12 19s3.8 0 6.65-.15c.4-.05 1.3-.05 2.1-.9.65-.65.85-2.15.85-2.15s.2-1.8.2-3.6v-1.4c0-1.8-.2-3.6-.2-3.6ZM9.9 14.5V8.7l5.6 2.9-5.6 2.9Z" />
    </svg>
);

const LinkedinIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.44-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
);

const socialLinks = [
    { name: 'Facebook', icon: FacebookIcon, href: 'https://facebook.com' },
    { name: 'Instagram', icon: InstagramIcon, href: 'https://instagram.com' },
    { name: 'Twitter', icon: TwitterIcon, href: 'https://twitter.com' },
    { name: 'YouTube', icon: YoutubeIcon, href: 'https://youtube.com' },
    { name: 'LinkedIn', icon: LinkedinIcon, href: 'https://linkedin.com' },
];

const quickLinks = [
    { to: '/search', label: 'Browse vehicles' },
    { to: '/sell', label: 'Sell your vehicle' },
    { to: '/about', label: 'About us' },
    { to: '/contact', label: 'Contact' },
];

const supportLinks = [
    { to: '/faq', label: 'Help center / FAQ' },
    { to: '/inspection', label: 'How inspections work' },
    { to: '/report', label: 'Report a listing' },
];

const legalLinks = [
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms of Service' },
];

const popularCities = ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai'];

export const Footer = () => {
    const location = useLocation();
    // "Raise a Ticket" form -> emailed to the support team by the backend
    const [ticket, setTicket] = useState({ name: '', email: '', message: '', website: '' });
    const [ticketErrors, setTicketErrors] = useState({});
    const [ticketStatus, setTicketStatus] = useState(null); // { type: 'success' | 'error', text }
    const [ticketOpen, setTicketOpen] = useState(false); // form stays folded until the button is clicked
    const [raiseTicket, { isLoading: sendingTicket }] = useRaiseSupportTicketMutation();

    const hiddenPaths = ['/login', '/register', '/forgot-password'];
    if (hiddenPaths.includes(location.pathname)) return null;

    const onTicketChange = (e) => {
        const { name, value } = e.target;
        setTicket((t) => ({ ...t, [name]: value }));
        if (ticketErrors[name]) setTicketErrors((er) => ({ ...er, [name]: undefined }));
        if (ticketStatus?.type === 'error') setTicketStatus(null);
    };

    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        const errors = validateContactForm(ticket);
        setTicketErrors(errors);
        if (Object.keys(errors).length) return;
        setTicketStatus(null);
        try {
            const res = await raiseTicket({
                name: ticket.name.trim(),
                email: ticket.email.trim(),
                message: ticket.message.trim(),
                website: ticket.website,
            }).unwrap();
            setTicket({ name: '', email: '', message: '', website: '' });
            setTicketStatus({ type: 'success', text: res?.message || 'Your ticket has been raised. Our team will contact you soon.' });
        } catch (err) {
            if (err?.data?.errors) setTicketErrors(err.data.errors);
            setTicketStatus({ type: 'error', text: contactErrorMessage(err) });
        }
    };

    const ticketInput = (field) =>
        `w-full min-w-0 rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#001f3f] focus:ring-2 focus:ring-[#001f3f]/10 ${ticketErrors[field] ? 'border-red-300' : 'border-slate-300'}`;

    return (

        <footer className="animate-fadeInUp border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
                    <div>
                        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#001f3f] text-sm font-bold text-white">V</span>
                            VehicleHub
                        </h3>
                        <p className="text-sm leading-6 text-slate-600">
                            A premium vehicle marketplace for verified deals, instant inquiries, and modern ownership transitions.
                        </p>
                        <div className="mt-5 space-y-2.5 text-sm text-slate-600">
                            <a href={COMPANY_CONTACT.phoneHref} className="flex items-center gap-2 hover:text-[#002040]">
                                <Phone size={14} className="shrink-0 text-[#001f3f]" /> {COMPANY_CONTACT.phone}
                            </a>
                            <a href={`mailto:${COMPANY_CONTACT.email}`} className="flex items-center gap-2 break-all hover:text-[#002040]">
                                <Mail size={14} className="shrink-0 text-[#001f3f]" /> {COMPANY_CONTACT.email}
                            </a>
                            <p className="flex items-start gap-2 text-slate-600"><MapPin size={14} className="mt-1 shrink-0 text-[#001f3f]" /> {COMPANY_CONTACT.address}</p>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name}
                                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-[#001f3f] hover:text-[#001f3f]">
                                        <Icon className="h-4 w-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 font-semibold text-slate-900">Quick links</h4>
                        <div className="flex flex-col gap-3 text-sm text-slate-600">
                            {quickLinks.map((link) => <Link key={link.to} to={link.to} className="w-fit hover:text-[#001f3f]">{link.label}</Link>)}
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 font-semibold text-slate-900">Support</h4>
                        <div className="flex flex-col gap-3 text-sm text-slate-600">
                            {supportLinks.map((link) => <Link key={link.to} to={link.to} className="w-fit hover:text-[#001f3f]">{link.label}</Link>)}
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 font-semibold text-slate-900">Raise a Ticket</h4>
                        <p className="mb-4 text-sm text-slate-600">Have a question or an issue? Send us a ticket and our team will get back to you.</p>
                        {!ticketOpen ? (
                            <button
                                type="button"
                                onClick={() => setTicketOpen(true)}
                                aria-expanded="false"
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#001f3f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002a55]"
                            >
                                <TicketCheck size={16} /> Raise a Ticket <ChevronDown size={15} />
                            </button>
                        ) : (
                            <div className="animate-fadeInUp">
                            {ticketStatus?.type === 'success' ? (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
                                    <p className="flex items-start gap-2 text-sm text-emerald-800">
                                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> {ticketStatus.text}
                                    </p>
                                    <div className="mt-2 flex items-center gap-4">
                                        <button type="button" onClick={() => setTicketStatus(null)} className="text-xs font-semibold text-[#001f3f] hover:underline">
                                            Raise another ticket
                                        </button>
                                        <button type="button" onClick={() => { setTicketStatus(null); setTicketOpen(false); }} className="text-xs font-medium text-slate-500 hover:text-slate-700">
                                            Close
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleTicketSubmit} noValidate className="space-y-2.5">
                                    {/* hidden from people — spam bots fill it in */}
                                    <input type="text" name="website" value={ticket.website} onChange={onTicketChange} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                                    <div>
                                        <input name="name" value={ticket.name} onChange={onTicketChange} placeholder="Your name" autoComplete="name" aria-label="Your name" aria-invalid={!!ticketErrors.name} className={ticketInput('name')} />
                                        {ticketErrors.name && <p className="mt-1 text-xs text-red-600">{ticketErrors.name}</p>}
                                    </div>
                                    <div>
                                        <input name="email" type="email" value={ticket.email} onChange={onTicketChange} placeholder="Email address" autoComplete="email" aria-label="Email address" aria-invalid={!!ticketErrors.email} className={ticketInput('email')} />
                                        {ticketErrors.email && <p className="mt-1 text-xs text-red-600">{ticketErrors.email}</p>}
                                    </div>
                                    <div>
                                        <textarea name="message" rows={3} value={ticket.message} onChange={onTicketChange} placeholder="How can we help?" aria-label="Message" aria-invalid={!!ticketErrors.message} className={`${ticketInput('message')} resize-none`} />
                                        {ticketErrors.message && <p className="mt-1 text-xs text-red-600">{ticketErrors.message}</p>}
                                    </div>
                                    {ticketStatus?.type === 'error' && (
                                        <p className="flex items-start gap-1.5 text-xs text-red-600"><AlertCircle size={14} className="mt-px shrink-0" /> {ticketStatus.text}</p>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => { setTicketOpen(false); setTicketErrors({}); if (ticketStatus?.type === 'error') setTicketStatus(null); }} className="shrink-0 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                                            Cancel
                                        </button>
                                    <button type="submit" disabled={sendingTicket} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#001f3f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002a55] disabled:cursor-not-allowed disabled:opacity-60">
                                        {sendingTicket ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : <><Send size={15} /> Submit ticket</>}
                                    </button>
                                    </div>
                                </form>
                            )}
                            </div>
                        )}
                        <div className="mt-6">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Popular cities</p>
                            <div className="flex flex-wrap gap-2">
                                {popularCities.map((city) => (
                                    <Link key={city} to={`/search?location=${encodeURIComponent(city)}`}
                                        className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-[#001f3f] hover:text-[#001f3f]">
                                        {city}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-100">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <p>© {new Date().getFullYear()} VehicleHub. All rights reserved.</p>
                    <div className="flex flex-wrap items-center gap-4">
                        {legalLinks.map((link) => <Link key={link.to} to={link.to} className="hover:text-slate-700">{link.label}</Link>)}
                    </div>
                </div>
            </div>
        </footer>
    );
};