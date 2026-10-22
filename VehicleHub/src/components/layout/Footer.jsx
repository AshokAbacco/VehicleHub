// VehicleHub/VehicleHub/src/components/layout/Footer.jsx
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, AlertCircle, TicketCheck, ChevronDown, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useRaiseSupportTicketMutation, validateContactForm, contactErrorMessage, COMPANY_CONTACT } from '../../services/contactApiSlice.js';

const quickLinks = [
    { to: '/search', label: 'Browse vehicles' },
    { to: '/pricing', label: 'Sell your vehicle' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/about', label: 'About us' },
    { to: '/contact', label: 'Contact' },
];

const supportLinks = [
    { to: '/faq', label: 'Help center / FAQ' },
    { to: '/inspection', label: 'How inspections work' },
    { to: '/terms', label: 'Terms & Conditions' },
];

const legalLinks = [
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms & Conditions' },
];


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
                        <h3 className="mb-4 flex items-center gap-2.5 text-slate-900">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#001f3f] text-white">
                                <Settings size={19} strokeWidth={2.25} aria-hidden="true" />
                            </span>
                            <span className="flex flex-col leading-none">
                                <span className="text-xl font-bold">MotorDesk</span>
                                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">VehicleHub</span>
                            </span>
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
                    </div>

                    <div>
                        <h4 className="mb-4 font-semibold text-slate-900">Quick links</h4>
                        <div className="flex flex-col gap-3 text-sm text-slate-600">
                            {quickLinks.map((link) => <Link key={link.label} to={link.to} className="w-fit hover:text-[#001f3f]">{link.label}</Link>)}
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
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-100">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <p>© {new Date().getFullYear()} Motor Desk. All rights reserved.</p>
                    <div className="flex flex-wrap items-center gap-4">
                        {legalLinks.map((link) => <Link key={link.to} to={link.to} className="hover:text-slate-700">{link.label}</Link>)}
                    </div>
                </div>
            </div>
        </footer>
    );
};