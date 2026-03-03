import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Phone, MessageCircle, CheckCircle, Clock, Briefcase } from 'lucide-react';
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

    if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    if (!pro) return <div className="p-6 text-center">Topilmadi</div>;

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Top Navigation */}
            <div className="flex items-center p-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
                <h2 className="ml-2 font-bold text-gray-900">Usta profili</h2>
            </div>

            <div className="px-5">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-primary/10 shrink-0 bg-gray-50 flex items-center justify-center p-1">
                        <div className="w-full h-full rounded-2xl overflow-hidden">
                            {pro.portfolio && pro.portfolio.length > 0 ? (
                                <img src={pro.portfolio[0]} alt={pro.userId?.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                    <Briefcase size={32} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-xl font-bold text-gray-900">{pro.userId?.name}</h1>
                            {pro.verificationStatus === 'approved' && (
                                <CheckCircle size={16} className="text-primary fill-primary/10" title="Tasdiqlangan usta" />
                            )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{pro.category?.name}</p>

                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-bold text-amber-700">{pro.rating || '0.0'}</span>
                            </div>
                            <span className="text-xs text-gray-400">({pro.reviewCount} sharh)</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={() => navigate(`/chat/${pro.userId?._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border border-primary/20 text-primary font-bold transition-all hover:bg-primary/5 active:scale-[0.98]">
                        <MessageCircle size={20} />
                        Chat
                    </button>
                    <button
                        onClick={() => navigate(`/vendor/${pro._id}/book`)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]">
                        <Clock size={20} />
                        Buyurtma
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-gray-50/50 border border-gray-100 rounded-[2rem] p-5 flex flex-col items-center justify-center gap-1 text-center">
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-1">
                            <Clock size={22} />
                        </div>
                        <span className="font-bold text-gray-900 leading-tight">{pro.experienceYears} yil</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tajriba</span>
                    </div>
                    <div className="bg-gray-50/50 border border-gray-100 rounded-[2rem] p-5 flex flex-col items-center justify-center gap-1 text-center">
                        <div className="w-10 h-10 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-1">
                            <Briefcase size={22} />
                        </div>
                        <span className="font-bold text-gray-900 leading-tight">
                            {pro.services && pro.services.length > 0 ? pro.services[0].price.toLocaleString() : '---'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Start narx</span>
                    </div>
                </div>

                {/* About Section */}
                <div className="mt-10">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Usta haqida</h2>
                    <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-5">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {pro.aboutText || "Ma'lumot berilmagan."}
                        </p>
                    </div>
                </div>

                {/* Services Section */}
                <div className="mt-10">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Xizmatlar ro'yxati</h2>
                    <div className="flex flex-col gap-3">
                        {pro.services && pro.services.map((service, idx) => (
                            <div key={idx} className="bg-white border border-gray-100 shadow-sm rounded-2xl py-4 px-5 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 shadow-sm shadow-primary/40"></div>
                                    <span className="text-sm font-bold text-gray-800 truncate">{service.name}</span>
                                </div>
                                <span className="text-sm font-black text-primary px-3 py-1 bg-primary/5 rounded-xl shrink-0">
                                    {service.price.toLocaleString()} so'm
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-10">
                    <div className="flex justify-between items-center mb-4 ml-1">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mijozlar fikri</h2>
                        <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-lg border border-amber-100">
                            {pro.reviewCount} ta
                        </span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {reviews.length === 0 ? (
                            <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl p-8 text-center">
                                <MessageCircle size={32} className="text-gray-200 mx-auto mb-2" />
                                <p className="text-xs text-gray-400">Hozircha fikrlar yo'q</p>
                            </div>
                        ) : (
                            reviews.map((rev, idx) => (
                                <div key={idx} className="bg-white border border-gray-50 shadow-sm rounded-[2rem] p-5">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-bold text-primary">
                                                {rev.clientId?.name?.charAt(0) || 'M'}
                                            </div>
                                            <span className="text-xs font-bold text-gray-800">{rev.clientId?.name}</span>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} fill={i < rev.review?.rating ? "#fbbf24" : "none"} stroke={i < rev.review?.rating ? "#fbbf24" : "#d1d5db"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed pl-1">
                                        {rev.review?.comment}
                                    </p>
                                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                                        <span className="text-[10px] text-gray-300 font-medium">Xizmat:</span>
                                        <span className="text-[10px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-lg">{rev.serviceDetails?.name}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalProfile;
