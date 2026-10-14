import { Helmet } from 'react-helmet-async';
import { Card } from '../../components/ui/Card.jsx';
import { initialVehicles } from '../../data/mockData.js';

export const WishlistPage = () => (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-12 text-slate-100 lg:px-8">
        <Helmet><title>Wishlist | VehicleHub</title></Helmet>
        <div className="mx-auto max-w-6xl">
            <Card className="p-8">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Wishlist</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Saved vehicles ready for your next move</h1>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {initialVehicles.slice(0, 2).map((vehicle) => (
                        <div key={vehicle.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-400">{vehicle.title}</div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
);
