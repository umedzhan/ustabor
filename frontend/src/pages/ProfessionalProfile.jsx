import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Star, MapPin, Phone, MessageCircle,
    CheckCircle, Clock, Briefcase, Globe, ShieldCheck,
    Zap, Calendar, Award, ChevronRight, Share2
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const ProfessionalProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pro, setPro] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProData = async () => {
            try {
                const [proRes, reviewsRes] = await Promise.all([
                    axios.get(`${API_URL}/vendors/${id}`),
                    axios.get(`${API_URL}/vendors/${id}/reviews`)
                ]);
                setPro(proRes.data);
                setReviews(reviewsRes.data);
            } catch (error) {
                console.error("Error fetching professional details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold text-sm animate-pulse">Usta ma'lumotlari yuklanmoqda...</p>
        </div>
    );

    if (!pro) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <Briefcase size={40} />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Usta topilmadi</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">Siz qidirayotgan professional profil mavjud emas yoki o'chirilgan.</p>
            <button onClick={() => navigate(-1)} className="px-8 py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Orqaga qaytish
            </button>
        </div>
    );

    return (
        <div className="bg-[#fcfdfe] min-h-screen pb-32">
            {/* Top Navigation */}
            <div className="flex items-center justify-between p-4 sticky top-0 bg-white/90 backdrop-blur-xl z-50 border-b border-gray-100">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-all active:scale-90">
                        <ArrowLeft size={24} className="text-gray-900" />
                    </button>
                    <div className="ml-2">
                        <h2 className="font-black text-gray-900 leading-none">Usta profili</h2>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.15em] mt-1">{pro.category?.name || 'Mutaxassis'}</p>
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-all active:scale-90">
                    <Share2 size={20} />
                </button>
            </div>

            <div className="px-6 py-8 flex flex-col gap-10">
                {/* Profile Header Card */}
                <div className="flex items-center gap-6 animate-scale-in">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl shrink-0 bg-gray-50 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
                            <div className="w-full h-full rounded-[2rem] overflow-hidden">
                                {pro.portfolio && pro.portfolio.length > 0 ? (
                                    <img src={pro.portfolio[0]} alt={pro.userId?.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="text-3xl font-black">{pro.userId?.name?.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {pro.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 flex-1 pt-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{pro.userId?.name}</h1>
                            {pro.verificationStatus === 'approved' && (
                                <div className="bg-primary/10 p-1 rounded-lg border border-primary/20">
                                    <ShieldCheck size={16} className="text-primary" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-[11px] font-black text-amber-900">{pro.rating || '5.0'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{pro.reviewCount} ta fikr</span>
                            </div>
                            {pro.isOnline ? (
                                <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">Onlayn</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Oflayn</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Pills Slider */}
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar animate-slide-in">
                    <div className="min-w-[140px] bg-white border border-gray-100 rounded-[2rem] p-5 shadow-xl shadow-black/[0.02] flex flex-col items-center text-center gap-3 active:scale-95 transition-all">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                            <Award size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-gray-900 text-sm leading-none mb-1">{pro.experienceYears || 0} yil</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Tajriba</span>
                        </div>
                    </div>

                    <div className="min-w-[140px] bg-white border border-gray-100 rounded-[2rem] p-5 shadow-xl shadow-black/[0.02] flex flex-col items-center text-center gap-3 active:scale-95 transition-all">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-gray-900 text-sm leading-none mb-1">
                                {pro.workingHours?.start || '09:00'} - {pro.workingHours?.end || '18:00'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Ish vaqti</span>
                        </div>
                    </div>

                    <div className="min-w-[140px] bg-white border border-gray-100 rounded-[2rem] p-5 shadow-xl shadow-black/[0.02] flex flex-col items-center text-center gap-3 active:scale-95 transition-all">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                            <Globe size={24} />
                        </div>
                        <div className="flex flex-col shrink-0">
                            <span className="font-black text-gray-900 text-[10px] leading-tight mb-1 max-w-[100px] truncate">
                                {pro.languages && pro.languages.length > 0 ? pro.languages.join(', ') : 'O\'zbek'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Tillari</span>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <section className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-gray-50 animate-slide-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                            <Award size={16} />
                        </div>
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Mutaxassis haqida</h2>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {pro.aboutText || "Bu mutaxassis hali o'zi haqida ma'lumot kiritmagan. Lekin u o'z ishining ustasi!"}
                    </p>

                    <div className="mt-6 flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <MapPin size={18} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-800">{pro.location?.address || 'Manzil ko\'rsatilmagan'}</span>
                    </div>
                </section>

                {/* Main Action Buttons */}
                <div className="grid grid-cols-2 gap-4 animate-slide-up">
                    <button
                        onClick={() => navigate(`/chat/${pro.userId?._id}`)}
                        className="group flex flex-col items-center justify-center gap-3 py-6 rounded-[2rem] bg-white border border-gray-100 shadow-xl shadow-black/[0.02] text-gray-900 font-black transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MessageCircle size={24} fill="currentColor" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest">Savol berish</span>
                    </button>
                    <button
                        onClick={() => navigate(`/vendor/${pro._id}/book`)}
                        className="group flex flex-col items-center justify-center gap-3 py-6 rounded-[2rem] bg-primary text-white font-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] hover:brightness-110 active:scale-95"
                    >
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest">Band qilish</span>
                    </button>
                </div>

                {/* Services Section */}
                <section className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-between mb-6 ml-1">
                        <div className="flex flex-col">
                            <h2 className="font-black text-gray-900 text-lg tracking-tight">Xizmatlarim</h2>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Sifat kafolati bilan</p>
                        </div>
                        <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full text-gray-400 uppercase tracking-widest">{pro.services?.length || 0} ta</span>
                    </div>

                    <div className="space-y-4">
                        {pro.services && pro.services.map((service, idx) => (
                            <div key={idx} className="group bg-white border border-gray-50 shadow-xl shadow-black/[0.02] rounded-3xl p-6 flex items-center justify-between gap-4 transition-all hover:border-primary/20">
                                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors">
                                        <Zap size={18} />
                                    </div>
                                    <span className="font-black text-gray-800 text-sm truncate">{service.name}</span>
                                </div>
                                <div className="flex flex-col items-end shrink-0">
                                    <span className="text-xs font-black text-primary px-4 py-2 bg-primary/5 rounded-2xl border border-primary/5">
                                        {service.price.toLocaleString()} SO'M
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Reviews Section */}
                <section className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
                    <div className="flex justify-between items-center mb-6 ml-1">
                        <div className="flex flex-col">
                            <h2 className="font-black text-gray-900 text-lg tracking-tight">Mijozlardan fikrlar</h2>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Haqiqiy tajribalar</p>
                        </div>
                        <div className="bg-amber-50 px-3 py-1 rounded-full border border-amber-100 flex items-center gap-1.5 uppercase font-black text-[10px] text-amber-600 tracking-widest">
                            {pro.reviewCount} <Star size={10} fill="currentColor" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {reviews.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-gray-200 mb-4 animate-pulse">
                                    <MessageCircle size={32} />
                                </div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Hozircha fikrlar mavjud emas</p>
                            </div>
                        ) : (
                            reviews.map((rev, idx) => (
                                <div key={idx} className="bg-white border border-gray-50 shadow-xl shadow-black/[0.02] rounded-[2.5rem] p-8 transition-transform hover:scale-[1.01]">
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-sm font-black text-primary shadow-inner">
                                                {rev.clientId?.name?.charAt(0) || 'M'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 text-sm tracking-tight">{rev.clientId?.name}</span>
                                                <div className="flex gap-1 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} fill={i < rev.review?.rating ? "#fbbf24" : "none"} stroke={i < rev.review?.rating ? "#fbbf24" : "#e2e8f0"} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-gray-300 font-black uppercase tracking-widest pt-1">
                                            {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-3 top-0 bottom-0 w-1 bg-primary/5 rounded-full"></div>
                                        <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
                                            "{rev.review?.comment || "Ajoyib xizmat, hammaga tavsiya qilaman!"}"
                                        </p>
                                    </div>
                                    <div className="mt-6 flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-white px-2 py-1 rounded-lg">Xizmat:</span>
                                        <span className="text-[10px] text-primary font-black uppercase tracking-tight truncate">{rev.serviceDetails?.name}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Animation CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateX(-20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
                .animate-slide-in { animation: slideIn 0.4s ease-out both; }
                .animate-slide-up { animation: slideUp 0.5s ease-out both; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default ProfessionalProfile;
