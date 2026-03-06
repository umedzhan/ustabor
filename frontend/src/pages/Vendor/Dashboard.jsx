import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, Bell, Clock, CheckCircle, XCircle,
    LayoutDashboard, Settings, Star, MapPin,
    MessageSquare, ChevronRight, Zap, TrendingUp,
    AlertCircle, Sparkles, Eye, BarChart2, FileText, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import { API_URL } from '../../config';

const VendorDashboard = () => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vendorProfile, setVendorProfile] = useState(null);
    const [report, setReport] = useState(null);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'report'
    const ordersRef = useRef(null);

    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const [ordersRes, profileRes, reportRes] = await Promise.all([
                    axios.get(`${API_URL}/vendor/orders`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_URL}/vendor/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_URL}/vendor/report`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setOrders(ordersRes.data);
                setVendorProfile(profileRes.data);
                setReport(reportRes.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/orders/${orderId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local UI state
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Error updating status:", error);
            alert(t('error'));
        }
    };

    const scrollToOrders = () => {
        ordersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return (
                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100 animate-pulse">
                    <AlertCircle size={10} />
                    <span className="text-[10px] font-black uppercase tracking-tight">{t('status_pending')}</span>
                </div>
            );
            case 'accepted': return (
                <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                    <Sparkles size={10} />
                    <span className="text-[10px] font-black uppercase tracking-tight">{t('status_accepted')}</span>
                </div>
            );
            case 'completed': return (
                <div className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100">
                    <CheckCircle size={10} />
                    <span className="text-[10px] font-black uppercase tracking-tight">{t('status_completed')}</span>
                </div>
            );
            case 'cancelled': return (
                <div className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">
                    <XCircle size={10} />
                    <span className="text-[10px] font-black uppercase tracking-tight">{t('status_cancelled')}</span>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-32">
            {/* Premium Header */}
            <div className="bg-primary text-white pt-10 pb-20 px-6 rounded-b-[4rem] shadow-2xl shadow-primary/20 relative overflow-hidden transition-all duration-700">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-24 -mt-24 blur-[100px] animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-[80px]"></div>

                <div className="flex justify-between items-center mb-10 relative z-10">
                    <button
                        onClick={() => logout(navigate)}
                        className="absolute -top-6 left-0 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-white hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft size={12} /> {t('back')}
                    </button>
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-[1.8rem] border border-white/30 p-1 shadow-2xl overflow-hidden group">
                                <div className="w-full h-full bg-white rounded-[1.4rem] flex items-center justify-center text-primary font-black text-2xl group-hover:scale-110 transition-transform">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-primary transition-colors duration-500 ${vendorProfile?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.25em]">{t('control_panel')}</p>
                                {vendorProfile?.isOnline && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                )}
                            </div>
                            <h1 className="font-black text-2xl tracking-tighter leading-none mt-1.5">{user?.name?.split(' ')[0] || 'Usta'}</h1>
                        </div>
                    </div>

                    <button
                        onClick={scrollToOrders}
                        className="w-14 h-14 bg-white/15 backdrop-blur-xl rounded-[1.8rem] border border-white/20 flex items-center justify-center relative hover:bg-white/25 active:scale-90 transition-all group overflow-visible shadow-lg"
                    >
                        <Bell size={24} className={`text-white transition-transform ${pendingOrdersCount > 0 ? 'animate-[bell-shake_0.5s_infinite]' : ''}`} />
                        {pendingOrdersCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[24px] h-6 bg-red-500 text-white text-[10px] font-black border-4 border-primary rounded-full flex items-center justify-center animate-bounce shadow-lg px-1">
                                {pendingOrdersCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Creative Balance Card */}
                <div className="bg-white/15 backdrop-blur-2xl rounded-[2.5rem] p-7 border border-white/25 shadow-2xl relative z-10 group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
                                <Wallet size={20} />
                            </div>
                            <span className="text-white/80 text-[10px] font-black uppercase tracking-widest">{t('balance')}</span>
                        </div>
                        <button onClick={() => navigate('/vendor/profile')} className="p-2 bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
                            <Settings size={20} />
                        </button>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tracking-tighter drop-shadow-lg">{user?.walletBalance?.toLocaleString() || '0'}</span>
                                <span className="text-sm font-black text-white/50 uppercase tracking-widest">{t('sum')}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-green-400 bg-green-500/10 w-fit px-3 py-1 rounded-full border border-green-500/20">
                                <TrendingUp size={12} />
                                <span>+12% {t('this_month')}</span>
                            </div>
                        </div>
                        <button className="bg-white text-primary px-8 py-4 rounded-[1.8rem] text-xs font-black shadow-2xl shadow-black/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest">
                            {t('withdraw')} <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="px-6 -mt-10 relative z-20 grid grid-cols-3 gap-3">
                <div className="bg-white rounded-[2rem] p-5 shadow-2xl shadow-black/[0.04] border border-gray-50 flex flex-col gap-2 group hover:border-primary/20 transition-all">
                    <div className="w-9 h-9 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                        <CheckCircle size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-gray-900 leading-none">
                            {orders.filter(o => o.status === 'completed' || o.status === 'evaluated').length}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider mt-1">Yakunlangan</span>
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-5 shadow-2xl shadow-black/[0.04] border border-gray-50 flex flex-col gap-2 group hover:border-amber-100 transition-all">
                    <div className="w-9 h-9 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                        <Star size={18} fill="currentColor" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-gray-900 leading-none">
                            {Number(vendorProfile?.rating || 5.0).toFixed(1)}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider mt-1">Reyting</span>
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-5 shadow-2xl shadow-black/[0.04] border border-gray-50 flex flex-col gap-2 group hover:border-blue-100 transition-all">
                    <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                        <Eye size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-gray-900 leading-none">
                            {vendorProfile?.viewCount || 0}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider mt-1">Ko'rishlar</span>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="px-6 pt-6 flex gap-2">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-gray-400 border border-gray-100'}`}
                >
                    <Clock size={14} /> Zakazlar
                </button>
                <button
                    onClick={() => setActiveTab('report')}
                    className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'report' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-gray-400 border border-gray-100'}`}
                >
                    <BarChart2 size={14} /> Hisobot
                </button>
            </div>

            {/* Report Tab */}
            {activeTab === 'report' && (
                <div className="px-6 py-6 flex flex-col gap-4">
                    {!report ? (
                        <div className="h-32 bg-gray-100 rounded-3xl animate-pulse" />
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Jami daromad</p>
                                    <p className="text-xl font-black text-primary">{report.totalEarned?.toLocaleString() || 0} <span className="text-xs">so'm</span></p>
                                </div>
                                <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Sof daromad</p>
                                    <p className="text-xl font-black text-green-600">{report.netEarned?.toLocaleString() || 0} <span className="text-xs">so'm</span></p>
                                </div>
                                <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Komissiya ({report.commissionRate}%)</p>
                                    <p className="text-xl font-black text-red-500">{report.totalCommission?.toLocaleString() || 0} <span className="text-xs">so'm</span></p>
                                </div>
                                <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Ko'rishlar</p>
                                    <p className="text-xl font-black text-blue-600">{report.viewCount || 0} <span className="text-xs">ta</span></p>
                                </div>
                            </div>

                            {/* Order Stats */}
                            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Zakazlar statistikasi</p>
                                <div className="flex gap-4">
                                    <div className="flex-1 text-center">
                                        <p className="text-2xl font-black text-gray-900">{report.completedOrders}</p>
                                        <p className="text-[9px] font-black text-green-500 uppercase">Bajarilgan</p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-2xl font-black text-gray-900">{report.pendingOrders}</p>
                                        <p className="text-[9px] font-black text-amber-500 uppercase">Kutilmoqda</p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-2xl font-black text-gray-900">{report.cancelledOrders}</p>
                                        <p className="text-[9px] font-black text-red-500 uppercase">Bekor</p>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Breakdown */}
                            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Oylik daromad</p>
                                <div className="flex flex-col gap-2">
                                    {report.monthlyData?.map((m, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-500 w-20">{m.month}</span>
                                            <div className="flex-1 mx-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all"
                                                    style={{ width: `${report.monthlyData.length > 0 ? (m.earned / Math.max(...report.monthlyData.map(x => x.earned), 1)) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-black text-gray-900 w-20 text-right">{m.earned?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && <div className="px-6 py-6" ref={ordersRef}>
                <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-col">
                        <h2 className="font-black text-gray-900 text-xl tracking-tight flex items-center gap-3">
                            <div className="w-2.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"></div>
                            {t('active_projects')}
                        </h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 ml-5">{t('all_current_jobs')}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-2xl">
                        <Zap size={14} className="text-primary" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            {orders.length}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-6">
                        {[1, 2].map(i => (
                            <div key={i} className="h-48 bg-gray-200/50 rounded-[3rem] animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {orders.length === 0 ? (
                            <div className="bg-white p-16 rounded-[3rem] text-center border border-gray-100 shadow-xl shadow-black/[0.02] flex flex-col items-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6 text-gray-200 group relative">
                                    <Clock size={40} className="animate-pulse" />
                                    <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-white to-transparent opacity-50"></div>
                                </div>
                                <h3 className="text-gray-900 font-black text-lg mb-2">{t('no_orders')}...</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">{t('new_order')}</p>
                            </div>
                        ) : (
                            orders.map((order, index) => (
                                <div
                                    key={order._id}
                                    className={`bg-white p-8 rounded-[3rem] border border-gray-50 shadow-2xl shadow-black/[0.03] flex flex-col gap-6 animate-scale-in transition-all hover:scale-[1.02] hover:shadow-primary/5`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex justify-between items-start border-b border-gray-50 pb-5">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>
                                                </div>
                                                <h3 className="font-black text-gray-900 text-lg leading-tight truncate pr-4">{order.serviceDetails?.name}</h3>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-100/50">
                                                    <Clock size={12} className="text-gray-400" />
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">
                                                        {new Date(order.appointmentTime).toLocaleString('uz-UZ', { day: 'numeric', month: 'long' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-100/50">
                                                    <span className="text-[10px] font-black text-gray-400">{t('time_label')}</span>
                                                    <span className="text-[10px] font-black text-gray-800">
                                                        {new Date(order.appointmentTime).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {getStatusBadge(order.status)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50/70 backdrop-blur-sm border border-gray-100 p-5 rounded-[2rem] flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <MessageSquare size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{t('client_label')}</span>
                                            </div>
                                            <span className="text-xs font-black text-gray-800">ID: ...{order.clientId?.toString().slice(-6)}</span>
                                        </div>
                                        <div className="bg-gray-50/70 backdrop-blur-sm border border-gray-100 p-5 rounded-[2rem] flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-primary">
                                                <MapPin size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{t('address_label')}</span>
                                            </div>
                                            <span className="text-xs font-black text-gray-800 truncate">{order.location?.address?.split(',')[0]}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between px-2 bg-primary/5 p-4 rounded-3xl border border-primary/10">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">{t('service_fee')}</span>
                                            <span className="text-2xl font-black text-primary tracking-tighter">{order.price?.toLocaleString()} <span className="text-xs font-black ml-1 uppercase">{t('sum_short')}</span></span>
                                        </div>
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-primary/10 text-primary">
                                            <Zap size={24} fill="currentColor" />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        {order.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(order._id, 'accepted')}
                                                    className="flex-[2] py-5 bg-gray-900 text-white text-[11px] font-black rounded-[1.8rem] flex justify-center items-center gap-3 shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                                                >
                                                    <CheckCircle size={20} /> {t('accept_order')}
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                                                    className="flex-1 py-5 bg-white text-red-500 text-[11px] font-black rounded-[1.8rem] flex justify-center items-center border-2 border-red-50 hover:bg-red-50 active:scale-95 transition-all"
                                                >
                                                    {t('reject_order')}
                                                </button>
                                            </>
                                        )}
                                        {order.status === 'accepted' && (
                                            <button
                                                onClick={() => handleUpdateStatus(order._id, 'completed')}
                                                className="w-full py-5 bg-green-500 text-white text-xs font-black rounded-[2rem] flex justify-center items-center gap-3 shadow-2xl shadow-green-500/30 hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.15em]"
                                            >
                                                <Sparkles size={20} /> {t('finish_job')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>}

            {/* Animation CSS & Bell Shake */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bell-shake {
                    0% { transform: rotate(0); }
                    15% { transform: rotate(15deg); }
                    30% { transform: rotate(-15deg); }
                    45% { transform: rotate(10deg); }
                    60% { transform: rotate(-10deg); }
                    75% { transform: rotate(5deg); }
                    85% { transform: rotate(-5deg); }
                    100% { transform: rotate(0); }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
                :root { --primary-rgb: 99, 102, 241; }
            `}} />
        </div>
    );
};

export default VendorDashboard;
