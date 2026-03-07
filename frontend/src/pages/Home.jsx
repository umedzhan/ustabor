import Header from '../components/Header';
import CategoryList from '../components/CategoryList';
import ProfessionalList from '../components/ProfessionalList';
import { useState } from 'react';

const Home = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="flex flex-col gap-6 pt-4 px-4 pb-32 bg-white min-h-screen">
            <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <CategoryList onSelect={setSelectedCategory} selected={selectedCategory} />
            <ProfessionalList categoryFilter={selectedCategory} searchQuery={searchQuery} />
        </div>
    );
}

export default Home;
