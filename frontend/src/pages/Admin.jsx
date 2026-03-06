import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    LayoutDashboard, Users, ClipboardList, MessageSquare,
    Settings, BarChart2, Megaphone, UserPlus, Shield,
    ShieldAlert, Trash2, Edit, Check, X, Eye, ChevronRight,
    TrendingUp, DollarSign, Star, Upload, ArrowLeft
} from 'lucide-react';

const Admin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, logout } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('dashboard');

    // Dashboard data
    const [stats, setStats] = useState(null);

    // Users
    const [users, setUsers] = useState([]);
    const [userFilter, setUserFilter] = useState('all');
    const [editingUser, setEditingUser] = useState(null);

    // Vendors / Moderation
    const [pendingVendors, setPendingVendors] = useState([]);
    const [allVendors, setAllVendors] = useState([]);

    // Orders
    const [orders, setOrders] = useState([]);

    // Chats
    const [chats, setChats] = useState([]);
    const [openChat, setOpenChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);

    // Broadcast
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastTarget, setBroadcastTarget] = useState('all');

    // Settings
    const [settings, setSettings] = useState({});
    const [settingsSaving, setSettingsSaving] = useState(false);

    // Staff
    const [staffList, setStaffList] = useState([]);
    const [newStaff, setNewStaff] = useState({ telegramId: '', name: '', phone: '' });

    // Reports
    const [reportData, setReportData] = useState(null);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
    }, [location]);

    const fetchAll = useCallback(async () => {
        if (!token || user?.role !== 'admin') return;
        try {
            const [statsRes, usersRes, pendingRes, allVendorsRes, ordersRes, chatsRes, settingsRes, staffRes, reportRes] = await Promise.all([
                axios.get(`${API_URL}/admin/stats`, { headers }),
                axios.get(`${API_URL}/admin/users`, { headers }),
                axios.get(`${API_URL}/admin/vendors?status=pending`, { headers }),
                axios.get(`${API_URL}/admin/vendors`, { headers }),
                axios.get(`${API_URL}/admin/orders`, { headers }),
                axios.get(`${API_URL}/admin/chats`, { headers }),
                axios.get(`${API_URL}/admin/settings`, { headers }),
                axios.get(`${API_URL}/admin/staff`, { headers }),
                axios.get(`${API_URL}/admin/reports`, { headers }),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setPendingVendors(pendingRes.data);
            setAllVendors(allVendorsRes.data);
            setOrders(ordersRes.data);
            setChats(chatsRes.data);
            setSettings(settingsRes.data);
            setStaffList(staffRes.data);
            setReportData(reportRes.data);
        } catch (err) {
            console.error('Admin fetch error:', err);
        }
    }, [token, user]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Moderation
    const handleVerify = async (vendorId, status) => {
        await axios.put(`${API_URL}/admin/vendors/${vendorId}/verify`, { status }, { headers });
        fetchAll();
    };

    // User actions
    const handleDeleteUser = async (id) => {
        if (!window.confirm('O\'chirmoqchimisiz?')) return;
        await axios.delete(`${API_URL}/admin/users/${id}`, { headers });
        fetchAll();
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        await axios.put(`${API_URL}/admin/users/${editingUser._id}`, editingUser, { headers });
        setEditingUser(null);
        fetchAll();
    };

    // Order actions
    const handleUpdateOrderStatus = async (id, status) => {
        await axios.put(`${API_URL}/admin/orders/${id}`, { status }, { headers });
        fetchAll();
    };

    const handleDeleteOrder = async (id) => {
        if (!window.confirm('Buyurtmani o\'chirmoqchimisiz?')) return;
        await axios.delete(`${API_URL}/admin/orders/${id}`, { headers });
        fetchAll();
    };

    // Chat view
    const handleOpenChat = async (orderId) => {
        setOpenChat(orderId);
        const { data } = await axios.get(`${API_URL}/admin/chats/${orderId}`, { headers });
        setChatMessages(data.messages || []);
    };

    // Broadcast
    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastMsg.trim()) return;
        await axios.post(`${API_URL}/admin/broadcast`, { message: broadcastMsg, targetRole: broadcastTarget }, { headers });
        alert('Xabar yuborildi!');
        setBroadcastMsg('');
    };

    // Settings save
    const handleSaveSettings = async () => {
        setSettingsSaving(true);
        try {
            await axios.put(`${API_URL}/admin/settings`, settings, { headers });
            alert('Sozlamalar saqlandi!');
        } catch (err) {
            alert('Xatolik!');
        } finally {
            setSettingsSaving(false);
        }
    };

    // Logo upload
    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('image', file);
        const { data } = await axios.post(`${API_URL}/admin/upload-logo`, fd, {
            headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        setSettings(prev => ({ ...prev, logoUrl: data.url }));
    };

    // Staff create
    const handleCreateStaff = async (e) => {
        e.preventDefault();
        await axios.post(`${API_URL}/admin/staff`, newStaff, { headers });
        setNewStaff({ telegramId: '', name: '', phone: '' });
        fetchAll();
    };

    // Vendor delete
    const handleDeleteVendor = async (id) => {
        if (!window.confirm('Ustani o\'chirmoqchimisiz?')) return;
        await axios.delete(`${API_URL}/admin/vendors/${id}`, { headers });
        fetchAll();
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-[80vh] text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 text-3xl font-bold">!</div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Kirish taqiqlangan</h1>
                <p className="text-gray-500 text-sm">Faqat adminlar uchun</p>
                <button onClick={() => navigate('/')} className="mt-6 bg-primary text-white px-6 py-2 rounded-xl font-bold">Bosh sahifaga</button>
            </div>
        );
    }

    const TABS = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: `Foydalanuvchilar (${users.length})`, icon: Users },
        { id: 'moderation', label: `Moderatsiya (${pendingVendors.length})`, icon: Shield },
        { id: 'masters', label: `Ustalar (${allVendors.length})`, icon: ShieldAlert },
        { id: 'orders', label: `Zakazlar (${orders.length})`, icon: ClipboardList },
        { id: 'chats', label: 'Chatlar', icon: MessageSquare },
        { id: 'reports', label: 'Hisobot', icon: BarChart2 },
        { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
        { id: 'staff', label: 'Xodimlar', icon: UserPlus },
        { id: 'settings', label: 'Sozlamalar', icon: Settings },
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-30 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="logo" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm">U</div>
                    )}
                    <div>
                        <h1 className="text-sm font-black text-gray-900">{settings.appName || 'USTABOR'}</h1>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Admin Panel</p>
                    </div>
                </div>
                <button onClick={() => logout(navigate)} className="text-[10px] text-red-500 font-black px-3 py-1.5 bg-red-50 rounded-lg uppercase flex items-center gap-1">
                    <ArrowLeft size={12} />
                    Chiqish
                </button>
            </div>

            {/* Tab Navigation - Horizontal Scroll */}

            <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar sticky top-[57px] z-20 bg-gray-50 border-b border-gray-100">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shadow-sm ${activeTab === tab.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-100'}`}
                    >
                        <tab.icon size={12} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-4">
                {/* ======================== DASHBOARD ======================== */}
                {activeTab === 'dashboard' && stats && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Mijozlar', value: stats.stats.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Ustalar', value: stats.stats.totalVendors, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { label: 'Zakazlar', value: stats.stats.totalOrders, color: 'text-primary', bg: 'bg-primary/10' },
                                { label: `Komissiya (${stats.stats.commissionRate}%)`, value: `${stats.stats.commission?.toLocaleString() || 0} so'm`, color: 'text-green-600', bg: 'bg-green-50' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${item.color} block mb-2`}>{item.label}</span>
                                    <span className={`text-xl font-black ${item.color}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Monthly Chart */}
                        {stats.monthlyStats && (
                            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Oylik statistika</p>
                                <div className="flex flex-col gap-2">
                                    {stats.monthlyStats.map((m, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-gray-500 w-12">{m.month}</span>
                                            <div className="flex-1 flex gap-1 h-3">
                                                <div className="bg-blue-400 rounded-full h-full" style={{ width: `${(m.users / Math.max(...stats.monthlyStats.map(x => x.users + x.vendors), 1)) * 100}%` }} />
                                                <div className="bg-primary rounded-full h-full" style={{ width: `${(m.vendors / Math.max(...stats.monthlyStats.map(x => x.users + x.vendors), 1)) * 100}%` }} />
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-400 w-12 text-right">{m.orders} zakas</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-4 mt-3">
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-400 rounded-full" /><span className="text-[9px] text-gray-400">Mijozlar</span></div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-primary rounded-full" /><span className="text-[9px] text-gray-400">Ustalar</span></div>
                                </div>
                            </div>
                        )}

                        {/* Recent Orders */}
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">So'ngi zakazlar</h2>
                            {stats.recentOrders.map(o => (
                                <div key={o._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl mb-2">
                                    <div>
                                        <p className="text-xs font-black text-gray-900">{o.clientId?.name || 'Mijoz'}</p>
                                        <p className="text-[9px] text-gray-400 uppercase font-bold">{o.status}</p>
                                    </div>
                                    <span className="text-xs font-black text-primary">{o.price?.toLocaleString()} so'm</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ======================== USERS ======================== */}
                {activeTab === 'users' && (
                    <div className="flex flex-col gap-3">
                        {/* Filter */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {['all', 'client', 'vendor', 'admin', 'staff'].map(r => (
                                <button key={r} onClick={() => setUserFilter(r)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap border ${userFilter === r ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-100'}`}>
                                    {r === 'all' ? 'Hammasi' : r}
                                </button>
                            ))}
                        </div>

                        {/* Edit Modal */}
                        {editingUser && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                                <div className="bg-white w-full max-w-md mx-auto rounded-t-[2rem] p-6 flex flex-col gap-4">
                                    <h3 className="font-black text-gray-900">Foydalanuvchini tahrirlash</h3>
                                    <input className="border border-gray-200 p-3 rounded-2xl text-sm font-bold" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} placeholder="Ism" />
                                    <input className="border border-gray-200 p-3 rounded-2xl text-sm font-bold" value={editingUser.phone || ''} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} placeholder="Telefon" />
                                    <select className="border border-gray-200 p-3 rounded-2xl text-sm font-bold" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}>
                                        {['none', 'client', 'vendor', 'admin', 'staff'].map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                    <div className="flex gap-3">
                                        <button onClick={handleUpdateUser} className="flex-1 bg-primary text-white py-3 rounded-2xl font-black text-sm">Saqlash</button>
                                        <button onClick={() => setEditingUser(null)} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-2xl font-black text-sm">Bekor</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {users.filter(u => userFilter === 'all' || u.role === userFilter).map(u => (
                            <div key={u._id} className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-sm shrink-0">
                                    {u.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm text-gray-900 truncate">{u.name}</p>
                                    <p className="text-[9px] text-gray-400">{u.phone || 'Tel yo\'q'} · {u.role}</p>
                                    <p className="text-[9px] text-gray-300">{u.telegramId}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingUser(u)} className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Edit size={14} /></button>
                                    <button onClick={() => handleDeleteUser(u._id)} className="p-2 bg-red-50 text-red-500 rounded-xl"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ======================== MODERATION ======================== */}
                {activeTab === 'moderation' && (
                    <div className="flex flex-col gap-4">
                        {pendingVendors.length === 0 ? (
                            <div className="text-center p-14 bg-white rounded-[2.5rem] text-gray-400 text-xs font-bold border border-gray-100">Arizalar yo'q</div>
                        ) : pendingVendors.map(v => (
                            <div key={v._id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black text-gray-900">{v.userId?.name}</h3>
                                        <p className="text-[10px] text-primary font-black uppercase">{v.category?.name}</p>
                                        <p className="text-xs text-gray-400">{v.userId?.phone}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => handleVerify(v._id, 'approved')} className="bg-green-500 text-white text-[9px] font-black uppercase px-4 py-2 rounded-xl flex items-center gap-1"><Check size={12} /> Tasdiqlash</button>
                                        <button onClick={() => handleVerify(v._id, 'rejected')} className="bg-red-50 text-red-500 text-[9px] font-black uppercase px-4 py-2 rounded-xl flex items-center gap-1"><X size={12} /> Rad</button>
                                    </div>
                                </div>
                                {v.aboutText && <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-2xl">{v.aboutText}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {/* ======================== MASTERS ======================== */}
                {activeTab === 'masters' && (
                    <div className="flex flex-col gap-3">
                        {allVendors.map(v => (
                            <div key={v._id} className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center text-primary font-black">
                                    {v.profilePicture ? <img src={v.profilePicture} alt="" className="w-full h-full object-cover" /> : v.userId?.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="font-black text-sm text-gray-900 truncate">{v.userId?.name}</p>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase ${v.verificationStatus === 'approved' ? 'bg-green-50 text-green-500' : v.verificationStatus === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>{v.verificationStatus}</span>
                                    </div>
                                    <p className="text-[10px] text-primary font-black">{v.category?.name}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[9px] text-gray-400">⭐ {v.rating?.toFixed(1) || '0'}</span>
                                        <span className="text-[9px] text-gray-400">👁 {v.viewCount || 0}</span>
                                        <span className="text-[9px] text-gray-400">📋 {v.reviewCount || 0} sharh</span>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteVendor(v._id)} className="p-2 bg-red-50 text-red-500 rounded-xl shrink-0"><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ======================== ORDERS ======================== */}
                {activeTab === 'orders' && (
                    <div className="flex flex-col gap-3">
                        {orders.map(o => (
                            <div key={o._id} className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-black text-sm text-gray-900">{o.serviceDetails?.name || 'Xizmat'}</p>
                                        <p className="text-[10px] text-gray-400">Mijoz: {o.clientId?.name}</p>
                                        <p className="text-[10px] text-gray-400">Usta: {o.vendorId?.userId?.name}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-sm font-black text-primary">{o.price?.toLocaleString()} so'm</span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase ${o.status === 'completed' ? 'bg-green-50 text-green-500' : o.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>{o.status}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <select onChange={e => handleUpdateOrderStatus(o._id, e.target.value)} value={o.status} className="flex-1 text-[10px] font-black border border-gray-200 rounded-xl p-2 bg-gray-50">
                                        {['pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <button onClick={() => handleDeleteOrder(o._id)} className="p-2 bg-red-50 text-red-500 rounded-xl"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ======================== CHATS ======================== */}
                {activeTab === 'chats' && (
                    <div className="flex flex-col gap-3">
                        {openChat ? (
                            <div>
                                <button onClick={() => { setOpenChat(null); setChatMessages([]); }} className="mb-4 text-[11px] font-black text-primary flex items-center gap-1">← Orqaga</button>
                                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
                                    {chatMessages.map(msg => (
                                        <div key={msg._id} className="flex flex-col">
                                            <span className="text-[9px] font-black text-gray-400">{msg.senderId?.name} ({msg.senderId?.role})</span>
                                            <div className="bg-gray-50 px-4 py-2.5 rounded-2xl mt-1">
                                                <p className="text-sm text-gray-800">{msg.text}</p>
                                                {msg.isFiltered && <p className="text-[9px] text-amber-500 mt-1">⚠️ Ma'lumot yashirildi</p>}
                                            </div>
                                            <span className="text-[9px] text-gray-300 mt-1">{new Date(msg.createdAt).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            chats.length === 0 ? (
                                <div className="text-center p-14 bg-white rounded-[2rem] text-gray-400 text-xs font-bold border border-gray-100">Chatlar yo'q</div>
                            ) : chats.map(chat => (
                                <button key={chat._id} onClick={() => handleOpenChat(chat._id)} className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-3 text-left w-full">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><MessageSquare size={18} className="text-primary" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm text-gray-900 truncate">{chat.order?.clientId?.name} ↔ {chat.order?.vendorId?.userId?.name}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{chat.lastMessage}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-black text-gray-300">{chat.messageCount} xabar</span>
                                        <ChevronRight size={14} className="text-gray-300 mt-1" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {/* ======================== REPORTS ======================== */}
                {activeTab === 'reports' && reportData && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Jami aylanma</p>
                                <p className="text-xl font-black text-primary">{reportData.grossRevenue?.toLocaleString() || 0} so'm</p>
                            </div>
                            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Komissiya ({reportData.commissionRate}%)</p>
                                <p className="text-xl font-black text-green-600">{reportData.commission?.toLocaleString() || 0} so'm</p>
                            </div>
                            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Jami zakazlar</p>
                                <p className="text-xl font-black text-gray-900">{reportData.totalOrders}</p>
                            </div>
                            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Yakunlangan</p>
                                <p className="text-xl font-black text-gray-900">{reportData.completedOrders}</p>
                            </div>
                        </div>

                        {/* Top Vendors */}
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Top Ustalar (daromad bo'yicha)</p>
                            {reportData.topVendors?.map((v, i) => (
                                <div key={v.vendorId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <span className="text-[10px] font-black text-gray-500">#{i + 1} Usta</span>
                                    <div className="flex gap-4">
                                        <span className="text-[10px] text-gray-400">{v.orders} zakas</span>
                                        <span className="text-[10px] font-black text-primary">{v.earned?.toLocaleString()} so'm</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ======================== BROADCAST ======================== */}
                {activeTab === 'broadcast' && (
                    <form onSubmit={handleBroadcast} className="bg-white p-6 rounded-[2.5rem] flex flex-col gap-5 border border-gray-100 shadow-sm">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">Kimga yuborish</label>
                            <select value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-2xl text-sm font-bold">
                                <option value="all">Hammaga</option>
                                <option value="client">Faqat mijozlarga</option>
                                <option value="vendor">Faqat ustalarga</option>
                                <option value="staff">Xodimlarga</option>
                                <option value="admin">Adminlarga</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">Xabar matni</label>
                            <textarea required value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows="6" placeholder="Xabar matni..." />
                        </div>
                        <button type="submit" className="bg-primary text-white py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Yuborish</button>
                    </form>
                )}

                {/* ======================== STAFF ======================== */}
                {activeTab === 'staff' && (
                    <div className="flex flex-col gap-4">
                        <form onSubmit={handleCreateStaff} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yangi xodim qo'shish</p>
                            <input required className="border border-gray-200 p-3 rounded-2xl text-sm font-bold" value={newStaff.telegramId} onChange={e => setNewStaff({ ...newStaff, telegramId: e.target.value })} placeholder="Telegram ID" />
                            <input required className="border border-gray-200 p-3 rounded-2xl text-sm font-bold" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="Ism" />
                            <input className="border border-gray-200 p-3 rounded-2xl text-sm font-bold" value={newStaff.phone} onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })} placeholder="Telefon" />
                            <button type="submit" className="bg-primary text-white py-3 rounded-2xl font-black text-sm">Qo'shish</button>
                        </form>

                        <div className="flex flex-col gap-2">
                            {staffList.map(s => (
                                <div key={s._id} className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 font-black text-sm">{s.name?.charAt(0)}</div>
                                    <div className="flex-1">
                                        <p className="font-black text-sm text-gray-900">{s.name}</p>
                                        <p className="text-[9px] text-gray-400">{s.role} · {s.phone || 'Tel yo\'q'}</p>
                                    </div>
                                    <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase ${s.role === 'admin' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'}`}>{s.role}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ======================== SETTINGS ======================== */}
                {activeTab === 'settings' && (
                    <div className="flex flex-col gap-4">
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ilova sozlamalari</p>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 block mb-1">Ilova nomi</label>
                                <input value={settings.appName || ''} onChange={e => setSettings({ ...settings, appName: e.target.value })} className="w-full border border-gray-200 p-3 rounded-2xl text-sm font-bold" />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 block mb-1">Komissiya foizi (%)</label>
                                <input type="number" min="0" max="100" value={settings.commissionRate || 10} onChange={e => setSettings({ ...settings, commissionRate: Number(e.target.value) })} className="w-full border border-gray-200 p-3 rounded-2xl text-sm font-bold" />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 block mb-1">Logotip</label>
                                {settings.logoUrl && <img src={settings.logoUrl} alt="logo" className="w-20 h-20 rounded-2xl object-cover mb-2" />}
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-200 rounded-2xl p-3">
                                    <Upload size={16} className="text-primary" />
                                    <span className="text-sm font-bold text-gray-600">Logotip yuklash</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                </label>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-sm font-bold text-gray-700">Texnik ishlar rejimi</label>
                                <button onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                    className={`w-12 h-6 rounded-full transition-all ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <button onClick={handleSaveSettings} disabled={settingsSaving} className="bg-primary text-white py-3 rounded-2xl font-black text-sm disabled:opacity-50">
                                {settingsSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
