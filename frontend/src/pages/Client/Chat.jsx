import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const Chat = () => {
    const { id } = useParams(); // Vendor ID
    const navigate = useNavigate();
    const { user } = useAuth();
    const [vendor, setVendor] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Fetch vendor info
        const fetchVendor = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/vendors/${id}`);
                setVendor(data);
            } catch (error) {
                console.error("Error fetching vendor", error);
            }
        };
        fetchVendor();

        // Dummy messages for UI demonstration
        setMessages([
            { id: 1, text: "Assalomu alaykum!", sender: 'client', time: '10:00' },
            { id: 2, text: "Va alaykum assalom, qanday yordam bera olaman?", sender: 'vendor', time: '10:05' }
        ]);
    }, [id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg = {
            id: Date.now(),
            text: newMessage,
            sender: 'client',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, msg]);
        setNewMessage('');

        // In a real app, send to backend via WebSocket or API
        // axios.post(`${API_URL}/chat/send`, { vendorId: id, message: newMessage });
    };

    if (!vendor) return <div className="min-h-screen flex justify-center items-center"><div className="w-8 h-8 border-2 border-primary rounded-full animate-spin border-t-transparent"></div></div>;

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Chat Header */}
            <div className="bg-white flex items-center p-4 border-b border-gray-100 shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <div className="flex items-center gap-3 ml-2 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                        {vendor.portfolio && vendor.portfolio[0] ? (
                            <img src={vendor.portfolio[0]} alt="vendor" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <UserIcon size={20} />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight">{vendor.userId?.name}</span>
                        <span className="text-xs text-primary font-medium">{vendor.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${msg.sender === 'client' ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                        <div
                            className={`px-4 py-2.5 rounded-2xl ${msg.sender === 'client'
                                ? 'bg-primary text-white rounded-tr-sm'
                                : 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'
                                }`}
                        >
                            <p className="text-[15px] leading-relaxed wrap-break-words">{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-3 border-t border-gray-100 w-full mb-4">
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
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2.5 bg-primary text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transition-colors shadow-sm"
                    >
                        <Send size={18} className="ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
