import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const Admin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [token, setToken] = useState(localStorage.getItem('ustabor_admin_token') || null);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [activeTab, setActiveTab] = useState('moderation');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
    }, [location]);

    const [categories, setCategories] = useState([]);
    const [pendingVendors, setPendingVendors] = useState([]);
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
        if (token) {
            fetchCategories();
            fetchPendingVendors();
        }
    }, [token]);

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

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${API_URL}/admin/login`, loginForm);
            setToken(data.token);
            localStorage.setItem('ustabor_admin_token', data.token);
        } catch (err) { alert("Noto'g'ri login yoki parol"); }
    };

    const handleVerify = async (vendorId, status) => {
        try {
            await axios.put(`${API_URL}/admin/vendors/${vendorId}/verify`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Usta holati: ${status}`);
            fetchPendingVendors();
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
        } catch (err) { console.error(err); alert("Xatolik yuz berdi"); }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('ustabor_admin_token');
    };

    if (!token) {
        return (
            <div className="p-4 bg-white min-h-screen flex items-center justify-center flex-col">
                <div className="w-full max-w-sm">
                    <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Panelga kirish</h1>
                    <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                        <input required name="username" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} className="w-full border p-3 rounded-xl" placeholder="Login" />
                        <input required type="password" name="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full border p-3 rounded-xl" placeholder="Parol" />
                        <button type="submit" className="bg-primary text-white py-3 rounded-xl font-bold">Kirish</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-50 min-h-screen pb-10">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm">
                <h1 className="text-xl font-bold text-primary">Ustabor Admin</h1>
                <div className="flex gap-4 items-center">
                    <span className="text-xs text-gray-500 font-medium">Salom, Admin</span>
                    <button onClick={logout} className="text-xs text-red-500 font-bold px-3 py-1 bg-red-50 rounded-lg">Chiqish</button>
                </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button onClick={() => setActiveTab('moderation')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'moderation' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500'}`}>Moderatsiya ({pendingVendors.length})</button>
                <button onClick={() => setActiveTab('add')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'add' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500'}`}>Usta qo'shish</button>
                <button onClick={() => setActiveTab('broadcast')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'broadcast' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500'}`}>Broadcast</button>
            </div>

            {activeTab === 'moderation' && (
                <div className="flex flex-col gap-4">
                    {pendingVendors.length === 0 ? (
                        <div className="text-center p-10 bg-white rounded-3xl text-gray-400 text-sm">Hozircha arizalar yo'q</div>
                    ) : (
                        pendingVendors.map(v => (
                            <div key={v._id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{v.userId?.name}</h3>
                                        <p className="text-xs text-primary font-medium">{v.category?.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{v.userId?.phone || 'Tel kiritilmagan'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleVerify(v._id, 'approved')} className="bg-green-500 text-white text-[10px] font-bold px-3 py-2 rounded-xl">Tasdiqlash</button>
                                        <button onClick={() => handleVerify(v._id, 'rejected')} className="bg-red-500 text-white text-[10px] font-bold px-3 py-2 rounded-xl">Rad etish</button>
                                    </div>
                                </div>
                                {v.documents?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Hujjatlar:</p>
                                        <div className="flex gap-2 overflow-x-auto">
                                            {v.documents.map((doc, idx) => (
                                                <a key={idx} href={doc} target="_blank" className="text-[10px] text-blue-500 underline truncate max-w-[100px]">{doc}</a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'add' && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl flex flex-col gap-4 shadow-sm">
                    <input required name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="border p-3 rounded-xl text-sm" placeholder="Ism familiya" />
                    <select required name="category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="border p-3 rounded-xl text-sm bg-white">
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="experienceYears" value={formData.experienceYears} onChange={e => setFormData({ ...formData, experienceYears: e.target.value })} className="border p-3 rounded-xl text-sm" placeholder="Tajriba" />
                        <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })} className="border p-3 rounded-xl text-sm" placeholder="Narxi" />
                    </div>
                    <input name="location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="border p-3 rounded-xl text-sm" placeholder="Manzil" />
                    <textarea name="aboutText" value={formData.aboutText} onChange={e => setFormData({ ...formData, aboutText: e.target.value })} className="border p-3 rounded-xl text-sm" rows="3" placeholder="Haqida"></textarea>
                    <button type="submit" className="bg-primary text-white py-4 rounded-xl font-bold mt-2">Saqlash</button>
                </form>
            )}

            {activeTab === 'broadcast' && (
                <form onSubmit={handleBroadcast} className="bg-white p-6 rounded-3xl flex flex-col gap-5 shadow-sm">
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Kimga yuborish:</label>
                        <select value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)} className="w-full border p-3 rounded-xl text-sm bg-gray-50">
                            <option value="all">Hammaga</option>
                            <option value="client">Faqat mijozlarga</option>
                            <option value="vendor">Faqat ustalarga</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Xabar matni:</label>
                        <textarea required value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} className="w-full border p-3 rounded-xl text-sm bg-gray-50 outline-none focus:ring-1 focus:ring-primary/20" rows="6" placeholder="Barcha foydalanuvchilarga yuboriladigan xabar..."></textarea>
                    </div>
                    <button type="submit" className="bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-all">Xabarni yuborish</button>
                </form>
            )}
        </div>
    );
};

export default Admin;
