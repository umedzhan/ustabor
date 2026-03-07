import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User as UserIcon, Lock, AlertTriangle, Check, CheckCheck } from 'lucide-react';
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

    // Auto-scroll logic
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    // Auto-resize textarea
    const textareaRef = useRef(null);

    useEffect(() => {
        fetchMessages(true);
        const interval = setInterval(() => fetchMessages(false), 3000); // poll every 3s
        return () => clearInterval(interval);
    }, [id]);

    const fetchMessages = async (isInitial = false) => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/chat/${id}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(data.messages || []);
            setChatLocked(data.chatLocked || false);
            if (data.order) setOrder(data.order);

            if (isInitial) {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    // Scroll handler to check if user scrolled up
    const handleScroll = () => {
        if (!chatContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShouldAutoScroll(isNearBottom);
    };

    useEffect(() => {
        if (shouldAutoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || chatLocked || sending) return;

        setSending(true);
        setFilterWarning(false);
        setShouldAutoScroll(true); // Always scroll down on send
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_URL}/chat/${id}/send`, { text: newMessage }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(prev => [...prev, data.message]);
            setNewMessage('');

            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = '48px';
            }

            if (data.wasFiltered) {
                setFilterWarning(true);
                setTimeout(() => setFilterWarning(false), 3000);
            }
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            if (error.response?.status === 403) {
                setChatLocked(true);
            }
            console.error("Send error", error);
        } finally {
            setSending(false);
        }
    };

    const handleTextareaInput = (e) => {
        setNewMessage(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = '48px'; // reset
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`; // expand up to 120px
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const isMyMessage = (msg) => msg.senderId?._id === user?._id || msg.senderId?._id?.toString() === user?._id?.toString();

    // Group messages by date
    const groupMessagesByDate = () => {
        const groups = {};
        messages.forEach(msg => {
            const dateObj = new Date(msg.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let dateStr = dateObj.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
            if (dateObj.toDateString() === today.toDateString()) {
                dateStr = 'Bugun';
            } else if (dateObj.toDateString() === yesterday.toDateString()) {
                dateStr = 'Kecha';
            }

            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(msg);
        });
        return groups;
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-primary/20 rounded-full animate-spin border-t-primary"></div>
        </div>
    );

    const messageGroups = groupMessagesByDate();

    // Determine the chat title and image
    let chatTitle = 'Chat';
    let partnerImage = null;
    let partnerSubtitle = `Buyurtma #${id?.slice(-6).toUpperCase()}`;

    // Based on whether current user is client or vendor
    if (user?.role === 'client') {
        chatTitle = order?.vendorId?.userId?.name || 'Usta';
        partnerImage = order?.vendorId?.userId?.profilePicture;
    } else {
        chatTitle = order?.clientId?.name || 'Mijoz';
        partnerImage = order?.clientId?.profilePicture;
    }

    return (
        <div className="bg-[#f2f4f7] min-h-screen flex flex-col font-sans">
            {/* Native App-like Header */}
            <div className="bg-white/80 backdrop-blur-md flex items-center p-3 border-b border-gray-100 shadow-sm sticky top-0 z-20">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-1 mr-1 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 border border-primary/10 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                        {partnerImage ? (
                            <img src={partnerImage} alt={chatTitle} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={22} className="text-primary/70" />
                        )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-bold text-[16px] text-gray-900 leading-tight truncate">
                            {chatTitle}
                        </span>
                        <span className="text-[12px] text-gray-400 font-medium truncate">
                            {partnerSubtitle}
                        </span>
                    </div>
                </div>
                {chatLocked && (
                    <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full ml-2">
                        <Lock size={14} className="text-red-500" />
                        <span className="text-[11px] font-bold text-red-500 uppercase tracking-wide">Yopilgan</span>
                    </div>
                )}
            </div>

            {/* Filter Warning Banner */}
            {filterWarning && (
                <div className="absolute top-16 left-4 right-4 z-10 bg-amber-50/95 backdrop-blur-sm border border-amber-200/50 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm transform translate-y-0 transition-transform animate-in fade-in slide-in-from-top-4">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertTriangle size={16} className="text-amber-600" />
                    </div>
                    <p className="text-[13px] font-semibold text-amber-800 leading-tight">
                        Xavfsizlik uchun raqam/username yashirildi.
                    </p>
                </div>
            )}

            {/* Locked Info Banner */}
            {chatLocked && !loading && messages.length > 0 && (
                <div className="mx-4 mt-3 bg-gray-100/80 border border-gray-200/60 rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                    <Lock size={14} className="text-gray-500 shrink-0" />
                    <p className="text-[12px] font-medium text-gray-600 leading-tight">
                        Bu chat yopilgan. Buyurtma yakunlangan yoki bekor qilingan.
                    </p>
                </div>
            )}

            {/* Messages Scroll Area */}
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 pb-28 pt-4 scroll-smooth"
            >
                {messages.length === 0 && !loading && (
                    <div className="h-full flex flex-col items-center justify-center mb-10 opacity-60">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Send size={32} className="text-primary/50 ml-1" />
                        </div>
                        <p className="font-bold text-gray-600 text-sm">Hali xabar yo'q</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-[200px] text-center">Savollaringiz bo'lsa darhol yozing!</p>
                    </div>
                )}

                {Object.entries(messageGroups).map(([dateLabel, msgs]) => (
                    <div key={dateLabel} className="flex flex-col gap-3">
                        {/* Date Divider */}
                        <div className="flex justify-center my-1.5">
                            <div className="bg-black/5 text-gray-500 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                                {dateLabel}
                            </div>
                        </div>

                        {/* Messages of the day */}
                        {msgs.map((msg, index) => {
                            const mine = isMyMessage(msg);
                            const prevMsg = index > 0 ? msgs[index - 1] : null;
                            const isConsecutive = prevMsg && isMyMessage(prevMsg) === mine;

                            // Bubble spacing logic
                            const mt = isConsecutive ? 'mt-0.5' : 'mt-2';

                            // Custom border radius for consecutive messages
                            const roundedClass = mine
                                ? `rounded-t-2xl rounded-bl-2xl ${isConsecutive ? 'rounded-br-md' : 'rounded-br-sm'}`
                                : `rounded-t-2xl rounded-br-2xl ${isConsecutive ? 'rounded-bl-md' : 'rounded-bl-sm'}`;

                            return (
                                <div
                                    key={msg._id}
                                    className={`flex flex-col max-w-[85%] ${mt} ${mine ? 'self-end items-end' : 'self-start items-start'}`}
                                >
                                    <div className={`relative px-4 py-2.5 shadow-sm inline-block group ${roundedClass} ${mine
                                            ? 'bg-gradient-to-br from-primary to-[#008c4e] text-white border border-primary/20'
                                            : 'bg-white text-gray-800 border border-black/5'
                                        }`}>

                                        <p className="text-[15px] leading-[1.4] break-words whitespace-pre-wrap font-medium">
                                            {msg.text}
                                        </p>

                                        {/* Status Area inside bubble */}
                                        <div className={`flex items-center justify-end gap-1.5 mt-1 ${mine ? 'text-primary-foreground/70' : 'text-gray-400'} text-[10px]`}>
                                            <span className="font-semibold tracking-wider">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>

                                            {mine && (
                                                <span className="flex items-center">
                                                    {msg.status === 'read' ? (
                                                        <CheckCheck size={14} className="text-white drop-shadow-sm" />
                                                    ) : (
                                                        <Check size={14} className="text-white/70" />
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        {/* Sensitive Info Badge */}
                                        {msg.isFiltered && mine && (
                                            <div className="mt-2 bg-black/10 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                                                <AlertTriangle size={12} className="text-white/90" />
                                                <span className="text-[10px] font-medium text-white/90">Ma'lumot yashirildi</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Invisible element to anchor scroll */}
                <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input Fixed Wrapper */}
            <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto z-30">
                {/* Gradient shadow pointing up */}
                <div className="h-4 w-full bg-gradient-to-t from-white to-transparent opacity-90"></div>

                <div className="bg-white px-3 py-2.5 pb-safe pb-8 border-t border-gray-100">
                    {!chatLocked ? (
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-end gap-2 bg-[#f4f6f8] rounded-[24px] p-1 border border-transparent focus-within:bg-white focus-within:border-primary/30 focus-within:shadow-[0_0_0_3px_rgba(0,166,90,0.1)] transition-all duration-300"
                        >
                            <textarea
                                ref={textareaRef}
                                placeholder="Xabar yozing..."
                                className="flex-1 bg-transparent py-3 px-4 outline-none text-[15px] font-medium text-gray-800 placeholder:text-gray-400 resize-none max-h-[120px] leading-tight w-full min-h-[48px]"
                                value={newMessage}
                                onChange={handleTextareaInput}
                                onKeyDown={handleKeyDown}
                                disabled={sending}
                                rows={1}
                            />

                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className={`shrink-0 w-[42px] h-[42px] flex items-center justify-center rounded-full transition-all duration-300 transform mb-0.5 mr-0.5 ${newMessage.trim() && !sending
                                        ? 'bg-primary text-white shadow-md active:scale-95'
                                        : 'bg-gray-200 text-gray-400'
                                    }`}
                            >
                                {sending
                                    ? <div className="w-5 h-5 border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" />
                                    : <Send size={18} className="ml-0.5" />
                                }
                            </button>
                        </form>
                    ) : (
                        <div className="bg-[#f2f4f7] rounded-3xl py-3.5 px-4 flex items-center justify-center gap-2">
                            <Lock size={15} className="text-gray-400" />
                            <span className="text-[12px] font-extrabold text-gray-500 uppercase tracking-widest">
                                Chat yopilgan
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
