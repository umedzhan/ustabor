const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------------
// MULTER CONFIGURATION
// ---------------------------------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error("Faqat rasm fayllari (jpg, png, webp) ruxsat etilgan!"));
    }
});

// Single file upload endpoint
app.post('/api/upload', authMiddleware.verifyToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Fayl yuklanmadi' });

        // Build the full URL
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.json({ url: fileUrl, filename: req.file.filename });
    } catch (err) {
        res.status(500).json({ error: 'Fayl yuklashda xatolik', details: err.message });
    }
});
// ---------------------------------------------------------

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
                name: telegramUser.first_name + (telegramUser.last_name ? ' ' + telegramUser.last_name : ''),
                role: 'none',
                onboarded: false
            });
            await user.save();
        } else if (user.role === 'admin') {
            // Admin users always pass through without any reset,
            // even if they lack a profile picture.
            // They access the admin panel via the Shield icon.
        } else if (!user.onboarded) {
            // Regular users (client/vendor) who haven't completed the new setup flow
            // are reset to go through onboarding again.
            user.role = 'none';
            user.onboarded = false;
            await user.save();
        }

        const token = authMiddleware.generateToken(user);
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: 'Auth failed', details: err.message });
    }
});

// Get Current User Profile
app.get('/api/user/me', authMiddleware.verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Set User Role (Onboarding)
app.post('/api/user/set-role', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['client', 'vendor', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.role = role;
        // Do not set onboarded to true yet. Onboarding is finished in the setup step.
        // Except for admin, which doesn't need extra setup here.
        if (role === 'admin') {
            user.onboarded = true;
        }
        await user.save();

        res.json({ message: 'Role updated', user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to set role' });
    }
});

// Setup User Profile (Client/Vendor Onboarding Step 2)
app.post('/api/user/setup', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { name, profilePicture } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (name) user.name = name;
        if (profilePicture) user.profilePicture = profilePicture;

        // Mark as onboarded for clients (vendors are marked in the /vendors POST route)
        if (user.role === 'client') {
            user.onboarded = true;
        }

        await user.save();
        res.json({ message: 'User setup complete', user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to complete user setup' });
    }
});

// DEV LOGIN (For testing outside Telegram)
app.get('/api/auth/dev-login', async (req, res) => {
    try {
        let user = await User.findOne({ telegramId: 'dev_user_123' });
        if (!user) {
            user = new User({
                telegramId: 'dev_user_123',
                name: 'Dev User',
                role: 'none',
                onboarded: false
            });
            await user.save();
        } else {
            // For testing the onboarding flow, constantly resetting to 'none' is bad UX.
            // But we will reset it precisely once right now if they were an admin
            if (user.role === 'admin') {
                user.role = 'none';
                user.onboarded = false;
                await user.save();
            }
        }
        const token = authMiddleware.generateToken(user);
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: 'Dev Auth failed' });
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
        const token = authMiddleware.generateToken({ _id: 'admin_id', role: 'admin' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Noto\'g\'ri login yoki parol' });
    }
});

// Middleware to verify admin token
const verifyAdmin = authMiddleware.verifyAdmin;

// 5. Create a new vendor (Admin or Vendor registration)
app.post('/api/vendors', authMiddleware.verifyToken, async (req, res) => {
    try {
        let vendor = await VendorProfile.findOne({ userId: req.user.id });

        if (vendor) {
            // Update existing vendor
            Object.assign(vendor, req.body);
            await vendor.save();
        } else {
            // Create new vendor
            vendor = new VendorProfile({ ...req.body, userId: req.user.id });
            await vendor.save();
        }

        // Update user role to vendor AND mark as onboarded
        await User.findByIdAndUpdate(req.user.id, { role: 'vendor', onboarded: true });

        res.status(201).json(vendor);
    } catch (err) {
        res.status(500).json({ error: 'Server error creating vendor', details: err.message });
    }
});

// Vendor: Get specific vendor's profile
app.get('/api/vendor/profile', authMiddleware.verifyToken, async (req, res) => {
    try {
        const vendor = await VendorProfile.findOne({ userId: req.user.id })
            .populate('category', 'name icon');

        // If not found, perhaps they haven't completed registration fully. Return a 404 but don't crash
        if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

        res.json(vendor);
    } catch (err) {
        console.error("Profile get error:", err);
        res.status(500).json({ error: 'Server error fetching vendor profile' });
    }
});

