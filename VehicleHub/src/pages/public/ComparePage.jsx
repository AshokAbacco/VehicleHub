import { Helmet } from 'react-helmet-async';
import { Card } from '../../components/ui/Card.jsx';
import { initialVehicles } from '../../data/mockData.js';



export const ComparePage = () => (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-12 text-slate-100 lg:px-8">
        <Helmet><title>Compare Vehicles | VehicleHub</title></Helmet>
        <div className="mx-auto max-w-6xl">
            <Card className="p-8">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Compare</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Side-by-side comparison for smarter decisions</h1>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {initialVehicles.slice(0, 2).map((vehicle) => (
                        <div key={vehicle.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                            <p className="font-semibold text-white">{vehicle.title}</p>
                            <p className="mt-2 text-sm text-slate-400">{vehicle.brand} • {vehicle.fuelType} • {vehicle.transmission}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
);
