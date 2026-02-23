import { useEffect, useState } from 'react';
import axios from 'axios';
import { Zap, Droplets, Hammer, PaintRoller, Wrench, Home } from 'lucide-react';
import { API_URL } from '../config';

// Map icon strings to lucide-react components
const iconMap = {
    'zap': Zap,
    'droplet': Droplets,
    'hammer': Hammer,
    'paint-roller': PaintRoller,
    'wrench': Wrench,
    'home': Home
};

const categoryColors = {
    'zap': 'text-amber-500',
    'droplet': 'text-blue-400',
    'hammer': 'text-orange-800',
    'paint-roller': 'text-pink-400',
    'wrench': 'text-green-500',
    'home': 'text-purple-400'
};

const CategoryList = ({ onSelect, selected }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/categories`);
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) return <div className="animate-pulse h-24 bg-gray-50 rounded-xl"></div>;

    return (
        <div className="flex flex-col gap-3">
            <h2 className="font-bold text-gray-800">Kategoriyalar</h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-3">
                {categories.map((cat) => {
                    const IconComponent = iconMap[cat.icon] || Wrench;
                    const colorClass = categoryColors[cat.icon] || 'text-gray-500';
                    const isSelected = selected === cat._id;

                    return (
                        <button
                            key={cat._id}
                            onClick={() => onSelect(isSelected ? null : cat._id)}
                            className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-100 bg-white hover:border-primary/30 shadow-sm'
                                }`}
                        >
                            <div className={`p-2 rounded-full bg-gray-50 ${colorClass}`}>
                                <IconComponent size={20} strokeWidth={2} />
                            </div>
                            <span className="text-[11px] font-medium text-gray-600 text-center w-full truncate">
                                {cat.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryList;
