import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, User as UserIcon, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const ChatsList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchChats = async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = user?.role === 'vendor' ? `${API_URL}/vendor/orders` : `${API_URL}/orders`;
            const { data } = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChats(data);
        } catch (error) {
            console.error("Error fetching chats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center border-b border-gray-100 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <div className="ml-2">
                    <h1 className="text-lg font-bold text-gray-900">{t('muloqotlar')}</h1>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{t('barcha_chatlar')}</p>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white h-20 rounded-2xl animate-pulse flex items-center p-4 gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 w-24 bg-gray-100 rounded mb-2"></div>
                                <div className="h-3 w-48 bg-gray-50 rounded"></div>
                            </div>
                        </div>
                    ))
                ) : chats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <MessageSquare size={40} />
                        </div>
                        <h3 className="text-gray-900 font-bold">{t('chatlar_yoq')}</h3>
                        <p className="text-gray-400 text-sm mt-1 max-w-[200px]">{t('chatlar_yoq_sub')}</p>
                    </div>
                ) : (
                    chats.map(order => (
                        <div
                            key={order._id}
                            onClick={() => navigate(`/chat/${order._id}`)}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer hover:border-primary/20"
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                                <UserIcon size={24} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <h3 className="font-bold text-gray-900 truncate pr-2">
                                        {user.role === 'client'
                                            ? (order.vendorId?.userId?.name || 'Usta')
                                            : (order.clientId?.name || 'Mijoz')}
                                    </h3>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                        {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                    {order.serviceDetails?.name || 'Xizmat turi ko\'rsatilmagan'}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${order.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                    <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400">
                                        {order.status === 'pending' ? 'Kutilmoqda' : order.status === 'accepted' ? 'Qabul qilindi' : 'Tugallangan'}
                                    </span>
                                </div>
                            </div>

                            <ChevronRight size={18} className="text-gray-300" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatsList;
