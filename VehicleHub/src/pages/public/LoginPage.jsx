import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast, Toaster } from 'react-hot-toast';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { initialUsers } from '../../data/mockData.js';

const roleLabels = {
    buyer: 'Buyer',
    seller: 'Seller',
    admin: 'Admin',
    dealer: 'Dealer',
    inspector: 'Inspector',
    finance: 'Finance',
    support: 'Support',
    'super-admin': 'Super Admin',
};

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login, getDashboardPath } = useAuth();
    const [form, setForm] = useState({ email: 'aarav@vehiclehub.io', password: 'demo123' });

    const handleSubmit = (event) => {
        event.preventDefault();
        const user = login(form.email, form.password);
        if (user) {
            toast.success(`Welcome back, ${user.name}`);
            navigate(getDashboardPath());
            return;
        }
        toast.error('Invalid credentials');
    };

    const handleDemoSignIn = (entry) => {
        const user = login(entry.email, entry.password);
        if (user) {
            toast.success(`Signed in as ${user.name}`);
            navigate(getDashboardPath());
            return;
        }
        toast.error('Unable to sign in');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-12 text-slate-100">
            <Helmet>
                <title>Login | VehicleHub</title>
            </Helmet>
            <Toaster position="top-right" />
            <Card className="w-full max-w-5xl overflow-hidden p-0">
                <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="bg-slate-950/80 p-8">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300">
                            <ShieldCheck size={16} /> Enterprise demo access
                        </div>
                        <h1 className="mt-8 text-3xl font-semibold text-white">Sign in to your VehicleHub workspace</h1>
                        <p className="mt-3 text-sm leading-7 text-slate-400">Every role is preconfigured with realistic mock data, so you can explore the full workflow from buyer to super admin instantly.</p>
                        <div className="mt-8 space-y-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-400">
                            <p className="font-semibold text-white">Demo credentials</p>
                            <p>Buyer: aarav@vehiclehub.io / demo123</p>
                            <p>Seller: simran@vehiclehub.io / demo123</p>
                            <p>Admin: vikram@vehiclehub.io / demo123</p>
                            <p>Dealer: neha@vehiclehub.io / demo123</p>
                            <p>Inspector: dev@vehiclehub.io / demo123</p>
                            <p>Finance: riya@vehiclehub.io / demo123</p>
                            <p>Support: kunal@vehiclehub.io / demo123</p>
                            <p>Super Admin: sonia@vehiclehub.io / demo123</p>
                        </div>
                    </div>
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                            <Input label="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                            <Button type="submit" className="w-full justify-center">Sign in</Button>
                        </form>

                        <div className="mt-8">
                            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Demo sign-in cards</p>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                {initialUsers.map((entry) => (
                                    <button key={entry.id} onClick={() => handleDemoSignIn(entry)} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:border-cyan-400/30 hover:bg-slate-900">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-white">{entry.name}</p>
                                                <p className="text-sm text-slate-400">{roleLabels[entry.role]}</p>
                                            </div>
                                            <ArrowRight size={16} className="text-cyan-300" />
                                        </div>
                                        <p className="mt-3 text-xs text-slate-500">{entry.email}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 text-sm text-slate-400">
                            New to VehicleHub? <Link to="/register" className="text-cyan-300">Create an account</Link>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
