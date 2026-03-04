import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Bell, Clock, CheckCircle, XCircle, LayoutDashboard, Settings, Star, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config';

const VendorDashboard = () => {
    const { user, setUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const { data } = await axios.get(`${API_URL}/vendor/orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
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
            alert("Holatni o'zgartirishda xatolik yuz berdi");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">Kutilmoqda</span>;
            case 'accepted': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">Qabul qilingan</span>;
            case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">Bajarildi</span>;
            case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">Bekor qilingan</span>;
            default: return null;
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-24">
            {/* Premium Header */}
            <div className="bg-primary text-white pt-8 pb-14 px-6 rounded-b-[3rem] shadow-2xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-center p-1 shadow-inner">
                            <div className="w-full h-full bg-white rounded-xl flex items-center justify-center text-primary font-black text-xl">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                        <div>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">Usta Markazi</p>
                            <h1 className="font-black text-xl tracking-tight leading-none mt-1">{user?.name || 'Usta'}</h1>
                            <div className="flex items-center gap-1.5 mt-2 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-white/90">Faol rejim</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center relative hover:bg-white/20 transition-all">
                        <Bell size={22} className="text-white" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-primary"></span>
                    </button>
                </div>

                {/* Wallet Card - Glassmorphism */}
                <div className="bg-white/10 backdrop-blur-lg rounded-[2rem] p-6 border border-white/20 shadow-xl relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                <Wallet className="text-white/80" size={18} />
                            </div>
                            <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Hamyon balansi</span>
                        </div>
                        <Settings size={18} className="text-white/40 cursor-pointer" />
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-4xl font-black tracking-tighter">{user?.walletBalance?.toLocaleString() || '0'}</span>
                            <span className="text-sm font-bold text-white/60 ml-2 uppercase tracking-widest text-[11px]">so'm</span>
                        </div>
                        <button className="bg-white text-primary px-6 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-black/5 hover:scale-105 active:scale-95 transition-all">
                            Yechib olish
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Sub-Grid */}
            <div className="px-6 -mt-8 relative z-20 grid grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-5 shadow-xl shadow-black/[0.03] border border-gray-50 flex flex-col gap-1">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Bajarilgan</span>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-gray-900 leading-none">12</span>
                        <CheckCircle size={16} className="text-green-500 mb-1" />
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-5 shadow-xl shadow-black/[0.03] border border-gray-50 flex flex-col gap-1">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Reyting</span>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-gray-900 leading-none">4.9</span>
                        <Star size={16} className="text-amber-400 fill-amber-400 mb-1" />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-black text-gray-900 text-lg tracking-tight flex items-center gap-2">
                        <div className="w-2 h-6 bg-primary rounded-full"></div>
                        Faol buyurtmalar
                    </h2>
                    <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-3 py-1 rounded-full uppercase tracking-widest">
                        {orders.length} ta
                    </span>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-44 bg-gray-200/50 rounded-[2.5rem] animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {orders.length === 0 ? (
                            <div className="bg-white p-12 rounded-[2.5rem] text-center border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="text-gray-200" size={32} />
                                </div>
                                <p className="text-gray-400 text-sm font-medium">Yangi buyurtmalar kutilmoqda...</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order._id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-xl shadow-black/[0.02] flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                                                <h3 className="font-black text-gray-900 text-base leading-tight truncate">{order.serviceDetails?.name}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Clock size={12} />
                                                <span className="text-[11px] font-bold uppercase tracking-wider">
                                                    {new Date(order.appointmentTime).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        {getStatusBadge(order.status)}
                                    </div>

                                    <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-3xl flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-xs font-black text-primary">
                                                ID
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Mijoz kodi</span>
                                                <span className="text-xs font-bold text-gray-800">{order.clientId?.toString().slice(-8) || 'Yashirin'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-primary">
                                                <MapPin size={16} />
                                            </div>
                                            <div className="flex flex-col flex-1 overflow-hidden">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Xizmat manzili</span>
                                                <span className="text-xs font-bold text-gray-800 truncate">{order.location?.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Narxi</span>
                                        <span className="text-lg font-black text-primary">{order.price?.toLocaleString()} <span className="text-[10px] font-bold ml-0.5">SO'M</span></span>
                                    </div>

                                    <div className="flex gap-3 mt-2">
                                        {order.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(order._id, 'accepted')} className="flex-2 py-4 bg-primary text-white text-xs font-black rounded-2xl flex justify-center items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                                                    <CheckCircle size={16} /> QABUL QILISH
                                                </button>
                                                <button onClick={() => handleUpdateStatus(order._id, 'cancelled')} className="flex-1 py-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl flex justify-center items-center gap-2 border border-red-100 hover:bg-red-100 transition-all">
                                                    <XCircle size={16} /> RAD ETISH
                                                </button>
                                            </>
                                        )}
                                        {order.status === 'accepted' && (
                                            <button onClick={() => handleUpdateStatus(order._id, 'completed')} className="w-full py-4 bg-green-500 text-white text-xs font-black rounded-2xl flex justify-center items-center gap-2 shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all uppercase tracking-widest">
                                                <CheckCircle size={18} /> Buyurtmani yopish
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorDashboard;
