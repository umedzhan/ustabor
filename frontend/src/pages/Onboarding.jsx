import React from 'react';
import { User, Hammer, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleRoleSelection = async (role) => {
        try {
            const { data } = await axios.post(`${API_URL}/user/set-role`, { role });
            setUser(data.user);
            if (role === 'vendor') {
                navigate('/vendor/register');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Error setting role:', error);
            alert('Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col p-6 items-center justify-center">
            <div className="text-center mb-10 animate-fade-in">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <img src="/logo.png" alt="Ustabor" className="w-12 h-12" onError={(e) => e.target.style.display = 'none'} />
                    <span className="text-primary font-black text-3xl">U</span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-3">Xush kelibsiz!</h1>
                <p className="text-gray-500 text-sm max-w-[280px] mx-auto leading-relaxed">
                    Ustabor platformasidan qanday maqsadda foydalanmoqchisiz?
                </p>
            </div>

            <div className="w-full space-y-4 max-w-sm">
                <button
                    onClick={() => handleRoleSelection('client')}
                    className="w-full bg-gray-50 hover:bg-white border-2 border-transparent hover:border-primary/20 p-5 rounded-[2rem] flex items-center gap-5 transition-all group active:scale-95 shadow-sm hover:shadow-xl hover:shadow-primary/10"
                >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                        <User size={28} />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-bold text-gray-900 text-lg">Mijozman</h3>
                        <p className="text-gray-500 text-[11px] font-medium leading-tight">Ustalarni qidirman, xizmatlardan foydalanman</p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" size={20} />
                </button>

                <button
                    onClick={() => handleRoleSelection('vendor')}
                    className="w-full bg-gray-50 hover:bg-white border-2 border-transparent hover:border-primary/20 p-5 rounded-[2rem] flex items-center gap-5 transition-all group active:scale-95 shadow-sm hover:shadow-xl hover:shadow-primary/10"
                >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                        <Hammer size={28} />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-bold text-gray-900 text-lg">Ustaman</h3>
                        <p className="text-gray-500 text-[11px] font-medium leading-tight">Xizmatlarimni taklif qilaman, daromad topaman</p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" size={20} />
                </button>
            </div>

            <div className="mt-12 text-center">
                <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Select your path to continue</p>
            </div>
        </div>
    );
};

export default Onboarding;
