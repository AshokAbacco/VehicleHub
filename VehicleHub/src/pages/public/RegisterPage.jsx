import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';

export const RegisterPage = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-12 text-slate-100">
            <Helmet>
                <title>Register | VehicleHub</title>
            </Helmet>
            <Card className="w-full max-w-md p-8">
                <h1 className="text-3xl font-semibold text-white">Create your account</h1>
                <p className="mt-2 text-sm text-slate-400">Join as a buyer, seller, dealer, or finance partner.</p>
                <form className="mt-8 space-y-4">
                    <Input label="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                    <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                    <Input label="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                    <Button className="w-full justify-center">Create account</Button>
                </form>
                <div className="mt-6 text-sm text-slate-400">
                    Already have an account? <Link to="/login" className="text-cyan-300">Sign in</Link>
                </div>
            </Card>
        </div>
    );
};
