import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';

export const ResetPasswordPage = () => (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-12 text-slate-100">
        <Helmet><title>Reset Password | VehicleHub</title></Helmet>
        <Card className="w-full max-w-md p-8">
            <h1 className="text-3xl font-semibold text-white">Create a new password</h1>
            <form className="mt-8 space-y-4">
                <Input label="New password" type="password" />
                <Input label="Confirm password" type="password" />
                <Button className="w-full justify-center">Save password</Button>
            </form>
        </Card>
    </div>
);
