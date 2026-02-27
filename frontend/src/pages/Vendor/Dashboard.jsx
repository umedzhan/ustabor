import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Bell, Clock, CheckCircle, XCircle, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
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
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-primary text-white p-5 rounded-b-3xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full border-2 border-white flex items-center justify-center text-lg pl-1 pb-1 font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">{user?.name || 'Usta'}</h1>
                            <span className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                Online
                            </span>
                        </div>
                    </div>
                    <button className="p-2 bg-white/10 rounded-full relative">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-primary"></span>
                    </button>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Wallet className="text-white/80" size={20} />
                        <span className="text-white/80 text-sm font-medium">Hamyon balansi</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-3xl font-bold">{user?.walletBalance?.toLocaleString() || '0'} <span className="text-lg font-normal text-white/80">so'm</span></span>
                        <button className="bg-white text-primary px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors">
                            Pul yechish
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="text-primary" size={20} />
                    Faol buyurtmalar
                </h2>

                {loading ? (
                    <div className="space-y-3">
                        <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
                        <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {orders.length === 0 ? (
                            <div className="bg-white p-6 rounded-2xl text-center border border-gray-100">
                                <p className="text-gray-500 text-sm">Hozircha yangi buyurtmalar yo'q</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-sm">{order.serviceDetails.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(order.appointmentTime).toLocaleString('uz-UZ')}</p>
                                        </div>
                                        {getStatusBadge(order.status)}
                                    </div>

                                    <div className="bg-gray-50 p-2.5 rounded-xl text-xs flex flex-col gap-1.5">
                                        {order.client && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Mijoz ID:</span>
                                                <span className="font-medium text-gray-800">{order.clientId || 'Yashirin'}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Manzil:</span>
                                            <span className="font-medium text-gray-800 text-right max-w-[60%] truncate" title={order.location?.address}>{order.location?.address}</span>
                                        </div>
                                        <div className="flex justify-between mt-1 pt-1 border-t border-gray-200">
                                            <span className="text-gray-500">Narx:</span>
                                            <span className="font-bold text-primary">{order.serviceDetails.price.toLocaleString()} so'm</span>
                                        </div>
                                    </div>

                                    {order.status === 'pending' && (
                                        <div className="flex gap-2 mt-1">
                                            <button className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-xl flex justify-center items-center gap-1">
                                                <CheckCircle size={14} /> Qabul qilish
                                            </button>
                                            <button className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex justify-center items-center gap-1 border border-red-100">
                                                <XCircle size={14} /> Rad etish
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-between px-6 pb-safe pt-2 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
                <button className="flex flex-col items-center gap-1 p-2 text-primary">
                    <LayoutDashboard size={24} />
                    <span className="text-[10px] font-bold">Asosiy</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <CheckCircle size={24} />
                    <span className="text-[10px] font-medium">Topshiriqlar</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Wallet size={24} />
                    <span className="text-[10px] font-medium">Moliya</span>
                </button>
                <button onClick={() => navigate('/vendor/profile')} className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings size={24} />
                    <span className="text-[10px] font-medium">Profil</span>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
