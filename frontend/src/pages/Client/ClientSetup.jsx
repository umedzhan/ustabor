import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { User, Camera, CheckCircle } from 'lucide-react';

const ClientSetup = () => {
    const { setUser } = useAuth();
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
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
            setProfilePicture(data.url);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Rasm yuklashda xatolik yuz berdi");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_URL}/user/setup`, { name, profilePicture }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(data.user);
            window.location.href = '/';
        } catch (error) {
            console.error("Setup error:", error);
            alert("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-12">
            {/* Premium Header */}
            <div className="bg-blue-600 text-white pt-10 pb-20 px-6 rounded-b-[3.5rem] shadow-2xl shadow-blue-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mt-10 blur-2xl"></div>

                <div className="relative z-10 text-center">
                    <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic tracking-widest text-[#FFF]">Mijoz Profilingiz</h1>
                    <p className="text-white/70 text-sm font-medium max-w-[250px] mx-auto text-[#E2E8F0]">Xizmat izlash uchun shaxsiy profilingizni sozlang</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 -mt-10 relative z-20 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.03] border border-gray-50 flex flex-col items-center">

                    {/* Profile Picture Upload */}
                    <div className="relative mb-8">
                        <div className="w-32 h-32 rounded-[2rem] bg-gray-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden group">
                            {uploading ? (
                                <div className="w-8 h-8 border-3 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                            ) : profilePicture ? (
                                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-gray-300" />
                            )}

                            <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="mb-1" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFF]">Rasm yuklash</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    <div className="w-full space-y-5">
                        <div className="relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1 mb-2 block text-[#9CA3AF]">Ism va Familiyangiz</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Masalan: Alisher Valiyev"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all pr-12"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || uploading || !name}
                    className="w-full bg-blue-600 text-[#FFF] font-black py-5 rounded-[2rem] shadow-2xl shadow-blue-600/30 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-sm flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-3 border-white rounded-full animate-spin border-t-transparent mx-auto"></div>
                    ) : (
                        <>
                            Boshlash <CheckCircle size={20} className="text-[#FFF]" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ClientSetup;
