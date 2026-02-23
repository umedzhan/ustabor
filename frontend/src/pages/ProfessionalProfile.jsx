import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Phone, MessageCircle, CheckCircle, Clock, Briefcase } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const ProfessionalProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pro, setPro] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPro = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/professionals/${id}`);
                setPro(data);
            } catch (error) {
                console.error("Error fetching professional details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPro();
    }, [id]);

    if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    if (!pro) return <div className="p-6 text-center">Topilmadi</div>;

    return (
        <div className="bg-white min-h-screen pb-10">
            {/* Top Navigation */}
            <div className="flex items-center p-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} className="text-gray-800" />
                </button>
            </div>

            <div className="px-5">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                        <img src={pro.imageUrl} alt={pro.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-bold text-gray-900">{pro.name}</h1>
                        <p className="text-sm text-gray-500">{pro.category?.name}</p>

                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-gray-800">{pro.rating}</span>
                            <span className="text-sm text-gray-400">({pro.reviewCount} baho)</span>
                        </div>

                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <MapPin size={12} />
                            <span>{pro.location}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-primary text-primary font-medium transition-colors hover:bg-primary/5">
                        <Phone size={18} />
                        Qo'ng'iroq
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-white font-medium shadow-sm shadow-primary/30 transition-colors hover:bg-primary-hover">
                        <MessageCircle size={18} />
                        Chat
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center gap-1">
                        <CheckCircle size={20} className="text-primary" />
                        <span className="font-bold text-gray-800">{pro.completedJobs}</span>
                        <span className="text-[10px] text-gray-500">Bajarilgan</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center gap-1">
                        <Clock size={20} className="text-primary" />
                        <span className="font-bold text-gray-800">{pro.experienceYears} yil</span>
                        <span className="text-[10px] text-gray-500">Tajriba</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center gap-1">
                        <Briefcase size={20} className="text-primary" />
                        <span className="font-bold text-gray-800">{pro.hourlyRate.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-500">so'm/soat</span>
                    </div>
                </div>

                {/* About Section */}
                <div className="mt-8">
                    <h2 className="font-bold text-gray-900 mb-2">Haqida</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {pro.aboutText}
                    </p>
                </div>

                {/* Services Section */}
                <div className="mt-8">
                    <h2 className="font-bold text-gray-900 mb-4">Xizmatlar</h2>
                    <div className="flex flex-col gap-2">
                        {pro.services.map((service, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-full py-3 px-4 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                <span className="text-sm font-medium text-gray-700">{service}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalProfile;
