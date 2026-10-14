import { Helmet } from 'react-helmet-async';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';

export const ContactPage = () => (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-12 text-slate-100 lg:px-8">
        <Helmet>
            <title>Contact VehicleHub</title>
        </Helmet>
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Card className="p-8">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Contact</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Need help with a listing or transaction?</h1>
                <p className="mt-4 text-slate-400">Our support team handles buyer, seller, dealer, finance, and inspection escalations in real time.</p>
            </Card>
            <Card className="p-8">
                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Name" placeholder="Aarav" />
                    <Input label="Email" type="email" placeholder="you@example.com" />
                    <Input label="Phone" placeholder="+91 99999 11111" />
                    <Input label="Subject" placeholder="Inspection query" />
                    <div className="md:col-span-2">
                        <label className="text-sm text-slate-300">
                            <span className="mb-2 block">Message</span>
                            <textarea className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none" placeholder="Tell us about your concern" />
                        </label>
                    </div>
                </div>
                <Button className="mt-6 w-full justify-center">Send message</Button>
            </Card>
        </div>
    </div>
);
