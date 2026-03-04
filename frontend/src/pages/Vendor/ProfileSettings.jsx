import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Plus, Trash2, Save, Image as ImageIcon,
    Clock, Globe, Briefcase, MapPin, MessageSquare,
    Power, CheckCircle2, AlertCircle
} from 'lucide-react';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const ProfileSettings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        location: '',
        aboutText: '',
        experienceYears: 0,
        languages: [],
        workingHours: { start: '09:00', end: '18:00' },
        services: [],
        portfolio: [],
        isOnline: false
    });

    const [newService, setNewService] = useState({ name: '', price: '' });
    const [newImage, setNewImage] = useState('');
    const [newLanguage, setNewLanguage] = useState('');

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
                    experienceYears: data.experienceYears || 0,
                    languages: data.languages || [],
                    workingHours: data.workingHours || { start: '09:00', end: '18:00' },
                    services: data.services || [],
                    portfolio: data.portfolio || [],
                    isOnline: data.isOnline || false
                });
            } catch (error) {
                console.error("Error fetching profile", error);
                setStatusMessage({ type: 'error', text: 'Profil ma\'lumotlarini yuklashda xatolik' });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setStatusMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('token');
            const payload = {
                location: { address: formData.location, coordinates: [0, 0] },
                aboutText: formData.aboutText,
                experienceYears: Number(formData.experienceYears),
                languages: formData.languages,
                workingHours: formData.workingHours,
                services: formData.services,
                portfolio: formData.portfolio,
                isOnline: formData.isOnline
            };

            await axios.put(`${API_URL}/vendor/profile`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatusMessage({ type: 'success', text: 'Profil muvaffaqiyatli saqlandi!' });
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Error saving profile", error);
            setStatusMessage({ type: 'error', text: 'Xatolik yuz berdi. Qayta urinib ko\'ring.' });
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

    const addLanguage = () => {
        if (!newLanguage || formData.languages.includes(newLanguage)) return;
        setFormData({
            ...formData,
            languages: [...formData.languages, newLanguage]
        });
        setNewLanguage('');
    };

    const removeLanguage = (lang) => {
        setFormData({
            ...formData,
            languages: formData.languages.filter(l => l !== lang)
        });
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

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold text-sm animate-pulse">Profil yuklanmoqda...</p>
        </div>
    );

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-32">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-[100] shadow-sm">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-all active:scale-90">
                        <ArrowLeft size={24} className="text-gray-900" />
                    </button>
                    <div className="ml-2">
                        <h1 className="text-lg font-black text-gray-900 leading-none">Profil tahriri</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Professional ma'lumotlar</p>
                    </div>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${formData.isOnline ? 'bg-green-50 border-green-100 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${formData.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    <span className="text-[10px] font-black uppercase tracking-tight">{formData.isOnline ? 'Onlayn' : 'Oflayn'}</span>
                    <button
                        onClick={() => setFormData({ ...formData, isOnline: !formData.isOnline })}
                        className={`ml-1 w-8 h-4 rounded-full relative transition-colors ${formData.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.isOnline ? 'left-4.5' : 'left-0.5'}`}></div>
                    </button>
                </div>
            </div>

            <div className="p-6 flex flex-col gap-8 max-w-lg mx-auto">
                {/* Status Message Toast */}
                {statusMessage.text && (
                    <div className={`fixed top-20 left-6 right-6 z-[110] p-4 rounded-2xl flex items-center gap-3 animate-slide-down shadow-xl ${statusMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                        {statusMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="text-sm font-bold">{statusMessage.text}</span>
                    </div>
                )}

                {/* Cover section with Avatar */}
                <div className="bg-primary rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-[2.5rem] p-1.5 border border-white/30 shadow-2xl mb-4 group cursor-pointer relative overflow-visible">
                            <div className="w-full h-full bg-white rounded-[2rem] flex items-center justify-center overflow-hidden">
                                {formData.portfolio && formData.portfolio.length > 0 ? (
                                    <img src={formData.portfolio[0]} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-primary font-black text-4xl">{user?.name?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white text-primary rounded-2xl flex items-center justify-center shadow-xl border-4 border-primary">
                                <ImageIcon size={18} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">{user?.name}</h2>
                        <div className="mt-2 bg-white/10 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 flex items-center gap-2">
                            <Briefcase size={12} className="text-white/60" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em]">Lider Mutaxassis</span>
                        </div>
                    </div>
                </div>

                {/* Main Settings Sections */}
                <div className="space-y-6">
                    {/* General Info */}
                    <section className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-gray-50 space-y-6">
                        <div className="flex items-center gap-3 ml-1 mb-2">
                            <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                                <MessageSquare size={16} />
                            </div>
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Asosiy ma'lumotlar</h2>
                        </div>

                        <div className="space-y-5">
                            <div className="group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-primary transition-colors">Yashash manzilingiz</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-sm font-bold text-gray-800 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Shahar, tuman, ko'cha..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">O'zingiz haqingizda (Bio)</label>
                                <textarea
                                    rows="5"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-800 outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none leading-relaxed"
                                    value={formData.aboutText}
                                    onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                                    placeholder="Tajribangiz va mijozlarga foydangiz haqida yozing..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Professional Stats */}
                    <section className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-gray-50 space-y-6">
                        <div className="flex items-center gap-3 ml-1 mb-2">
                            <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                                <Briefcase size={16} />
                            </div>
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Tajriba va Ko'nikmalar</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Xizmat tajribasi (yil)</label>
                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <button
                                        onClick={() => setFormData({ ...formData, experienceYears: Math.max(0, formData.experienceYears - 1) })}
                                        className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 active:scale-90"
                                    >-</button>
                                    <span className="flex-1 text-center font-black text-lg text-gray-800">{formData.experienceYears} yil</span>
                                    <button
                                        onClick={() => setFormData({ ...formData, experienceYears: formData.experienceYears + 1 })}
                                        className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 active:scale-90"
                                    >+</button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block">Biladigan tillaringiz</label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {formData.languages.map(lang => (
                                        <div key={lang} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 border border-blue-100 animate-scale-in">
                                            {lang}
                                            <button onClick={() => removeLanguage(lang)} className="hover:text-blue-800"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Til qo'shish (masalan: O'zbek)"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 pl-11 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10"
                                            value={newLanguage}
                                            onChange={(e) => setNewLanguage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                                        />
                                    </div>
                                    <button onClick={addLanguage} className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-90">
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Working Hours */}
                    <section className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-gray-50 space-y-6">
                        <div className="flex items-center gap-3 ml-1 mb-2">
                            <div className="w-8 h-8 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                                <Clock size={16} />
                            </div>
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Ish vaqtlari</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Boshlanishi</label>
                                <input
                                    type="time"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-gray-800 outline-none"
                                    value={formData.workingHours.start}
                                    onChange={(e) => setFormData({ ...formData, workingHours: { ...formData.workingHours, start: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Tugashi</label>
                                <input
                                    type="time"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-gray-800 outline-none"
                                    value={formData.workingHours.end}
                                    onChange={(e) => setFormData({ ...formData, workingHours: { ...formData.workingHours, end: e.target.value } })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Services */}
                    <section className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-gray-50 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3 ml-1">
                                <div className="w-8 h-8 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                                    <Save size={16} />
                                </div>
                                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Xizmatlarim</h2>
                            </div>
                            <span className="text-[10px] font-black bg-gray-50 px-3 py-1 rounded-full text-gray-400 uppercase">{formData.services.length} ta</span>
                        </div>

                        <div className="space-y-3">
                            {formData.services.map((svc, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-50 rounded-2xl group animate-slide-in">
                                    <div className="flex flex-col">
                                        <span className="font-black text-gray-900 text-sm">{svc.name}</span>
                                        <span className="text-[11px] font-black text-primary uppercase tracking-wider">{svc.price.toLocaleString()} so'm</span>
                                    </div>
                                    <button onClick={() => removeService(index)} className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform hover:rotate-12">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="p-5 bg-gray-50 rounded-[2.5rem] border border-gray-100/50">
                            <div className="space-y-3 mb-4">
                                <input
                                    type="text"
                                    placeholder="Xizmat nomi (masalan: Montaj)"
                                    className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                />
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="Narxi"
                                        className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all pr-12"
                                        value={newService.price}
                                        onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">SO'M</span>
                                </div>
                            </div>
                            <button
                                onClick={addService}
                                className="w-full py-4 bg-primary text-white text-[11px] font-black rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest"
                            >
                                <Plus size={16} /> Qo'shish
                            </button>
                        </div>
                    </section>

                    {/* Portfolio */}
                    <section className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-gray-50 space-y-6">
                        <div className="flex items-center gap-3 ml-1 mb-2">
                            <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                                <ImageIcon size={16} />
                            </div>
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Ishlar galereyasi</h2>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {formData.portfolio.map((img, index) => (
                                <div key={index} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-white shadow-md group">
                                    <img src={img} alt="portfolio" className="w-full h-full object-cover" />
                                    <button onClick={() => removeImage(index)} className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            ))}
                            {formData.portfolio.length < 9 && (
                                <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-[1.5rem] flex flex-col items-center justify-center text-gray-300">
                                    <ImageIcon size={24} />
                                    <span className="text-[8px] font-black uppercase mt-1">Sizniki</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Rasm URL (Unsplash, etc)..."
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10"
                                value={newImage}
                                onChange={(e) => setNewImage(e.target.value)}
                            />
                            <button onClick={addImage} className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-90 transition-all">
                                <Plus size={24} />
                            </button>
                        </div>
                    </section>
                </div>

                {/* Footer Buttons */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/60 backdrop-blur-xl border-t border-gray-100 z-[100] max-w-lg mx-auto flex gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
                    >
                        Bekor qilish
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-[2] bg-primary text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-3 uppercase tracking-[0.2em] text-xs"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-3 border-white rounded-full animate-spin border-t-transparent"></div>
                        ) : (
                            <><Save size={18} /> Saqlash</>
                        )}
                    </button>
                </div>
            </div>

            {/* Animation CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateX(-10px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-slide-down { animation: slideDown 0.3s ease-out; }
                .animate-slide-in { animation: slideIn 0.3s ease-out; }
                .animate-scale-in { animation: scaleIn 0.2s ease-out; }
            `}} />
        </div>
    );
};

export default ProfileSettings;
