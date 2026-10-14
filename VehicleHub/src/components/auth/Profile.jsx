// VehicleHub/VehicleHub/src/components/auth/Profile.jsx
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Pencil, Share2, Bike } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { AvatarImage } from '../ui/AvatarImage.jsx';

export const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const memberSince = user?.memberSince || '3 days ago';

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 md:grid-cols-2">

                {/* Left: profile summary */}
                <div>
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-300 to-amber-400 ring-4 ring-white shadow-md">
                        <AvatarImage src={user?.avatar} name={user?.name || user?.fullName} letterClassName="text-3xl font-bold text-[#001f3f]" />
                    </div>

                    <h1 className="mt-4 text-xl font-extrabold text-slate-900">
                        {user?.name || 'User'}
                    </h1>

                    <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar size={14} />
                        Member since {memberSince}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <Users size={14} />
                        <span>{user?.followers ?? 0} Followers</span>
                        <span className="text-slate-300">|</span>
                        <span>{user?.following ?? 0} Following</span>
                    </div>

                    <p className="mt-6 text-xs font-semibold text-slate-400">User logged in with</p>
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500">
                        <Users size={14} />
                    </div>

                    <button
                        onClick={() => navigate('/profile/edit')}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#001f3f] py-3 text-sm font-bold text-white transition hover:bg-[#002a55] sm:w-auto sm:px-8"
                    >
                        <Pencil size={15} />
                        Edit Profile
                    </button>

                    <button className="mt-3 block text-sm font-semibold text-[#001f3f] underline underline-offset-2">
                        <span className="flex items-center gap-1.5">
                            <Share2 size={13} />
                            Share Profile
                        </span>
                    </button>
                </div>

                {/* Right: empty listings state */}
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 px-6 py-10 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm">
                        <Bike size={40} className="text-[#001f3f]" />
                    </div>
                    <h2 className="mt-5 text-base font-bold text-slate-900">
                        You haven't listed anything yet
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Let go of what you don't use anymore
                    </p>
                    <button
                        onClick={() => navigate('/sell')}
                        className="mt-5 rounded-lg bg-[#001f3f] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#002a55]"
                    >
                        Start selling
                    </button>
                </div>
            </div>
        </div>
    );
};