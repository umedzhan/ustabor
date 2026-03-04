import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Megaphone, Settings, LayoutDashboard, CheckCircle, Wallet, User, Clock, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
    const { user } = useAuth();

    if (!user || (user && !user.onboarded && user.role !== 'admin')) return null;

    const renderNavItems = () => {
        if (user.role === 'admin') {
            return (
                <>
                    <NavLink to="/admin" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                        <LayoutDashboard size={24} />
                        <span className="text-[10px] font-bold">Monitor</span>
                    </NavLink>
                    <NavLink to="/admin?tab=moderation" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                        <ClipboardList size={24} />
                        <span className="text-[10px] font-bold">Arizalar</span>
                    </NavLink>
                    <NavLink to="/admin?tab=broadcast" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                        <Megaphone size={24} />
                        <span className="text-[10px] font-bold">Broadcast</span>
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                        <User size={24} />
                        <span className="text-[10px] font-bold">Profil</span>
                    </NavLink>
                </>
            );
        }

        if (user.role === 'vendor') {
            return (
                <>
                    <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                        <Home size={24} />
                        <span className="text-[10px] font-bold">Asosiy</span>
                    </NavLink>
                    <NavLink to="/vendor/dashboard" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                        <LayoutDashboard size={24} />
                        <span className="text-[10px] font-bold">Panel</span>
                    </NavLink>
                    <NavLink to="/orders" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                        <Clock size={24} />
                        <span className="text-[10px] font-bold">Buyurtmalar</span>
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                        <User size={24} />
                        <span className="text-[10px] font-bold">Profil</span>
                    </NavLink>
                </>
            );
        }

        // Client (Default)
        return (
            <>
                <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <Home size={24} />
                    <span className="text-[10px] font-bold">Asosiy</span>
                </NavLink>
                <NavLink to="/orders" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <Clock size={24} />
                    <span className="text-[10px] font-bold">Buyurtmalar</span>
                </NavLink>
                <NavLink to="/chats" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <MessageCircle size={24} />
                    <span className="text-[10px] font-bold">Chatlar</span>
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <User size={24} />
                    <span className="text-[10px] font-bold">Profil</span>
                </NavLink>
            </>
        );
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-between px-6 pb-safe pt-2 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
            {renderNavItems()}
        </div>
    );
};

export default BottomNav;
