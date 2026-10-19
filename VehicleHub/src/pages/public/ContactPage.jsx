// VehicleHub/VehicleHub/src/pages/public/ContactPage.jsx
// Contact Us (/contact) — white theme. The enquiry is emailed to support@themotordesk.com and
// the customer gets an automatic acknowledgement email (both sent by the backend).
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Clock, Send, Loader2, CheckCircle2, AlertCircle, User, MessageSquareText } from 'lucide-react';
import { useSendContactEnquiryMutation, validateContactForm, contactErrorMessage, COMPANY_CONTACT } from '../../services/contactApiSlice.js';

const emptyForm = { name: '', email: '', message: '', website: '' };

const inputClass = (hasError) =>
    `w-full rounded-xl border-2 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none ${hasError ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-[#001f3f]'}`;

const FieldError = ({ message }) => (message ? <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p> : null);

const InfoRow = ({ icon: Icon, label, children }) => (
    <div className="flex items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f2ff] text-[#001f3f]">
            <Icon size={18} />
        </span>
        <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <div className="mt-0.5 text-sm font-medium text-slate-800">{children}</div>
        </div>
    </div>
);

export const ContactPage = () => {
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [sent, setSent] = useState(null); // success message
    const [sendEnquiry, { isLoading }] = useSendContactEnquiryMutation();

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
        if (serverError) setServerError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const found = validateContactForm(form);
        setErrors(found);
        if (Object.keys(found).length) return;
        setServerError('');
        try {
            const res = await sendEnquiry({
                name: form.name.trim(),
                email: form.email.trim(),
                message: form.message.trim(),
                website: form.website,
            }).unwrap();
            setSent(res?.message || 'Thank you! Your enquiry has been sent. Our team will get back to you within 24 hours.');
            setForm(emptyForm);
        } catch (err) {
            if (err?.data?.errors) setErrors(err.data.errors);
            setServerError(contactErrorMessage(err));
        }
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-4 py-10 text-slate-900 sm:py-14 lg:px-8">
            <Helmet>
                <title>Contact Us | VehicleHub</title>
            </Helmet>

            <div className="mx-auto max-w-6xl">
                <div className="mb-8 text-center sm:mb-10">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#001f3f]/60">Contact us</p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">We're here to help</h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
                        Questions about a listing, a purchase, selling your vehicle or an inspection? Send us a message and our team will reply within 24 hours.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                    {/* Contact details */}
                    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-lg font-bold text-slate-900">Get in touch</h2>
                        <p className="mt-1 text-sm text-slate-500">Reach us directly or use the form.</p>
                        <div className="mt-6 space-y-5">
                            <InfoRow icon={Mail} label="Email">
                                <a href={`mailto:${COMPANY_CONTACT.email}`} className="break-all hover:text-[#001f3f] hover:underline">{COMPANY_CONTACT.email}</a>
                            </InfoRow>
                            <InfoRow icon={Phone} label="Phone">
                                <a href={COMPANY_CONTACT.phoneHref} className="hover:text-[#001f3f] hover:underline">{COMPANY_CONTACT.phone}</a>
                            </InfoRow>
                            <InfoRow icon={MapPin} label="Office">
                                <span className="font-normal leading-6 text-slate-700">{COMPANY_CONTACT.address}</span>
                            </InfoRow>
                            <InfoRow icon={Clock} label="Response time">
                                <span className="font-normal text-slate-700">Within 24 hours</span>
                            </InfoRow>
                        </div>
                    </aside>

                    {/* Form */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        {sent ? (
                            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                    <CheckCircle2 size={28} />
                                </span>
                                <h2 className="mt-4 text-xl font-bold text-slate-900">Message sent</h2>
                                <p className="mt-2 max-w-md text-sm text-slate-600">{sent}</p>
                                <button
                                    type="button"
                                    onClick={() => setSent(null)}
                                    className="mt-6 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[#001f3f] transition hover:bg-slate-50"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={onSubmit} noValidate>
                                <h2 className="text-lg font-bold text-slate-900">Send us a message</h2>
                                <p className="mt-1 text-sm text-slate-500">All fields are required.</p>

                                {/* hidden from people — spam bots fill it in */}
                                <input type="text" name="website" value={form.website} onChange={onChange} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-semibold text-slate-700">Name</label>
                                        <div className="relative">
                                            <User size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input id="contact-name" name="name" value={form.name} onChange={onChange} placeholder="Your full name" autoComplete="name" aria-invalid={!!errors.name} className={inputClass(errors.name)} />
                                        </div>
                                        <FieldError message={errors.name} />
                                    </div>
                                    <div>
                                        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                                        <div className="relative">
                                            <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input id="contact-email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" autoComplete="email" aria-invalid={!!errors.email} className={inputClass(errors.email)} />
                                        </div>
                                        <FieldError message={errors.email} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-semibold text-slate-700">Message</label>
                                        <div className="relative">
                                            <MessageSquareText size={17} className="pointer-events-none absolute left-4 top-4 text-slate-400" />
                                            <textarea id="contact-message" name="message" rows={6} value={form.message} onChange={onChange} placeholder="Tell us how we can help" aria-invalid={!!errors.message} className={`${inputClass(errors.message)} resize-y`} />
                                        </div>
                                        <FieldError message={errors.message} />
                                    </div>
                                </div>

                                {serverError && (
                                    <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                                        <AlertCircle size={16} className="mt-0.5 shrink-0" /> <span>{serverError}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f3f] py-3.5 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:bg-[#002a55] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isLoading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> Send message</>}
                                </button>
                            </form>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};