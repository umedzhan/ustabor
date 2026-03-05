import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User as UserIcon, Lock, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const Chat = () => {
    const { id } = useParams(); // orderId
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatLocked, setChatLocked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [filterWarning, setFilterWarning] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // poll every 5s
        return () => clearInterval(interval);
    }, [id]);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/chat/${id}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(data.messages || []);
            setChatLocked(data.chatLocked || false);
            if (data.order) setOrder(data.order);
        } catch (error) {
            console.error("Error fetching messages", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || chatLocked || sending) return;

        setSending(true);
        setFilterWarning(false);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_URL}/chat/${id}/send`, { text: newMessage }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(prev => [...prev, data.message]);
            setNewMessage('');
            if (data.wasFiltered) {
                setFilterWarning(true);
                setTimeout(() => setFilterWarning(false), 3000);
            }
        } catch (error) {
            if (error.response?.status === 403) {
                setChatLocked(true);
            }
            console.error("Send error", error);
        } finally {
            setSending(false);
        }
    };

    const isMyMessage = (msg) => msg.senderId?._id === user?._id || msg.senderId?._id?.toString() === user?._id?.toString();

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-primary rounded-full animate-spin border-t-transparent"></div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Chat Header */}
            <div className="bg-white flex items-center p-4 border-b border-gray-100 shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <div className="flex items-center gap-3 ml-2 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        <UserIcon size={20} className="text-gray-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight">
                            {order?.clientId?.name || order?.vendorId?.userId?.name || 'Chat'}
                        </span>
                        <span className="text-xs text-gray-400">
                            Buyurtma #{id?.slice(-6).toUpperCase()}
                        </span>
                    </div>
                </div>
                {chatLocked && (
                    <div className="flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full">
                        <Lock size={12} className="text-red-500" />
                        <span className="text-[10px] font-black text-red-500 uppercase">Yopilgan</span>
                    </div>
                )}
            </div>

            {/* Filter Warning */}
            {filterWarning && (
                <div className="mx-4 mt-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                    <p className="text-xs font-bold text-amber-700">
                        Xavfsizlik uchun telefon raqam/username yashirildi.
                    </p>
                </div>
            )}

            {/* Chat Locked Banner */}
            {chatLocked && (
                <div className="mx-4 mt-2 bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Lock size={16} className="text-gray-500 shrink-0" />
                    <p className="text-xs font-bold text-gray-600">
                        Bu chat yopilgan — buyurtma yakunlangan yoki bekor qilingan.
                    </p>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 pb-28">
                {messages.length === 0 && !loading && (
                    <div className="text-center py-16 text-gray-400 text-xs font-bold">
                        Hali xabar yo'q. Birinchi bo'lib yozing!
                    </div>
                )}
                {messages.map((msg) => {
                    const mine = isMyMessage(msg);
                    return (
                        <div
                            key={msg._id}
                            className={`flex flex-col max-w-[80%] ${mine ? 'self-end items-end' : 'self-start items-start'}`}
                        >
                            {!mine && (
                                <span className="text-[10px] font-black text-gray-400 mb-1 px-1">
                                    {msg.senderId?.name}
                                </span>
                            )}
                            <div className={`px-4 py-2.5 rounded-2xl ${mine
                                ? 'bg-primary text-white rounded-tr-sm'
                                : 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'
                                }`}>
                                <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                                {msg.isFiltered && mine && (
                                    <p className="text-[10px] opacity-70 mt-1 flex items-center gap-1">
                                        <AlertTriangle size={10} /> Ma'lumot yashirildi
                                    </p>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {!chatLocked ? (
                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-3 border-t border-gray-100 mb-16">
                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-end gap-2 bg-gray-50 rounded-3xl p-1.5 pr-2 border border-gray-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all"
                    >
                        <input
                            type="text"
                            placeholder="Xabar yozing..."
                            className="flex-1 bg-transparent py-2.5 px-4 outline-none text-[15px]"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="p-2.5 bg-primary text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transition-colors shadow-sm"
                        >
                            {sending
                                ? <div className="w-[18px] h-[18px] border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                : <Send size={18} className="ml-0.5" />
                            }
                        </button>
                    </form>
                </div>
            ) : (
                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 border-t border-gray-100 mb-16">
                    <div className="bg-gray-100 rounded-3xl py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                        <Lock size={14} /> Chat yopilgan
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
