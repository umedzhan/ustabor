import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { useLanguage } from '../context/LanguageContext';

const ProfessionalList = ({ categoryFilter, searchQuery }) => {
    const { t } = useLanguage();
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPros = async () => {
            setLoading(true);
            try {
                let url = `${API_URL}/vendors?`;
                if (categoryFilter) url += `categoryId=${categoryFilter}&`;
                if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;

                const { data } = await axios.get(url);
                setProfessionals(data);
            } catch (error) {
                console.error("Error fetching professionals", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchPros();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [categoryFilter, searchQuery]);

    if (loading) return <div className="mt-6 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="flex flex-col gap-4 mt-2">
            <div className="flex justify-between items-center px-1">
                <h2 className="font-black text-gray-900 tracking-tight">{t('usta_mutaxassislar') || "Usta mutaxassislar"}</h2>
                <button className="text-[10px] font-black text-primary uppercase tracking-widest">{t('all')}</button>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-8">
                {professionals.map((pro) => (
                    <Link to={`/vendor/${pro._id}`} key={pro._id} className="group flex flex-col bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-black/[0.03] transition-all hover:-translate-y-1">
                        <div className="h-44 w-full overflow-hidden bg-gray-50 flex items-center justify-center relative">
                            {pro.profilePicture ? (
                                <img src={pro.profilePicture} alt={pro.userId?.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                            ) : pro.portfolio && pro.portfolio.length > 0 ? (
                                <img src={pro.portfolio[0]} alt={pro.userId?.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                            ) : (
                                <div className="text-primary/20 font-black text-4xl">{pro.userId?.name?.charAt(0)}</div>
                            )}

                            {/* Online Status Indicator */}
                            <div className="absolute top-4 right-4 z-10">
                                <div className={`px-2 py-1 rounded-full border backdrop-blur-md flex items-center gap-1.5 transition-all ${pro.isOnline ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${pro.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className="text-[8px] font-black uppercase tracking-tighter">{pro.isOnline ? t('online') : t('offline')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 flex flex-col gap-1 relative">
                            {pro.verificationStatus === 'approved' && (
                                <div className="absolute -top-4 right-5 w-8 h-8 bg-white text-primary rounded-xl flex items-center justify-center shadow-lg border border-primary/10">
                                    <ShieldCheck size={16} />
                                </div>
                            )}
                            <h3 className="font-black text-sm text-gray-900 tracking-tight truncate pr-4">{pro.userId?.name}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{pro.category?.name || t('mutaxassis')}</p>

                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    <span className="text-[10px] font-black text-amber-900">{pro.rating?.toFixed(1) || '5.0'}</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-300">({pro.reviewCount || 0})</span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-xs font-black text-primary tracking-tight">
                                    {pro.services && pro.services[0] ? pro.services[0].price.toLocaleString() : '---'}
                                    <span className="text-[8px] ml-1 uppercase">{t('sum_short')}</span>
                                </span>
                                <div className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300">
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProfessionalList;
