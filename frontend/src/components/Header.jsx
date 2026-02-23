import { Search } from 'lucide-react';

const Header = ({ searchQuery, setSearchQuery }) => {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Ustabor</h1>
                <p className="text-xs text-gray-500 mt-1">Professional xizmatlar platformasi</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery || ''}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Qidiruv..."
                    className="w-full bg-gray-50 text-sm rounded-full py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-primary/30 transition-all border border-gray-100"
                />
            </div>
        </div>
    );
};

export default Header;
