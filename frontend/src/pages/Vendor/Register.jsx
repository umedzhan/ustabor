import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Briefcase, CheckCircle, Trash2, Plus, ImageIcon, Camera } from 'lucide-react';

const VendorRegister = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        profilePicture: '',
        categoryId: '',
        location: '',
        services: [],
        portfolio: [],
        documents: []
    });

    const [newService, setNewService] = useState({ name: '', price: '' });
    const [newImage, setNewImage] = useState('');
    const [newDoc, setNewDoc] = useState('');
    const [uploadingObj, setUploadingObj] = useState({ state: false, field: null });

    useEffect(() => {
        // Fetch categories for the select dropdown
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/categories`);
                setCategories(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, categoryId: data[0]._id }));
                }
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        };
        fetchCategories();
    }, []);

    const handleFileUpload = async (e, type = 'portfolio') => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingObj({ state: true, field: type });
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_URL}/upload`, uploadFormData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (type === 'profilePicture') {
                setFormData(prev => ({ ...prev, profilePicture: data.url }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    portfolio: [...prev.portfolio, data.url]
                }));
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Rasm yuklashda xatolik yuz berdi");
        } finally {
            setUploadingObj({ state: false, field: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Send /api/user/setup for name and profile picture
            const token = localStorage.getItem('token');
            const setupPayload = { name: formData.name, profilePicture: formData.profilePicture };
            await axios.post(`${API_URL}/user/setup`, setupPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 2. Prepare data according to VendorProfile schema
            const payload = {
                category: formData.categoryId,
                location: {
                    address: formData.location,
                    coordinates: [0, 0] // Dummy coordinates for now
                },
                services: formData.services,
                portfolio: formData.portfolio,
                documents: formData.documents
            };

            // Post to backend. The backend authMiddleware uses the JWT token
            await axios.post(`${API_URL}/vendors`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess(true);
            setTimeout(() => {
                // Since the role changes, we could ideally reload the user context.
                // For a quick UX flow, just redirect to dashboard.
                window.location.href = '/vendor/dashboard';
            }, 3000);

        } catch (error) {
            console.error("Registration error:", error);
            alert("Ro'yxatdan o'tishda xatolik yuz berdi. Iltimos barcha maydonlarni to'ldiring.");
            setLoading(false);
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

    const addDoc = () => {
        if (!newDoc) return;
        setFormData({
            ...formData,
            documents: [...formData.documents, newDoc]
        });
        setNewDoc('');
    };

    const removeDoc = (index) => {
        const updatedDocs = formData.documents.filter((_, i) => i !== index);
        setFormData({ ...formData, documents: updatedDocs });
    };

    if (success) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tabriklaymiz!</h2>
                <p className="text-gray-500 mb-8">
                    Siz muvaffaqiyatli usta sifatida ro'yxatdan o'tdingiz. Endi siz buyurtmalarni qabul qilishingiz mumkin.
                </p>
                <div className="w-8 h-8 border-2 border-primary rounded-full animate-spin border-t-transparent mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-12">
            {/* Premium Header */}
            <div className="bg-primary text-white pt-10 pb-20 px-6 rounded-b-[3.5rem] shadow-2xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mt-10 blur-2xl"></div>

                <div className="relative z-10 text-center">
                    <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic tracking-widest">Usta Bo'lish</h1>
                    <p className="text-white/70 text-sm font-medium max-w-[250px] mx-auto">Professional jamoamizga qo'shiling va daromad topishni boshlang</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 -mt-10 relative z-20 flex flex-col gap-6">
                {/* Step 1: Category & Location */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.03] border border-gray-50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <User size={20} />
                        </div>
                        <h2 className="font-black text-gray-900 tracking-tight">Asosiy ma'lumotlar</h2>
                    </div>

                    <div className="space-y-5">

                        {/* Profile Picture Upload */}
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-[1.5rem] bg-gray-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden group">
                                    {uploadingObj.state && uploadingObj.field === 'profilePicture' ? (
                                        <div className="w-6 h-6 border-3 border-primary rounded-full animate-spin border-t-transparent"></div>
                                    ) : formData.profilePicture ? (
                                        <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-gray-300" />
                                    )}

                                    <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={20} className="mb-1" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white">Yuklash</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'profilePicture')} disabled={uploadingObj.state} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1 mb-2 block">Ism va Familiyangiz</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Alisher Valiyev"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-800 outline-none focus:ring-4 focus:ring-primary/10 transition-all pr-12"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1 mb-2 block">Sizning sohangiz</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-800 outline-none focus:ring-4 focus:ring-primary/10 appearance-none transition-all pr-12"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                                    <Briefcase size={18} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1 mb-2 block">Xizmat ko'rsatish manzili</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Toshkent, Yunusobod..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-800 outline-none focus:ring-4 focus:ring-primary/10 transition-all pr-12"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                                <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 2: Services */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.03] border border-gray-50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                            <Briefcase size={20} />
                        </div>
                        <h2 className="font-black text-gray-900 tracking-tight">Xizmatlar & Narxlar</h2>
                    </div>

                    <div className="space-y-3 mb-6">
                        {formData.services.map((svc, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-50 rounded-2xl group animate-slide-in">
                                <div className="flex flex-col">
                                    <span className="font-black text-gray-900 text-sm">{svc.name}</span>
                                    <span className="text-[11px] font-black text-primary uppercase">{svc.price.toLocaleString()} so'm</span>
                                </div>
                                <button type="button" onClick={() => removeService(index)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100/50">
                        <div className="space-y-3 mb-4">
                            <input
                                type="text"
                                placeholder="Xizmat nomi (masalan: Kran o'rnatish)"
                                className="w-full bg-white border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10"
                                value={newService.name}
                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Narxi (so'm)"
                                className="w-full bg-white border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10"
                                value={newService.price}
                                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addService}
                            disabled={!newService.name || !newService.price}
                            className="w-full py-3 bg-white text-primary text-[10px] font-black rounded-xl border border-primary/20 flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all disabled:opacity-30 uppercase tracking-[0.1em]"
                        >
                            <Plus size={14} /> Xizmatni qo'shish
                        </button>
                    </div>
                </div>

                {/* Step 3: Portfolio */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.03] border border-gray-50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                            <ImageIcon size={20} />
                        </div>
                        <h2 className="font-black text-gray-900 tracking-tight">Portfolio</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {formData.portfolio.map((img, index) => (
                            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-50 ring-4 ring-gray-50/30 group">
                                <img src={img} alt="portfolio" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                        {formData.portfolio.length < 6 && (
                            <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-300">
                                <ImageIcon size={24} />
                                <span className="text-[8px] font-black uppercase mt-1">Sizniki</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Rasm URL (masalan: unsplash.com/...)"
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10"
                            value={newImage}
                            onChange={(e) => setNewImage(e.target.value)}
                        />
                        <button type="button" onClick={addImage} className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Step 4: Verification */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.03] border border-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
                            <CheckCircle size={20} />
                        </div>
                        <h2 className="font-black text-gray-900 tracking-tight">Tasdiqlash</h2>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-6 ml-1">Sertifikat yoki pasport nusxasi</p>

                    <div className="space-y-2 mb-6 text-left">
                        {formData.documents.map((doc, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-green-50/50 border border-green-100 rounded-xl">
                                <CheckCircle size={14} className="text-green-500" />
                                <span className="text-[10px] font-bold text-green-700 truncate flex-1">{doc}</span>
                                <button type="button" onClick={() => removeDoc(index)} className="text-red-400">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Hujjat URL manzilini kiriting"
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10"
                            value={newDoc}
                            onChange={(e) => setNewDoc(e.target.value)}
                        />
                        <button type="button" onClick={addDoc} className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div className="mt-4 px-2">
                    <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                        Tugmani bosish orqali siz bizning <span className="text-primary font-bold">Foydalanish shartlarimizga</span> rozilik bildirasiz
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading || uploadingObj.state || !formData.name || !formData.categoryId || formData.services.length === 0}
                    className="w-full bg-primary text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-sm"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-3 border-white rounded-full animate-spin border-t-transparent mx-auto"></div>
                    ) : (
                        "Arizani yuborish"
                    )}
                </button>
            </form>
        </div>
    );
};

export default VendorRegister;
