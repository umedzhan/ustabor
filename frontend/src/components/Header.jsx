import { Search, UserPlus, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Header = ({ searchQuery, setSearchQuery }) => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => logout(navigate)}
                        className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-primary transition-colors border border-gray-100"
                        title={t('back')}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Ustabor</h1>
                        <p className="text-xs text-gray-500 mt-1">{t('platform_subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {user && user.role === 'client' && (
                        <Link to="/vendor/register" className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-full hover:bg-primary/20 transition-colors">
                            <UserPlus size={16} />
                            {t('become_master')}
                        </Link>
                    )}
                    {user && user.role === 'vendor' && (
                        <Link to="/vendor/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-full hover:bg-primary/20 transition-colors">
                            <LayoutDashboard size={16} />
                            {t('cabinet')}
                        </Link>
                    )}
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery || ''}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search_placeholder')}
                    className="w-full bg-gray-50 text-sm rounded-full py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-primary/30 transition-all border border-gray-100"
                />
            </div>
        </div>
    );
};

export default Header;
