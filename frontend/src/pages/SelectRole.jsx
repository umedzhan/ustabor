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
    const { setUser, setToken, user } = useAuth();
    const [loadingRole, setLoadingRole] = useState(null);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminPass, setAdminPass] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

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
            // Save the new token reflecting the new role
            if (data.token) {
                localStorage.setItem('token', data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                setToken(data.token);
            }

            // If backend says setup is required for this specific role, go to setup page
            if (data.requireSetup) {
                // Override local context so guard doesn't forcefully redirect to dashboard
                data.user.onboarded = false;
                setUser(data.user);
                navigate(roleObj.path, { replace: true });
            } else {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Error setting role:', error);
            const errMsg = error.response?.data?.details || error.response?.data?.error || t('error');
            alert(`Xatolik: ${errMsg}`);
        } finally {
            setLoadingRole(null);
        }
    };

    const handleAdminLogin = async () => {
        if (adminPass !== "admin123") {
            alert("Parol noto'g'ri!");
            return;
        }
        setIsLoggingIn(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_URL}/user/set-role`, { role: 'admin' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.token) {
                localStorage.setItem('token', data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                setToken(data.token);
            }
            setUser(data.user);
        } catch (e) {
            alert("Xatolik yuz berdi");
        } finally {
            setIsLoggingIn(false);
            setShowAdminModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 pb-20 overflow-hidden relative">
            {/* Admin Shortcut */}
            <button
                onClick={() => setShowAdminModal(true)}
                className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center z-50 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Super Admin Login"
            >
                <ShieldAlert size={18} />
            </button>

            {/* Admin Password Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <ShieldAlert size={32} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 text-center mb-2">Admin Login</h2>
                        <p className="text-xs text-gray-400 font-bold text-center mb-8 uppercase tracking-widest">Xavfsiz hudud</p>

                        <input
                            type="password"
                            id="admin-password-input"
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                            placeholder="Parolni kiriting..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 mb-4 transition-all"
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={handleAdminLogin}
                                disabled={isLoggingIn}
                                className="flex-1 bg-red-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all disabled:opacity-50"
                            >
                                {isLoggingIn ? "Kirish..." : "Tasdiqlash"}
                            </button>
                            <button
                                onClick={() => setShowAdminModal(false)}
                                className="flex-1 bg-gray-100 text-gray-400 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                Yopish
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
