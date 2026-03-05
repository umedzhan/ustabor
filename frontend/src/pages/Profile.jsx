import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Phone, Shield, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout(navigate);
    };


    if (!user) return null;

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-24">
            {/* Premium Header */}
            <div className="bg-primary text-white pt-10 pb-20 px-6 rounded-b-[3.5rem] shadow-2xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] border border-white/30 flex items-center justify-center p-1.5 shadow-2xl mb-4">
                        <div className="w-full h-full bg-white rounded-[1.5rem] flex items-center justify-center text-primary font-black text-3xl">
                            {user.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight">{user.name}</h1>
                    <div className="mt-2 bg-white/10 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-red-400' : 'bg-green-400'}`}></span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{user.role}</span>
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-10 relative z-20 space-y-4">
                {/* Info Card */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.03] border border-gray-50 flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                            <Phone size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Telefon raqam</span>
                            <span className="text-sm font-bold text-gray-900">{user.phone || 'Kiritilmagan'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                            <Shield size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Telegram ID</span>
                            <span className="text-sm font-bold text-gray-900">{user.telegramId}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white p-2 rounded-[2.5rem] shadow-xl shadow-black/[0.03] border border-gray-50 flex flex-col">
                    {user.role === 'vendor' && (
                        <button onClick={() => navigate('/vendor/profile')} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <User size={18} />
                                </div>
                                <span className="text-sm font-bold text-gray-700">Profilni tahrirlash</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300" />
                        </button>
                    )}

                    <button onClick={handleLogout} className="flex items-center justify-between p-4 hover:bg-red-50 rounded-2xl transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                                <LogOut size={18} />
                            </div>
                            <span className="text-sm font-bold text-gray-700">Tizimdan chiqish</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                </div>
            </div>

            <div className="mt-12 text-center px-10">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                    Ustabor v1.0.0 <br />
                    Professional ustalar markazi
                </p>
            </div>
        </div>
    );
};

export default Profile;
