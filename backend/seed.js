const mongoose = require('mongoose');
const Category = require('./models/Category');
const Professional = require('./models/Professional');

mongoose.connect('mongodb://127.0.0.1:27017/ustabor').then(() => console.log('MongoDB connected for seeding'))
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });

const seedDatabase = async () => {
    try {
        // Clear existing data
        await Category.deleteMany();
        await Professional.deleteMany();

        // 1. Seed Categories
        const categoriesData = [
            { name: 'Elektrik', icon: 'zap' },
            { name: 'Santexnik', icon: 'droplet' },
            { name: 'Duradgor', icon: 'hammer' },
            { name: "Bo'yoqchi", icon: 'paint-roller' }, // Or use custom icons mapping
            { name: "Ta'mir", icon: 'wrench' },
            { name: 'Uy jihozlari', icon: 'home' }
        ];

        const insertedCategories = await Category.insertMany(categoriesData);
        console.log(`${insertedCategories.length} categories seeded.`);

        // Map categories by name for easy reference
        const categoryMap = {};
        insertedCategories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });

        // 2. Seed Professionals
        const professionalsData = [
            {
                name: 'Rustam Karimov',
                category: categoryMap['Elektrik'],
                rating: 4.8,
                reviewCount: 127,
                hourlyRate: 50000,
                experienceYears: 5,
                completedJobs: 145,
                location: 'Toshkent, Yunusobod tumani',
                aboutText: "Malakali elektrik. Barcha turdagi elektr ishlari. Tezkor va sifatli xizmat.",
                services: ["Simlarni almashtirish", "Rozetkalarni o'rnatish", "Lyustra osish", "Qisqa tutashuvni bartaraf etish"],
                imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            },
            {
                name: 'Sardor Aliyev',
                category: categoryMap['Santexnik'],
                rating: 4.9,
                reviewCount: 98,
                hourlyRate: 45000,
                experienceYears: 6,
                completedJobs: 189, // From screenshot
                location: 'Toshkent, Chilonzor tumani',
                aboutText: "Malakali santexnik. Barcha turdagi santexnika ishlari. Tezkor va sifatli xizmat.",
                services: ["Quvur almashtirish", "Kranlar ta'mirlash", "Vannalar o'rnatish", "Oqava tizimini tozalash"],
                imageUrl: "https://images.unsplash.com/photo-1542013936693-884638332954?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            },
            {
                name: 'Aziz Toshmatov',
                category: categoryMap['Duradgor'],
                rating: 4.7,
                reviewCount: 156,
                hourlyRate: 60000,
                experienceYears: 8,
                completedJobs: 320,
                location: 'Toshkent, Mirzo Ulug\'bek tumani',
                aboutText: "Darvozalar, eshik va derazalar yasash. Uylarni ta'mirlash ishlari.",
                services: ["Eshik o'rnatish", "Deraza romlari yasash", "Mebel ta'mirlash"],
                imageUrl: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            },
            {
                name: 'Javlon Rahimov',
                category: categoryMap["Ta'mir"],
                rating: 4.6,
                reviewCount: 89,
                hourlyRate: 55000,
                experienceYears: 4,
                completedJobs: 112,
                location: 'Toshkent, Sergeli tumani',
                aboutText: "Kichik ta'mirlash ishlarini sifatli bajaraman.",
                services: ["Kafel terish", "Devor qog'ozi yopishtirish", "Gipsokarton o'rnatish"],
                imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            }
        ];

        const insertedProfessionals = await Professional.insertMany(professionalsData);
        console.log(`${insertedProfessionals.length} professionals seeded.`);

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedDatabase();
