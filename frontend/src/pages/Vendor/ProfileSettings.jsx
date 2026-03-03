import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const ProfileSettings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        location: '',
        aboutText: '',
        services: [],
        portfolio: []
    });

    const [newService, setNewService] = useState({ name: '', price: '' });
    const [newImage, setNewImage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_URL}/vendor/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setFormData({
                    location: data.location?.address || '',
                    aboutText: data.aboutText || '',
                    services: data.services || [],
                    portfolio: data.portfolio || []
                });
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                location: { address: formData.location, coordinates: [0, 0] },
                aboutText: formData.aboutText,
                services: formData.services,
                portfolio: formData.portfolio
            };

            await axios.put(`${API_URL}/vendor/profile`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Profil muvaffaqiyatli saqlandi!");
        } catch (error) {
            console.error("Error saving profile", error);
            alert("Xatolik yuz berdi");
        } finally {
            setSaving(false);
        }
    };

    const addService = () => {
        if (!newService.name || !newService.price) return;
        setFormData({
            ...formData,
            services: [...formData.services, { name: newService.name, price: Number(newService.price) }]
        });
        setNewService({ name: '', price: '' });
    };

    const removeService = (index) => {
        const updatedServices = formData.services.filter((_, i) => i !== index);
        setFormData({ ...formData, services: updatedServices });
    };

    const addImage = () => {
        if (!newImage) return;
        setFormData({
            ...formData,
            portfolio: [...formData.portfolio, newImage]
        });
        setNewImage('');
    };

    const removeImage = (index) => {
        const updatedPortfolio = formData.portfolio.filter((_, i) => i !== index);
        setFormData({ ...formData, portfolio: updatedPortfolio });
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="w-8 h-8 border-2 border-primary rounded-full animate-spin border-t-transparent"></div></div>;

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md px-4 py-4 flex items-center border-b border-gray-100 sticky top-0 z-[100]">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={24} className="text-gray-900" />
                </button>
                <div className="ml-2">
                    <h1 className="text-lg font-black text-gray-900 leading-none">Profil sozlamalari</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ma'lumotlarni tahrirlash</p>
                </div>
            </div>

            <div className="p-6 flex flex-col gap-8">
                {/* Profile Preview Card */}
                <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] p-1 border border-white/30 shadow-inner mb-4 group cursor-pointer relative">
                            <div className="w-full h-full bg-white rounded-[1.5rem] flex items-center justify-center overflow-hidden">
                                {formData.portfolio && formData.portfolio.length > 0 ? (
                                    <img src={formData.portfolio[0]} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-primary font-black text-3xl">{user?.name?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white text-primary rounded-xl flex items-center justify-center shadow-lg border-4 border-primary">
                                <ImageIcon size={14} />
                            </div>
                        </div>
                        <h2 className="text-xl font-black">{user?.name}</h2>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mt-1">Professional usta</p>
                    </div>
                </div>

                {/* Main Settings */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.03] border border-gray-50">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Umumiy ma'lumotlar</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Xizmat ko'rsatish manzili</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-800 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Shahar, tuman, ko'cha..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Professional tavsif (Bio)</label>
                                <textarea
                                    rows="4"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-800 outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                                    value={formData.aboutText}
                                    onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                                    placeholder="Tajribangiz va xizmat uslubingiz haqida yozing..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.03] border border-gray-50">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Xizmatlar & Portfellar</h2>

                        <div className="space-y-3 mb-6">
                            {formData.services.map((svc, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-50 rounded-2xl animate-slide-in">
                                    <div className="flex flex-col">
                                        <span className="font-black text-gray-900 text-sm">{svc.name}</span>
                                        <span className="text-[11px] font-black text-primary uppercase">{svc.price.toLocaleString()} so'm</span>
                                    </div>
                                    <button onClick={() => removeService(index)} className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-gray-50 rounded-[2rem] border border-gray-100/50">
                            <div className="space-y-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Xizmat nomi"
                                    className="w-full bg-white border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10"
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Narxi"
                                    className="w-full bg-white border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10"
                                    value={newService.price}
                                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                />
                            </div>
                            <button onClick={addService} className="w-full py-3 bg-white text-primary text-[10px] font-black rounded-xl border border-primary/20 flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all">
                                <Plus size={14} /> Xizmat qo'shish
                            </button>
                        </div>
                    </div>

                    {/* Portfolio */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.03] border border-gray-50">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Ishlar galereyasi</h2>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {formData.portfolio.map((img, index) => (
                                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                                    <img src={img} alt="portfolio" className="w-full h-full object-cover" />
                                    <button onClick={() => removeImage(index)} className="absolute inset-0 bg-red-500/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Rasm URL havolasi..."
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10"
                                value={newImage}
                                onChange={(e) => setNewImage(e.target.value)}
                            />
                            <button onClick={addImage} className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-primary text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-3 uppercase tracking-[0.2em] text-sm"
                >
                    {saving ? (
                        <div className="w-6 h-6 border-3 border-white rounded-full animate-spin border-t-transparent"></div>
                    ) : (
                        <><Save size={20} /> Ma'lumotlarni saqlash</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProfileSettings;
