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
        // Optional poll for new chat list updates occasionally
        const interval = setInterval(fetchChats, 10000);
        return () => clearInterval(interval);
    }, [user?.role]);

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-32 font-sans">
            {/* Native App-like Header */}
            <div className="bg-white/90 backdrop-blur-md px-4 py-3.5 flex items-center border-b border-gray-100 sticky top-0 z-20 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <div className="ml-2 flex-1">
                    <h1 className="text-[17px] font-bold text-gray-900 leading-tight">
                        {t('muloqotlar') || 'Muloqotlar'}
                    </h1>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
                        {t('barcha_chatlar') || 'Barcha chatlar'}
                    </p>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-3 max-w-md mx-auto">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white h-[84px] rounded-2xl animate-pulse flex items-center p-4 gap-4 shadow-sm border border-black/5">
                            <div className="w-14 h-14 bg-gray-100 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 w-32 bg-gray-100 rounded mb-2.5"></div>
                                <div className="h-3 w-48 bg-gray-50 rounded"></div>
                            </div>
                        </div>
                    ))
                ) : chats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-5 text-primary/40 relative shadow-sm">
                            <MessageSquare size={44} />
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-primary/40 rounded-full"></div>
                            </div>
                        </div>
                        <h3 className="text-[18px] text-gray-900 font-bold mb-1">
                            {t('chatlar_yoq') || 'Chatlar yo\'q'}
                        </h3>
                        <p className="text-gray-400 text-sm max-w-[220px] font-medium leading-relaxed">
                            {t('chatlar_yoq_sub') || 'Hozircha hech qanday suhbat mavjud emas.'}
                        </p>
                    </div>
                ) : (
                    chats.map((order, idx) => {
                        const isClient = user?.role === 'client';
                        const partnerName = isClient
                            ? (order.vendorId?.userId?.name || 'Usta')
                            : (order.clientId?.name || 'Mijoz');
                        const partnerImage = isClient
                            ? order.vendorId?.userId?.profilePicture
                            : order.clientId?.profilePicture;

                        return (
                            <div
                                key={order._id}
                                onClick={() => navigate(`/chat/${order._id}`)}
                                style={{ animationDelay: `${idx * 50}ms` }}
                                className="bg-white rounded-[20px] p-3.5 shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer hover:shadow-md hover:border-primary/20 animate-in fade-in slide-in-from-bottom-4"
                            >
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary/10 to-transparent flex items-center justify-center text-primary/60 shrink-0 border border-black/5 overflow-hidden">
                                        {partnerImage ? (
                                            <img src={partnerImage} alt={partnerName} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon size={26} strokeWidth={1.5} />
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#00a65a]"></div>
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h3 className="font-bold text-[15px] text-gray-900 truncate pr-2">
                                            {partnerName}
                                        </h3>
                                        <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-full">
                                            {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-[13px] text-gray-500 font-medium truncate mb-1.5">
                                        Buyurtma: {order.serviceDetails?.name || 'Xizmat turi'} (#{order._id.slice(-4).toUpperCase()})
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${order.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`}></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            {order.status === 'pending' ? 'Kutilmoqda' : order.status === 'accepted' ? 'Qabul qilingan' : order.status === 'completed' ? 'Tugallangan' : 'Faol'}
                                        </span>
                                    </div>
                                </div>

                                <ChevronRight size={20} className="text-gray-300 shrink-0 ml-1" />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ChatsList;
