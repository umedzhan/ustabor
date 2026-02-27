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
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="bg-white flex items-center p-4 border-b border-gray-100 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h1 className="text-lg font-bold text-gray-900 ml-2">Profil sozlamalari</h1>
            </div>

            <div className="p-5 flex flex-col gap-6">

                {/* Asosiy */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-4">Asosiy ma'lumotlar</h2>
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs text-gray-500 font-medium ml-1">Manzil</label>
                            <input
                                type="text"
                                className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-primary"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-medium ml-1">O'zingiz haqingizda (Bio)</label>
                            <textarea
                                rows="3"
                                className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-primary"
                                value={formData.aboutText}
                                onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Xizmatlar */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-4">Xizmatlar va narxlar</h2>

                    <div className="flex flex-col gap-3 mb-4">
                        {formData.services.map((svc, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50">
                                <div>
                                    <p className="font-medium text-sm text-gray-800">{svc.name}</p>
                                    <p className="text-xs text-primary font-bold">{svc.price.toLocaleString()} so'm</p>
                                </div>
                                <button onClick={() => removeService(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 items-start mt-2 border-t pt-4">
                        <div className="flex-1 flex flex-col gap-2">
                            <input
                                type="text"
                                placeholder="Xizmat nomi"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-primary"
                                value={newService.name}
                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Narxi (so'm)"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-primary"
                                value={newService.price}
                                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                            />
                        </div>
                        <button onClick={addService} className="bg-primary/10 text-primary p-2.5 rounded-lg flex items-center justify-center h-full">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Portfolio */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-4">Portfolio (Rasmlar url)</h2>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {formData.portfolio.map((img, index) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                                <img src={img} alt="portfolio" className="w-full h-full object-cover" />
                                <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-md text-red-500 hover:bg-white">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-2">
                        <input
                            type="text"
                            placeholder="Rasm havolasini (URL) kiriting"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-primary"
                            value={newImage}
                            onChange={(e) => setNewImage(e.target.value)}
                        />
                        <button onClick={addImage} className="bg-primary/10 text-primary p-2.5 rounded-lg">
                            <Plus size={20} />
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">Hozircha faqat rasm URL manzilini kiriting (masalan: https://...)</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-primary text-white font-bold py-4 rounded-full flex justify-center items-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {saving ? <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"></div> : <><Save size={20} /> Saqlash</>}
                </button>
            </div>
        </div>
    );
};

export default ProfileSettings;