// Get reviews for a specific vendor
app.get('/api/vendors/:id/reviews', async (req, res) => {
    try {
        const reviews = await Order.find({
            vendorId: req.params.id,
            status: 'evaluated'
        })
            .populate('clientId', 'name')
            .sort({ updatedAt: -1 })
            .limit(10);

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Fikrlarni yuklashda xatolik' });
    }
});

// Vendor: Update specific vendor's profile
app.put('/api/vendor/profile', authMiddleware.verifyToken, async (req, res) => {
    try {
        const updatedVendor = await VendorProfile.findOneAndUpdate(
            { userId: req.user.id },
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate('category', 'name icon');

        if (!updatedVendor) return res.status(404).json({ error: 'Vendor profile not found' });
        res.json(updatedVendor);
    } catch (err) {
        res.status(500).json({ error: 'Server error updating vendor profile' });
    }
});

// Vendor: Get vendor's orders
app.get('/api/vendor/orders', authMiddleware.verifyToken, async (req, res) => {
    try {
        const vendor = await VendorProfile.findOne({ userId: req.user.id });
        if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

        const orders = await Order.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching vendor orders' });
    }
});

// Client: Get client's orders
app.get('/api/orders', authMiddleware.verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ clientId: req.user.id })
            .populate('vendorId', 'userId category')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching client orders' });
    }
});

// 6. Create Order
app.post('/api/orders', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { vendorId, categoryId, serviceDetails, price, paymentMethod, location, appointmentTime } = req.body;

        const newOrder = new Order({
            clientId: req.user.id,
            vendorId,
            serviceDetails,
            price,
            paymentMethod,
            location: {
                ...location,
                coordinates: [0, 0] // Default required by 2dsphere index
            },
            appointmentTime: new Date(appointmentTime),
            status: 'pending'
        });

        await newOrder.save();
        res.status(201).json({ message: 'Buyurtma muvaffaqiyatli yaratildi', order: newOrder });
    } catch (err) {
        console.error("Order error details:", err.message, err.stack);
        res.status(500).json({ error: 'Buyurtma yaratishda xatolik yuz berdi', details: err.message });
    }
});

// 7. Update Order Status
app.put('/api/orders/:id/status', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id)
            .populate('clientId', 'telegramId name')
            .populate('vendorId', 'userId');

        if (!order) return res.status(404).json({ error: 'Order not found' });

        const oldStatus = order.status;
        order.status = status;
        await order.save();

        // 1. Send Bot Notifications
        const bot = require('./bot/index');
        if (bot) {
            // Notify Client
            try {
                const clientMsg = `Sizning buyurtmangiz statusi o'zgardi: ${status.toUpperCase()}`;
                await bot.telegram.sendMessage(order.clientId.telegramId, clientMsg);
            } catch (e) { console.error("Notify client failed", e); }

            // Notify Vendor
            try {
                // vendorId points to VendorProfile, which has userId
                const vendorUser = await User.findById(order.vendorId.userId);
                if (vendorUser && vendorUser.telegramId) {
                    const vendorMsg = `Yangi buyurtma statusi: ${status.toUpperCase()}`;
                    await bot.telegram.sendMessage(vendorUser.telegramId, vendorMsg);
                }
            } catch (e) { console.error("Notify vendor failed", e); }
        }

        // 2. Financial Logic: Handle Commission when completed
        if (status === 'completed' && oldStatus !== 'completed') {
            const COMMISSION_RATE = 0.1; // 10%
            const commissionAmount = order.price * COMMISSION_RATE;

            // Deduct from vendor's wallet
            const vendorUser = await User.findById(order.vendorId.userId);
            if (vendorUser) {
                vendorUser.walletBalance = (vendorUser.walletBalance || 0) - commissionAmount;
                await vendorUser.save();

                // Record transaction
                const Transaction = require('./models/Transaction');
                const adminTransaction = new Transaction({
                    userId: vendorUser._id,
                    orderId: order._id,
                    amount: commissionAmount,
                    type: 'commission',
                    status: 'completed',
                    paymentMethod: 'wallet'
                });
                await adminTransaction.save();
            }
        }

        res.json({ message: 'Order status updated', order });
    } catch (err) {
        console.error("Status update failed:", err);
        res.status(500).json({ error: 'Server error updating status', details: err.message });
    }
});

