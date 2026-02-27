const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Category = require('./models/Category');
const User = require('./models/User');
const VendorProfile = require('./models/VendorProfile');
const Order = require('./models/Order');

const authMiddleware = require('./middleware/auth');
require('./bot/index'); // Initialize Telegram Bot

const app = express();
app.use(cors({
    origin: '*', // Yoki faqat ruxsat etilgan domenlarni yozish: ['https://ustabor.agrom24.uz', 'http://localhost:5173']
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ustabor').then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


// API Routes

// 1. Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Server error retrieving categories' });
    }
});

// 2. Auth with Telegram initData
app.post('/api/auth/telegram', async (req, res) => {
    const { initData, user: telegramUser } = req.body;

    // In production we should strictly validate initData.
    // We'll skip strict failure if BOT_TOKEN isn't set yet during dev.
    const isValid = authMiddleware.validateInitData(initData);
    if (!isValid && process.env.BOT_TOKEN) {
        return res.status(401).json({ error: 'Invalid initData' });
    }

    try {
        if (!telegramUser || !telegramUser.id) {
            return res.status(400).json({ error: 'Telegram user data missing' });
        }

        let user = await User.findOne({ telegramId: telegramUser.id.toString() });
        if (!user) {
            user = new User({
                telegramId: telegramUser.id.toString(),
                name: telegramUser.first_name + (telegramUser.last_name ? ' ' + telegramUser.last_name : '')
            });
            await user.save();
        }

        const token = authMiddleware.generateToken(user);
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: 'Auth failed', details: err.message });
    }
});

// 3. Get all vendors
app.get('/api/vendors', async (req, res) => {
    try {
        const { categoryId, search } = req.query;
        let query = {};
        if (categoryId) {
            query.category = categoryId;
        }

        let vendors = await VendorProfile.find(query)
            .populate('category', 'name icon')
            .populate('userId', 'name phone');

        res.json(vendors);
    } catch (err) {
        res.status(500).json({ error: 'Server error retrieving vendors' });
    }
});

// 4. Get a single vendor by ID
app.get('/api/vendors/:id', async (req, res) => {
    try {
        const vendor = await VendorProfile.findById(req.params.id)
            .populate('category', 'name icon')
            .populate('userId', 'name phone');

        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found' });
        }
        res.json(vendor);
    } catch (err) {
        res.status(500).json({ error: 'Server error retrieving vendor details' });
    }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({ token: 'ustabor-secure-token-123' });
    } else {
        res.status(401).json({ error: 'Noto\'g\'ri login yoki parol' });
    }
});

// Middleware to verify admin token
const verifyAdmin = authMiddleware.verifyAdmin;

// 5. Create a new vendor (Admin or Vendor registration)
app.post('/api/vendors', authMiddleware.verifyToken, async (req, res) => {
    try {
        const newVendor = new VendorProfile({ ...req.body, userId: req.user.id });
        const savedVendor = await newVendor.save();

        // Update user role to vendor
        await User.findByIdAndUpdate(req.user.id, { role: 'vendor' });

        res.status(201).json(savedVendor);
    } catch (err) {
        res.status(500).json({ error: 'Server error creating vendor', details: err.message });
    }
});

// 6. Create Order
app.post('/api/orders', async (req, res) => {
    try {
        const { vendorId, categoryId, serviceDetails, price, paymentMethod, location, appointmentTime } = req.body;

        // In production, `clientId` should be populated securely
        const newOrder = new Order({
            vendorId,
            serviceDetails,
            price,
            paymentMethod,
            location,
            appointmentTime: new Date(appointmentTime),
            status: 'pending'
        });

        await newOrder.save();
        res.status(201).json({ message: 'Buyurtma muvaffaqiyatli yaratildi', order: newOrder });
    } catch (err) {
        console.error("Order error:", err);
        res.status(500).json({ error: 'Buyurtma yaratishda xatolik yuz berdi' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
