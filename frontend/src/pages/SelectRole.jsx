import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Shield, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SelectRole = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const roles = [
        {
            id: 'client',
            title: t('mijoz'),
            subtitle: t('mijoz_sub'),
            icon: <User size={32} />,
            color: 'bg-blue-500',
            bg: 'bg-blue-50',
            path: '/'
        },
        {
            id: 'vendor',
            title: t('usta'),
            subtitle: t('usta_sub'),
            icon: <Briefcase size={32} />,
            color: 'bg-primary',
            bg: 'bg-indigo-50',
            path: '/vendor/dashboard'
        },
        {
            id: 'admin',
            title: t('admin'),
            subtitle: t('admin_sub'),
            icon: <Shield size={32} />,
            color: 'bg-red-500',
            bg: 'bg-red-50',
            path: '/admin/dashboard'
        }
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 pb-20 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full -ml-40 -mb-40 blur-3xl"></div>

            <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 border border-gray-50 transform -rotate-6">
                    <Sparkles size={40} className="text-primary animate-pulse" />
                </div>

                <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2 text-center">{t('welcome')}</h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-12 text-center">{t('choose_role')}</p>

                <div className="w-full flex flex-col gap-5">
                    {roles.map((role, index) => (
                        <button
                            key={role.id}
                            onClick={() => navigate(role.path)}
                            className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/[0.02] flex items-center gap-6 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/[0.05] active:scale-95 text-left relative overflow-hidden animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${role.bg} rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform`}></div>

                            <div className={`w-16 h-16 ${role.color} text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform relative z-10`}>
                                {role.icon}
                            </div>

                            <div className="flex-1 relative z-10">
                                <h3 className="text-xl font-black text-gray-900 leading-tight mb-1">{role.title}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">{role.subtitle}</p>
                            </div>

                            <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all relative z-10">
                                <ChevronRight size={20} />
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em] leading-relaxed">
                        USTABOR PROFESSIONAL <br />
                        XIZMATLAR PLATFORMASI
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
            `}} />
        </div>
    );
};

export default SelectRole;
