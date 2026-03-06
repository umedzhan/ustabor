import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    LayoutDashboard, Users, ClipboardList, MessageSquare,
    Settings, BarChart2, Megaphone, UserPlus, Shield,
    ShieldAlert, Trash2, Edit, Check, X, Search,
    TrendingUp, DollarSign, ArrowLeft, Plus, Trash
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

const Admin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, logout } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isCollapsed, setIsCollapsed] = useState(false);

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

    // Categories
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', icon: 'Zap' });

    // Activity Logs
    const [activityLogs, setActivityLogs] = useState([]);

    // Search
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
    }, [location]);

    const fetchAll = useCallback(async () => {
        if (!token || user?.role !== 'admin') return;
        try {
            const [statsRes, usersRes, pendingRes, allVendorsRes, ordersRes, chatsRes, settingsRes, staffRes, reportRes, categoriesRes, transactionsRes, logsRes] = await Promise.all([
                axios.get(`${API_URL}/admin/stats`, { headers }),
                axios.get(`${API_URL}/admin/users`, { headers }),
                axios.get(`${API_URL}/admin/vendors?status=pending`, { headers }),
                axios.get(`${API_URL}/admin/vendors`, { headers }),
                axios.get(`${API_URL}/admin/orders`, { headers }),
                axios.get(`${API_URL}/admin/chats`, { headers }),
                axios.get(`${API_URL}/admin/settings`, { headers }),
                axios.get(`${API_URL}/admin/staff`, { headers }),
                axios.get(`${API_URL}/admin/reports`, { headers }),
                axios.get(`${API_URL}/admin/categories`, { headers }), // Protected admin endpoint
                axios.get(`${API_URL}/admin/transactions`, { headers }),
                axios.get(`${API_URL}/admin/logs`, { headers }),
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
            setCategories(categoriesRes.data);
            setTransactions(transactionsRes.data);
            setActivityLogs(logsRes.data);
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

    // Category actions
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/admin/categories`, newCategory, { headers });
            setNewCategory({ name: '', icon: 'Zap' });
            fetchAll();
        } catch (err) {
            alert('Xatolik!');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Kategoriyani o\'chirmoqchimisiz?')) return;
        await axios.delete(`${API_URL}/admin/categories/${id}`, { headers });
        fetchAll();
    };

    // Transaction actions
    const handleUpdateTransactionStatus = async (id, status) => {
        try {
            await axios.put(`${API_URL}/admin/transactions/${id}/status`, { status }, { headers });
            fetchAll();
        } catch (err) {
            alert('Xatolik!');
        }
    };

    // Search handler
    const handleGlobalSearch = async (val) => {
        setSearchTerm(val);
        if (val.length < 2) {
            setSearchResults(null);
            return;
        }
        setIsSearching(true);
        try {
            const { data } = await axios.get(`${API_URL}/admin/search?q=${val}`, { headers });
            setSearchResults(data);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
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

    return (
        <div className="flex bg-[#F8FAFC] min-h-screen text-gray-900">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <AdminSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    logout={logout}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />
            </div>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md hidden sm:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleGlobalSearch(e.target.value)}
                                placeholder="Foydalanuvchi, buyurtma yoki xizmat qidirish..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />

                            {/* Search Results Dropdown */}
                            {searchResults && (
                                <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-3xl border border-gray-100 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="p-4 max-h-[400px] overflow-y-auto no-scrollbar">
                                        {Object.entries(searchResults).some(([_, arr]) => arr.length > 0) ? (
                                            <div className="flex flex-col gap-4">
                                                {searchResults.users.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Foydalanuvchilar</p>
                                                        {searchResults.users.map(u => (
                                                            <div key={u._id} onClick={() => { setActiveTab('users'); setSearchResults(null); }} className="p-3 hover:bg-gray-50 rounded-2xl cursor-pointer flex items-center justify-between">
                                                                <span className="text-sm font-bold">{u.name}</span>
                                                                <span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{u.role}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {searchResults.vendors.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Ustalar</p>
                                                        {searchResults.vendors.map(v => (
                                                            <div key={v._id} onClick={() => { setActiveTab('moderation'); setSearchResults(null); }} className="p-3 hover:bg-gray-50 rounded-2xl cursor-pointer">
                                                                <span className="text-sm font-bold">{v.userId?.name}</span>
                                                                <p className="text-[10px] text-gray-400 truncate">{v.bio}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-center text-sm text-gray-400 py-4">Natija topilmadi</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
                            <div className="text-right">
                                <p className="text-sm font-black text-gray-900 leading-none">{user?.name}</p>
                                <p className="text-[10px] font-bold text-primary uppercase mt-1 tracking-wider">Super Admin</p>
                            </div>
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-primary border border-gray-200">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                        <button
                            onClick={() => logout(navigate)}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Chiqish"
                        >
                            <ArrowLeft className="rotate-180" size={20} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
                    <div className="max-w-[1400px] mx-auto">
                        {activeTab === 'dashboard' && stats && (
                            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Xush kelibsiz!</h2>
                                        <p className="text-gray-500 font-medium mt-1">Bugungi platforma holati va muhim ko'rsatkichlar.</p>
                                    </div>
                                    <div className="flex gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                                        <button className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-primary/20">Bugun</button>
                                        <button className="px-4 py-2 text-gray-400 text-[10px] font-black uppercase rounded-xl hover:bg-gray-50">Hafta</button>
                                        <button className="px-4 py-2 text-gray-400 text-[10px] font-black uppercase rounded-xl hover:bg-gray-50">Oy</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Jami Mijozlar', value: stats.stats.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50', icon: Users, growth: '+12%' },
                                        { label: 'Faol Ustalar', value: stats.stats.totalVendors, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: UserPlus, growth: '+5%' },
                                        { label: 'Jami Buyurtmalar', value: stats.stats.totalOrders, color: 'text-orange-600', bg: 'bg-orange-50', icon: ClipboardList, growth: '+25%' },
                                        { label: 'Sof Foyda', value: `${stats.stats.commission?.toLocaleString()} so'm`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: DollarSign, growth: '+18%' },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-2xl ${item.bg} group-hover:scale-110 transition-transform`}>
                                                    <item.icon size={24} className={item.color} />
                                                </div>
                                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{item.growth}</span>
                                            </div>
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">{item.label}</p>
                                            <h3 className={`text-2xl font-black mt-2 ${item.color} tracking-tight`}>{item.value}</h3>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="font-black text-gray-900">Oylik Ko'rsatkichlar</h3>
                                        </div>
                                        <div className="flex items-end gap-3 h-64">
                                            {stats.monthlyStats?.map((m, i) => {
                                                const maxVal = Math.max(...stats.monthlyStats.map(x => x.orders), 1);
                                                const height = (m.orders / maxVal) * 100;
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                                                        <div className="w-full relative flex justify-center items-end h-full">
                                                            <div className="w-8 bg-primary/10 rounded-t-xl group-hover:bg-primary/30 transition-all absolute bottom-0" style={{ height: '100%' }} />
                                                            <div className="w-8 bg-primary rounded-t-xl group-hover:scale-y-105 transition-all relative z-10" style={{ height: `${height}%` }}>
                                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded hidden group-hover:block whitespace-nowrap">
                                                                    {m.orders} zakaz
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{m.month.substring(0, 3)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                                            <h3 className="font-black text-lg mb-2 relative z-10">Tizim holati</h3>
                                            <div className="flex flex-col gap-4 relative z-10">
                                                <div className="flex justify-between items-center text-xs font-bold">
                                                    <span>Bot Faolligi</span>
                                                    <span>98%</span>
                                                </div>
                                                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-white rounded-full" style={{ width: '98%' }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex-1">
                                            <h3 className="font-black text-gray-900 mb-6">Kutilayotganlar</h3>
                                            <div className="flex flex-col gap-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                                                        <Shield size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900">{pendingVendors.length} ta usta</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tasdiqlash kutilmoqda</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'transactions' && (
                            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tranzaksiyalar</h2>
                                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Foydalanuvchi</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Summa</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {transactions.filter(t => transactionFilter === 'all' || t.type === transactionFilter).map(t => (
                                                <tr key={t._id}>
                                                    <td className="px-8 py-5 text-sm font-black">{t.userId?.name}</td>
                                                    <td className="px-8 py-5 text-sm font-black">{t.amount?.toLocaleString()} so'm</td>
                                                    <td className="px-8 py-5 text-right">
                                                        {t.type === 'payout' && t.status === 'pending' && (
                                                            <button onClick={() => handleUpdateTransactionStatus(t._id, 'completed')} className="p-2 bg-emerald-500 text-white rounded-xl"><Check size={14} /></button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Kategoriyalar</h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {categories.map(cat => (
                                        <div key={cat._id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex justify-between items-center">
                                            <span className="font-black">{cat.name}</span>
                                            <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 bg-red-50 text-red-500 rounded-xl"><Trash size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleCreateCategory} className="flex gap-4 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                                    <input value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} placeholder="Nomi" className="flex-1 bg-gray-50 p-4 rounded-2xl" />
                                    <button type="submit" className="bg-primary text-white px-8 rounded-2xl font-black">Qo'shish</button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Foydalanuvchilar</h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {users.filter(u => userFilter === 'all' || u.role === userFilter).map(u => (
                                        <div key={u._id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                            <p className="font-black">{u.name}</p>
                                            <div className="flex gap-2 mt-4">
                                                <button onClick={() => setEditingUser(u)} className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Edit size={14} /></button>
                                                <button onClick={() => handleDeleteUser(u._id)} className="p-2 bg-red-50 text-red-500 rounded-xl"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'moderation' && (
                            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Moderatsiya</h2>
                                {pendingVendors.map(v => (
                                    <div key={v._id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex justify-between items-center">
                                        <div>
                                            <p className="font-black text-xl">{v.userId?.name}</p>
                                            <p className="text-primary font-bold text-xs uppercase">{v.category?.name}</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={() => handleVerify(v._id, 'approved')} className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold">Tasdiqlash</button>
                                            <button onClick={() => handleVerify(v._id, 'rejected')} className="bg-red-50 text-red-500 px-6 py-2 rounded-xl font-bold">Rad etish</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Activity Logs</h2>
                                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Harakat</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Obyekt</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vaqt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {activityLogs.map(log => (
                                                <tr key={log._id}>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                                                                {log.adminId?.name?.charAt(0)}
                                                            </div>
                                                            <span className="text-sm font-black text-gray-900">{log.adminId?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-lg text-gray-600 uppercase tracking-tighter">
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm font-medium text-gray-500">{log.targetName}</td>
                                                    <td className="px-8 py-5 text-[11px] font-bold text-gray-400 whitespace-nowrap">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>

            {editingUser && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl">
                        <h3 className="text-2xl font-black text-gray-900 mb-8">Tahrirlash</h3>
                        <input className="w-full bg-gray-50 p-4 rounded-2xl mb-4 font-bold" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
                        <div className="flex gap-4">
                            <button onClick={handleUpdateUser} className="flex-1 bg-primary text-white py-4 rounded-2xl font-black">Saqlash</button>
                            <button onClick={() => setEditingUser(null)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-black">Yopish</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
