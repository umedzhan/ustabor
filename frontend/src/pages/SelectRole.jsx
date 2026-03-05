import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, ChevronRight, Sparkles, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

const SelectRole = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { setUser, user } = useAuth();
    const [loadingRole, setLoadingRole] = useState(null);

    // Redirect only if fully onboarded with an active role
    useEffect(() => {
        if (user && user.onboarded && user.role && user.role !== 'none') {
            if (user.role === 'admin') navigate('/admin', { replace: true });
            else if (user.role === 'vendor') navigate('/vendor/dashboard', { replace: true });
            else if (user.role === 'client') navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const roles = [
        {
            id: 'client',
            title: t('role_client'),
            subtitle: t('role_client_desc'),
            icon: <User size={32} />,
            color: 'bg-blue-500',
            bg: 'bg-blue-50',
            path: '/client-setup'
        },
        {
            id: 'vendor',
            title: t('role_vendor'),
            subtitle: t('role_vendor_desc'),
            icon: <Briefcase size={32} />,
            color: 'bg-primary',
            bg: 'bg-indigo-50',
            path: '/vendor/register'
        }
    ];

    const handleRoleSelection = async (roleObj) => {
        setLoadingRole(roleObj.id);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_URL}/user/set-role`, { role: roleObj.id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(data.user);

            // If backend says setup is required for this specific role, go to setup page
            if (data.requireSetup) {
                navigate(roleObj.path, { replace: true });
            } else {
                // Otherwise go straight to dashboard
                if (roleObj.id === 'vendor') navigate('/vendor/dashboard', { replace: true });
                else if (roleObj.id === 'client') navigate('/', { replace: true });
                else if (roleObj.id === 'admin') navigate('/admin', { replace: true });
            }
        } catch (error) {
            console.error('Error setting role:', error);
            alert(t('error'));
        } finally {
            setLoadingRole(null);
        }
    };



    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 pb-20 overflow-hidden relative">
            {/* Admin Shortcut */}
            <button
                onClick={async () => {
                    const pass = window.prompt("Super Admin parolini kiriting:");
                    if (pass === "admin123") {
                        try {
                            const token = localStorage.getItem('token');
                            const { data } = await axios.post(`${API_URL}/user/set-role`, { role: 'admin' }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            setUser(data.user);
                            navigate('/admin');
                        } catch (e) {
                            alert("Xatolik yuz berdi");
                        }
                    } else if (pass !== null) {
                        alert("Parol noto'g'ri!");
                    }
                }}
                className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center z-50 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Super Admin Login"
            >
                <ShieldAlert size={18} />
            </button>

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
                            disabled={loadingRole !== null}
                            onClick={() => handleRoleSelection(role)}
                            className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/[0.02] flex items-center gap-6 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/[0.05] active:scale-95 text-left relative overflow-hidden animate-slide-up disabled:opacity-50 disabled:cursor-not-allowed"
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
                                {loadingRole === role.id ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <ChevronRight size={20} />
                                )}
                            </div>
                        </button>
                    ))
                    }
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