// 8. Submit Review
app.post('/api/orders/:id/review', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Yaroqsiz reyting (1-5 bo\'lishi kerak)' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });

        // Security check: Only the client who placed the order can review it
        if (order.clientId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Ruxsat berilmagan' });
        }

        // Allow reviewing if completed or already evaluated (to update)
        if (order.status !== 'completed' && order.status !== 'evaluated') {
            return res.status(400).json({ error: 'Faqat yakunlangan buyurtmalarga fikr qoldirish mumkin' });
        }

        order.review = { rating, comment };
        order.status = 'evaluated';
        await order.save();

        // Update VendorProfile Aggregate Rating
        const vendorProfile = await VendorProfile.findById(order.vendorId);
        if (vendorProfile) {
            const evaluatedOrders = await Order.find({
                vendorId: order.vendorId,
                status: 'evaluated'
            });

            const totalRating = evaluatedOrders.reduce((acc, curr) => acc + (curr.review?.rating || 0), 0);
            vendorProfile.reviewCount = evaluatedOrders.length;
            vendorProfile.rating = Number((totalRating / evaluatedOrders.length).toFixed(1));
            await vendorProfile.save();
        }

        res.json({ message: 'Fikr muvaffaqiyatli qabul qilindi', order });
    } catch (err) {
        console.error("Review failed:", err);
        res.status(500).json({ error: 'Fikr yuborishda xatolik yuz berdi' });
    }
});

// Payout Request
app.post('/api/vendor/payout', authMiddleware.verifyVendor, async (req, res) => {
    try {
        const { amount, method } = req.body;
        const user = await User.findById(req.user.id);

        if (user.walletBalance < amount) {
            return res.status(400).json({ error: 'Mablaq yetarli emas' });
        }

        user.walletBalance -= amount;
        await user.save();

        const Transaction = require('./models/Transaction');
        const payout = new Transaction({
            userId: user._id,
            amount,
            type: 'payout',
            status: 'pending',
            paymentMethod: method
        });
        await payout.save();

        res.json({ message: 'To\'lov so\'rovi yuborildi', balance: user.walletBalance });
    } catch (err) {
        res.status(500).json({ error: 'Payout request failed' });
    }
});

// Admin: Get all vendors (with filter)
app.get('/api/admin/vendors', authMiddleware.verifyAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.verificationStatus = status;

        const vendors = await VendorProfile.find(query)
            .populate('category', 'name')
            .populate('userId', 'name phone telegramId');
        res.json(vendors);
    } catch (err) {
        res.status(500).json({ error: 'Server error retrieving vendors' });
    }
});

// Admin: Moderate Vendor
app.put('/api/admin/vendors/:id/verify', authMiddleware.verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const vendor = await VendorProfile.findByIdAndUpdate(req.params.id, { verificationStatus: status }, { new: true })
            .populate('userId', 'telegramId');

        if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

        // Notify Vendor
        const bot = require('./bot/index');
        if (bot && vendor.userId.telegramId) {
            const msg = status === 'approved'
                ? "Tabriklaymiz! Sizning usta profilingiz tasdiqlandi. Endi siz buyurtmalarni qabul qilishingiz mumkin."
                : "Afsuski, sizning usta profilingiz rad etildi. Iltimos, ma'lumotlarni tekshirib qayta urinib ko'ring.";
            await bot.telegram.sendMessage(vendor.userId.telegramId, msg);
        }

        res.json({ message: `Vendor status updated to ${status}`, vendor });
    } catch (err) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Admin: Get Dashboard Stats
app.get('/api/admin/stats', authMiddleware.verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'client' });
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const totalOrders = await Order.countDocuments();

        const recentOrders = await Order.find()
            .populate('clientId', 'name')
            .populate('vendorId', 'userId')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentReviews = await Order.find({ status: 'evaluated' })
            .populate('clientId', 'name')
            .sort({ updatedAt: -1 })
            .limit(5);

        res.json({
            stats: {
                totalUsers,
                totalVendors,
                totalOrders
            },
            recentOrders,
            recentReviews
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// Admin: Broadcast Message
app.post('/api/admin/broadcast', authMiddleware.verifyAdmin, async (req, res) => {
    try {
        const { message, targetRole } = req.body; // targetRole: 'all', 'client', 'vendor'
        let query = {};
        if (targetRole && targetRole !== 'all') query.role = targetRole;

        const users = await User.find(query);
        const bot = require('./bot/index');

        if (!bot) return res.status(500).json({ error: 'Bot not running' });

        let successCount = 0;
        for (const user of users) {
            try {
                if (user.telegramId) {
                    await bot.telegram.sendMessage(user.telegramId, message);
                    successCount++;
                }
            } catch (e) {
                console.error(`Broadcast failed for ${user.telegramId}`, e.message);
            }
        }

        res.json({ message: 'Broadcast completed', total: users.length, success: successCount });
    } catch (err) {
        res.status(500).json({ error: 'Broadcast failed' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
