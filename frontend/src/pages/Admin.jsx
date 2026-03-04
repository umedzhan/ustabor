import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [pendingVendors, setPendingVendors] = useState([]);
    const [allVendors, setAllVendors] = useState([]);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastTarget, setBroadcastTarget] = useState('all');

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        rating: 5,
        reviewCount: 0,
        hourlyRate: 50000,
        experienceYears: 1,
        completedJobs: 0,
        location: '',
        aboutText: '',
        services: '',
        imageUrl: '',
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
    }, [location]);

    useEffect(() => {
        if (token && user?.role === 'admin') {
            fetchStats();
            fetchCategories();
            fetchPendingVendors();
            fetchAllVendors();
        }
    }, [token, user]);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(data);
        } catch (err) { console.error("Stats error", err); }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/categories`);
            setCategories(data);
            if (data.length > 0) setFormData(prev => ({ ...prev, category: data[0]._id }));
        } catch (err) { console.error(err); }
    };

    const fetchPendingVendors = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/admin/vendors?status=pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingVendors(data);
        } catch (err) { console.error(err); }
    };

    const fetchAllVendors = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/admin/vendors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllVendors(data);
        } catch (err) { console.error(err); }
    };

    const handleVerify = async (vendorId, status) => {
        try {
            await axios.put(`${API_URL}/admin/vendors/${vendorId}/verify`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Usta holati: ${status}`);
            fetchPendingVendors();
            fetchStats();
        } catch (err) { alert("Xatolik yuz berdi"); }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/admin/broadcast`, { message: broadcastMsg, targetRole: broadcastTarget }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Xabar yuborildi!");
            setBroadcastMsg('');
        } catch (err) { alert("Xatolik yuz berdi"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                services: formData.services.split(',').map(s => s.trim()).filter(s => s !== '')
            };
            await axios.post(`${API_URL}/vendors`, dataToSubmit, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Usta muvaffaqiyatli qo'shildi!");
            setActiveTab('moderation');
            fetchStats();
        } catch (err) { console.error(err); alert("Xatolik yuz berdi"); }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-[80vh] text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 text-3xl font-bold">!</div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Kirish taqiqlangan</h1>
                <p className="text-gray-500 text-sm">Ushbu sahifa faqat adminlar uchun.</p>
                <button onClick={() => navigate('/')} className="mt-6 bg-primary text-white px-6 py-2 rounded-xl font-bold">Bosh sahibaga qaytish</button>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-50 min-h-screen pb-10">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-xl font-black text-primary tracking-tighter italic">USTABOR ADMIN</h1>
                <div className="flex gap-4 items-center">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">Admin Panel</span>
                    <button onClick={logout} className="text-[10px] text-red-500 font-black px-3 py-1.5 bg-red-50 rounded-lg uppercase">Chiqish</button>
                </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${activeTab === 'dashboard' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-100'}`}>Monitor</button>
                <button onClick={() => setActiveTab('moderation')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${activeTab === 'moderation' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-100'}`}>Moderatsiya ({pendingVendors.length})</button>
                <button onClick={() => setActiveTab('masters')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${activeTab === 'masters' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-100'}`}>Ustalar ({allVendors.length})</button>
                <button onClick={() => setActiveTab('add')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${activeTab === 'add' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-100'}`}>Usta qo'shish</button>
                <button onClick={() => setActiveTab('broadcast')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${activeTab === 'broadcast' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-100'}`}>Broadcast</button>
            </div>

            {activeTab === 'dashboard' && stats && (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
                            <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Mijozlar</span>
                            <span className="text-lg font-black text-gray-900">{stats.stats.totalUsers}</span>
                        </div>
                        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
                            <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Ustalar</span>
                            <span className="text-lg font-black text-gray-900">{stats.stats.totalVendors}</span>
                        </div>
                        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
                            <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Buyurtmalar</span>
                            <span className="text-lg font-black text-primary">{stats.stats.totalOrders}</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">So'nggi buyurtmalar</h2>
                        <div className="flex flex-col gap-3">
                            {stats.recentOrders.length === 0 ? <p className="text-xs text-gray-400 italic">Hali buyurtmalar yo'q</p> : stats.recentOrders.map(o => (
                                <div key={o._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-gray-900">{o.clientId?.name || 'Mijoz'}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">{o.status}</span>
                                    </div>
                                    <span className="text-xs font-black text-primary">{o.price.toLocaleString()} so'm</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">So'nggi fikrlar</h2>
                        <div className="flex flex-col gap-3">
                            {stats.recentReviews.length === 0 ? <p className="text-xs text-gray-400 italic">Hali fikrlar yo'q</p> : stats.recentReviews.map(r => (
                                <div key={r._id} className="p-3 bg-gray-50 rounded-2xl flex flex-col gap-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-900">{r.clientId?.name || 'Mijoz'}</span>
                                        <div className="flex text-amber-500 font-bold text-[10px]">{"⭐️".repeat(r.review.rating)}</div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 italic leading-tight">"{r.review.comment}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'moderation' && (
                <div className="flex flex-col gap-4">
                    {pendingVendors.length === 0 ? (
                        <div className="text-center p-14 bg-white rounded-[2.5rem] text-gray-400 text-xs font-bold border border-gray-100 shadow-sm">Hozircha arizalar yo'q</div>
                    ) : (
                        pendingVendors.map(v => (
                            <div key={v._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-black text-gray-900">{v.userId?.name}</h3>
                                        <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">{v.category?.name}</p>
                                        <p className="text-xs font-bold text-gray-400 mt-2">{v.userId?.phone || 'Tel kiritilmagan'}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => handleVerify(v._id, 'approved')} className="bg-green-500 text-white text-[9px] font-black uppercase tracking-tighter px-4 py-2.5 rounded-xl shadow-lg shadow-green-500/20">Tasdiqlash</button>
                                        <button onClick={() => handleVerify(v._id, 'rejected')} className="bg-red-50 text-red-500 text-[9px] font-black uppercase tracking-tighter px-4 py-2.5 rounded-xl">Rad etish</button>
                                    </div>
                                </div>
                                {v.documents?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <p className="text-[9px] font-black text-gray-400 mb-3 uppercase tracking-widest">Hujjatlar:</p>
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                            {v.documents.map((doc, idx) => (
                                                <a key={idx} href={doc} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl text-[9px] font-bold text-blue-500 border border-gray-100 underline decoration-blue-500/30">Hujjat {idx + 1}</a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'masters' && (
                <div className="flex flex-col gap-4">
                    {allVendors.length === 0 ? (
                        <div className="text-center p-14 bg-white rounded-[2.5rem] text-gray-400 text-xs font-bold border border-gray-100 shadow-sm">Ustalar yo'q</div>
                    ) : (
                        allVendors.map(v => (
                            <div key={v._id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative shrink-0">
                                    {v.profilePicture ? (
                                        <img src={v.profilePicture} alt="" className="w-full h-full object-cover" />
                                    ) : v.portfolio?.length > 0 ? (
                                        <img src={v.portfolio[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary/20 font-black text-xl">{v.userId?.name?.charAt(0)}</div>
                                    )}
                                    <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${v.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-black text-sm text-gray-900 truncate">{v.userId?.name}</h3>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${v.verificationStatus === 'approved' ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'}`}>
                                            {v.verificationStatus}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">{v.category?.name}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-bold text-gray-400">Reyting:</span>
                                            <span className="text-[10px] font-black text-gray-900">{v.rating?.toFixed(1) || '5.0'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-bold text-gray-400">Status:</span>
                                            <span className={`text-[10px] font-black ${v.isOnline ? 'text-green-500' : 'text-gray-400'}`}>{v.isOnline ? 'Online' : 'Offline'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            {activeTab === 'add' && (
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] flex flex-col gap-5 shadow-sm border border-gray-100">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Usta FISH</label>
                        <input required name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all" placeholder="Ism familiya..." />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Soha (Kategoriya)</label>
                        <select required name="category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none appearance-none">
                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Tajriba (yosh)</label>
                            <input type="number" name="experienceYears" value={formData.experienceYears} onChange={e => setFormData({ ...formData, experienceYears: e.target.value })} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Narxi (so'm)</label>
                            <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Tavsif</label>
                        <textarea name="aboutText" value={formData.aboutText} onChange={e => setFormData({ ...formData, aboutText: e.target.value })} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold resize-none" rows="3" placeholder="Usta haqida ma'lumot..."></textarea>
                    </div>

                    <button type="submit" className="bg-primary text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/30 mt-4 active:scale-95 transition-all">Usta qo'shish</button>
                </form>
            )}

            {activeTab === 'broadcast' && (
                <form onSubmit={handleBroadcast} className="bg-white p-8 rounded-[3rem] flex flex-col gap-6 shadow-sm border border-gray-100">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 mb-3 block uppercase tracking-[0.2em] ml-1">Kimga yuborish:</label>
                        <select value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none">
                            <option value="all">Barcha foydalanuvchilar</option>
                            <option value="client">Faqat mijozlar (Users)</option>
                            <option value="vendor">Faqat ustalar (Vendors)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 mb-3 block uppercase tracking-[0.2em] ml-1">Xabar matni:</label>
                        <textarea required value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-[2rem] text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none" rows="8" placeholder="Ommaviy xabar matnini kiriting..."></textarea>
                    </div>
                    <button type="submit" className="bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all">Push xabar yuborish</button>
                </form>
            )}
        </div>
    );
};

export default Admin;
