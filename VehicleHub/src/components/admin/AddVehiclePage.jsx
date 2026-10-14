import { Helmet } from 'react-helmet-async';
import { PlusCircle } from 'lucide-react';
import { AdminAddVehicleForm } from '../../components/admin/AdminAddVehicleForm.jsx';

export const AddVehiclePage = () => (
    <div className="space-y-6">
        <Helmet><title>Add Vehicle | Admin</title></Helmet>
        <div className="animate-fadeInUp">
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
                <PlusCircle size={22} className="text-[#001f3f]" /> Add Vehicle
            </h1>
            <p className="text-sm text-slate-500">Create a new listing directly — useful for onboarding sellers who need help, or adding platform-owned inventory.</p>
        </div>
        <AdminAddVehicleForm />
    </div>
);