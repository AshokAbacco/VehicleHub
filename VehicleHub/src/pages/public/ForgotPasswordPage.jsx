import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';

export const ForgotPasswordPage = () => (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-12 text-slate-100">
        <Helmet><title>Forgot Password | VehicleHub</title></Helmet>
        <Card className="w-full max-w-md p-8">
            <h1 className="text-3xl font-semibold text-white">Reset access</h1>
            <p className="mt-2 text-sm text-slate-400">We’ll share recovery steps to your email inbox.</p>
            <form className="mt-8 space-y-4">
                <Input label="Email" type="email" />
                <Button className="w-full justify-center">Send reset link</Button>
            </form>
        </Card>
    </div>
);
