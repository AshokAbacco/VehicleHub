import { Helmet } from 'react-helmet-async';
import { Card } from '../../components/ui/Card.jsx';

export const AboutPage = () => (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-12 text-slate-100 lg:px-8">
        <Helmet>
            <title>About VehicleHub</title>
        </Helmet>
        <div className="mx-auto max-w-6xl space-y-6">
            <Card className="p-8">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">About</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Built for modern automotive commerce</h1>
                <p className="mt-4 text-lg leading-8 text-slate-400">VehicleHub reimagines the vehicle buying experience with trusted seller verification, premium discovery, professional inspections, finance integration, and seamless ownership handoff.</p>
            </Card>
            <div className="grid gap-6 md:grid-cols-3">
                {['Verified documents', 'Real-time inspection workflow', 'Secure payment and ownership transfer'].map((item) => (
                    <Card key={item} className="p-6 text-center text-slate-300">{item}</Card>
                ))}
            </div>
        </div>
    </div>
);
