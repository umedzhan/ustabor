import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const Admin = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem('ustabor_admin_token') || null);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        rating: 0,
        reviewCount: 0,
        hourlyRate: 0,
        experienceYears: 0,
        completedJobs: 0,
        location: '',
        aboutText: '',
        services: '',
        imageUrl: '',
    });

    useEffect(() => {
        if (token) {
            const fetchCategories = async () => {
                try {
                    const { data } = await axios.get(`${API_URL}/categories`);
                    setCategories(data);
                    if (data.length > 0) {
                        setFormData(prev => ({ ...prev, category: data[0]._id }));
                    }
                } catch (err) {
                    console.error(err);
                }
            };
            fetchCategories();
        }
    }, [token]);

    const handleLoginChange = (e) => {
        setLoginForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${API_URL}/admin/login`, loginForm);
            setToken(data.token);
            localStorage.setItem('ustabor_admin_token', data.token);
        } catch (err) {
            alert("Noto'g'ri login yoki parol");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                services: formData.services.split(',').map(s => s.trim()).filter(s => s !== '')
            };

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.post(`${API_URL}/professionals`, dataToSubmit, config);
            alert("Usta muvaffaqiyatli qo'shildi!");
            navigate('/');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 403) {
                alert("Sizda ruxsat yo'q. Qaytadan kiring.");
                setToken(null);
                localStorage.removeItem('ustabor_admin_token');
            } else {
                alert("Xatolik yuz berdi");
            }
        }
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
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Login</label>
                            <input required name="username" value={loginForm.username} onChange={handleLoginChange} className="w-full border p-3 rounded-xl" placeholder="admin" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Parol</label>
                            <input required type="password" name="password" value={loginForm.password} onChange={handleLoginChange} className="w-full border p-3 rounded-xl" placeholder="admin123" />
                        </div>
                        <button type="submit" className="bg-primary text-white py-3 rounded-xl font-bold mt-2 hover:bg-primary-hover active:bg-primary transition-colors">Kirish</button>
                    </form>
                    <button onClick={() => navigate('/')} className="w-full text-center mt-6 text-sm text-gray-500 hover:text-gray-800">Bosh sahifaga qaytish</button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white min-h-screen pb-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Yangi usta qo'shish</h1>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/')} className="text-sm text-gray-500">Asosiyga</button>
                    <button onClick={logout} className="text-sm text-red-500 font-medium">Chiqish</button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Ism familiyasi</label>
                    <input required name="name" value={formData.name} onChange={handleChange} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-primary" placeholder="Masalan: Jamshid Vahobov" />
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Kategoriya</label>
                    <select required name="category" value={formData.category} onChange={handleChange} className="w-full border p-3 rounded-xl text-sm bg-white outline-none focus:border-primary">
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Reyting (5 bal)</label>
                        <input required type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Baho soni</label>
                        <input required type="number" name="reviewCount" value={formData.reviewCount} onChange={handleChange} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Soatbay narxi (so'm)</label>
                        <input required type="number" step="1000" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Tajriba (yil)</label>
                        <input required type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Bajarilgan ishlar</label>
                        <input required type="number" name="completedJobs" value={formData.completedJobs} onChange={handleChange} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-primary" />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Manzil</label>
                    <input required name="location" value={formData.location} onChange={handleChange} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-primary" placeholder="Masalan: Toshkent, Yunusobod..." />
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Haqida (matn)</label>
                    <textarea required name="aboutText" value={formData.aboutText} onChange={handleChange} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-primary" rows="3" placeholder="Usta haqida batafsil ma'lumot"></textarea>
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Xizmat turlari (vergul bilan ajrating)</label>
                    <input required name="services" value={formData.services} onChange={handleChange} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-primary" placeholder="Eshik o'rnatish, Kafel terish, ..." />
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Rasm URL manzil</label>
                    <input required name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-primary" placeholder="https://..." />
                </div>

                <button type="submit" className="bg-primary text-white py-4 rounded-xl font-bold mt-4 hover:bg-primary-hover active:bg-primary transition-colors shadow-sm shadow-primary/30">Ustani Saqlash</button>
            </form>
        </div>
    );
};

export default Admin;
