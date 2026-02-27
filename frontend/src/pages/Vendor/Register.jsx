import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Briefcase, CheckCircle } from 'lucide-react';

const VendorRegister = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        categoryId: '',
        location: '',
        serviceName: '',
        servicePrice: ''
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare data according to VendorProfile schema
            const payload = {
                category: formData.categoryId,
                location: {
                    address: formData.location,
                    coordinates: [0, 0] // Dummy coordinates for now
                },
                services: [
                    {
                        name: formData.serviceName,
                        price: Number(formData.servicePrice)
                    }
                ],
                portfolio: [] // Can be updated later
            };

            // Post to backend. The backend authMiddleware uses the JWT token
            const token = localStorage.getItem('token');
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
        <div className="bg-gray-50 min-h-screen pb-6">
            <div className="bg-primary text-white p-6 rounded-b-3xl">
                <h1 className="text-2xl font-bold mb-1">Usta bo'lish</h1>
                <p className="text-white/80 text-sm">Xizmatlaringizni taklif qiling va daromad topishni boshlang</p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 mt-2 flex flex-col gap-5">
                {/* Asosiy ma'lumotlar */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={18} className="text-primary" /> Shaxsiy ma'lumotlar
                    </h2>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs text-gray-500 font-medium ml-1">Kategoriya</label>
                            <select
                                className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none"
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 font-medium ml-1 flex items-center gap-1">
                                <MapPin size={12} /> Manzil
                            </label>
                            <input
                                type="text"
                                placeholder="Masalan: Toshkent, Yunusobod"
                                className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Xizmat va narxlar */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Briefcase size={18} className="text-primary" /> Dastlabki Xizmat
                    </h2>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs text-gray-500 font-medium ml-1">Xizmat nomi</label>
                            <input
                                type="text"
                                placeholder="Masalan: Elektrik xizmati (Rozetka almashtirish)"
                                className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                value={formData.serviceName}
                                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 font-medium ml-1">Xizmat narxi (so'm)</label>
                            <input
                                type="number"
                                placeholder="Masalan: 50000"
                                className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                value={formData.servicePrice}
                                onChange={(e) => setFormData({ ...formData, servicePrice: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !formData.categoryId}
                    className="w-full bg-primary text-white font-bold py-4 rounded-full mt-4 flex justify-center items-center shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"></div> : "Ro'yxatdan o'tish"}
                </button>
            </form>
        </div>
    );
};

export default VendorRegister;
