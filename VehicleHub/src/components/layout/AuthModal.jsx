import { X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { initialUsers } from '../../data/mockData.js';

export const AuthModal = ({ isOpen, onClose, title = 'Continue to VehicleHub' }) => {
  const navigate = useNavigate();
  const { login, getDashboardPath } = useAuth();
  const [form, setForm] = useState({ email: 'aarav@vehiclehub.io', password: 'demo123' });

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const user = login(form.email, form.password);
    if (user) {
      toast.success(`Welcome back, ${user.name}`);
      onClose();
      navigate(getDashboardPath());
      return;
    }
    toast.error('Invalid credentials');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-xl">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-black/40">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Secure access</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/10 bg-white/10 p-2 text-slate-200">
            <X size={18} />
          </button>
        </div>

        <p className="mb-6 text-sm leading-7 text-slate-400">Create an account or sign in to save vehicles, contact sellers, book inspections, and manage your marketplace actions.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <Input label="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <Button type="submit" className="w-full justify-center">Continue</Button>
        </form>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-400">
          <p className="mb-2 font-semibold text-white">Demo roles</p>
          {initialUsers.slice(0, 7).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-3 py-1">
              <span>{entry.role}</span>
              <span className="text-cyan-300">{entry.email}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
