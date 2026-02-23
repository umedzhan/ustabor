import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const ProfessionalList = ({ categoryFilter, searchQuery }) => {
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPros = async () => {
            setLoading(true);
            try {
                let url = `${API_URL}/professionals?`;
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
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-gray-800">Usta mutaxassislar</h2>
                <button className="text-xs font-semibold text-primary">Barchasi</button>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-8">
                {professionals.map((pro) => (
                    <Link to={`/professional/${pro._id}`} key={pro._id} className="flex flex-col border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-40 w-full overflow-hidden">
                            <img src={pro.imageUrl} alt={pro.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 flex flex-col gap-1 bg-white">
                            <h3 className="font-bold text-sm text-gray-800">{pro.name}</h3>
                            <p className="text-xs text-gray-500">{pro.category?.name}</p>

                            <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-bold text-gray-800">{pro.rating}</span>
                                <span className="text-xs text-gray-400">({pro.reviewCount})</span>
                            </div>

                            <p className="text-sm font-bold text-primary mt-1">
                                {pro.hourlyRate.toLocaleString()} so'm
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProfessionalList;
