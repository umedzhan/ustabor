import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, MessageSquare,
    Settings, BarChart2, Megaphone, UserPlus,
    Shield, ArrowLeft, DollarSign, List
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, logout, isCollapsed, setIsCollapsed }) => {
    const navigate = useNavigate();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Foydalanuvchilar', icon: Users },
        { id: 'moderation', label: 'Moderatsiya', icon: Shield },
        { id: 'masters', label: 'Ustalar', icon: UserPlus },
        { id: 'categories', label: 'Kategoriyalar', icon: List },
        { id: 'orders', label: 'Buyurtmalar', icon: ClipboardList },
        { id: 'transactions', label: 'Tranzaksiyalar', icon: DollarSign },
        { id: 'chats', label: 'Chatlar', icon: MessageSquare },
        { id: 'reports', label: 'Hisobotlar', icon: BarChart2 },
        { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
        { id: 'staff', label: 'Xodimlar', icon: Shield },
        { id: 'settings', label: 'Sozlamalar', icon: Settings },
    ];

    return (
        <div className={`bg-white border-r border-gray-100 flex flex-col transition-all duration-300 sticky top-0 h-screen ${isCollapsed ? 'w-20' : 'w-72'}`}>
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-50 flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-primary/20">U</div>
                {!isCollapsed && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <h1 className="text-lg font-black text-gray-900 leading-none">USTABOR</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Admin Panel</p>
                    </div>
                )}
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 no-scrollbar">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`group flex items-center gap-3 p-3.5 rounded-2xl transition-all relative ${activeTab === item.id
                                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'group-hover:text-primary transition-colors'} />
                        {!isCollapsed && <span className="text-sm font-bold truncate">{item.label}</span>}
                        {activeTab === item.id && !isCollapsed && (
                            <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-50 flex flex-col gap-2">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center gap-3 p-3.5 text-gray-400 hover:bg-gray-50 hover:text-gray-900 rounded-2xl transition-all"
                >
                    <ArrowLeft size={22} className={`transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
                    {!isCollapsed && <span className="text-sm font-bold">Kichraytirish</span>}
                </button>
                <button
                    onClick={() => logout(navigate)}
                    className="flex items-center gap-3 p-3.5 text-red-400 hover:bg-red-50 rounded-2xl transition-all"
                >
                    <div className="w-[22px] h-[22px] flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-red-400 rounded-full border-t-transparent animate-spin hidden group-active:block"></div>
                        <ArrowLeft size={22} className="rotate-180" />
                    </div>
                    {!isCollapsed && <span className="text-sm font-bold">Chiqish</span>}
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
