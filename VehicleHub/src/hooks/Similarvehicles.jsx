import { VehicleCard } from '../components/cards/VehicleCard.jsx';

/**
 * Flipkart-style "Customers also viewed" rail. Pass the current vehicle and full
 * catalog; it recommends same-category vehicles within +/-30% of the price band.
 */
export const SimilarVehicles = ({ currentVehicle, vehicles = [] }) => {
    const similar = vehicles
        .filter((v) => v.id !== currentVehicle.id)
        .filter((v) => v.category === currentVehicle.category
            || Math.abs(v.price - currentVehicle.price) / currentVehicle.price < 0.3)
        .slice(0, 3);

    if (similar.length === 0) return null;

    return (
        <section className="space-y-4">
            <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">You may also like</p>
                <h3 className="text-2xl font-semibold text-white">Similar vehicles buyers viewed</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                {similar.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
            </div>
        </section>
    );
};
