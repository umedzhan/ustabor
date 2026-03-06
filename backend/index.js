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
const Message = require('./models/Message');
const ActivityLog = require('./models/ActivityLog');

// Helper for Admin Logs
const logActivity = async (adminId, action, targetId, targetName, details = '') => {
    try {
        await ActivityLog.create({ adminId, action, targetId, targetName, details });
    } catch (err) {
        console.error('Log error:', err);
    }
};
const Settings = require('./models/Settings');

const authMiddleware = require('./middleware/auth');
require('./bot/index'); // Initialize Telegram Bot

const app = express();
app.use(cors({
    origin: '*',
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
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error("Faqat rasm fayllari (jpg, png, webp) ruxsat etilgan!"));
    }
});

app.post('/api/upload', authMiddleware.verifyToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Fayl yuklanmadi' });
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        res.json({ url: fileUrl, filename: req.file.filename });
    } catch (err) {
        res.status(500).json({ error: 'Fayl yuklashda xatolik', details: err.message });
    }
});

// ---------------------------------------------------------
// HELPER: Sensitive info filter (phone numbers, @usernames)
// ---------------------------------------------------------
function filterSensitiveInfo(text) {
    let filtered = text;
    // Mask phone numbers: +998XXXXXXXXX, 998XXXXXXXXX, 8XXXXXXXXXX, 0XXXXXXXXXX
    filtered = filtered.replace(/(\+?[0-9]{1,3}[\s\-]?)?(\(?[0-9]{2,3}\)?[\s\-]?)[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}/g, '***');
    // Mask @usernames
    filtered = filtered.replace(/@[a-zA-Z0-9_]{3,}/g, '@***');
    const wasFiltered = filtered !== text;
    return { filtered, wasFiltered };
}

// ---------------------------------------------------------
// HELPER: Send bot notification safely
// ---------------------------------------------------------
async function sendBotMessage(telegramId, message, extra = {}) {
    try {
        const bot = require('./bot/index');
        if (bot && telegramId) {
            await bot.telegram.sendMessage(telegramId, message, { parse_mode: 'Markdown', ...extra });
        }
    } catch (e) {
        console.error('Bot message failed:', e.message);
    }
}

// ---------------------------------------------------------
// DB CONNECTION
// ---------------------------------------------------------
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ustabor')
    .then(async () => {
        console.log('MongoDB connected');
        // Seed default settings
        const defaults = [
            { key: 'commissionRate', value: 10 },
            { key: 'appName', value: 'Ustabor' },
            { key: 'logoUrl', value: '' },
            { key: 'maintenanceMode', value: false }
        ];
        for (const d of defaults) {
            await Settings.findOneAndUpdate({ key: d.key }, d, { upsert: true });
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

// ==========================================================
// AUTH ROUTES
// ==========================================================

// 1. Telegram Auth
app.post('/api/auth/telegram', async (req, res) => {
    const { initData, user: telegramUser } = req.body;
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
        }
        const token = authMiddleware.generateToken(user);
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: 'Auth failed', details: err.message });
    }
});

// 2. Logout — reset role in DB (keep onboarded separate per role logic)
app.post('/api/auth/logout', authMiddleware.verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.role = 'none';
            // Keep onboarded=true so users don't re-register if they switch back to same role
            // onboarded is per-account, not per-role
            await user.save();
        }
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Logout failed' });
    }
});


// 3. DEV LOGIN
app.get('/api/auth/dev-login', async (req, res) => {
    try {
        let user = await User.findOne({ telegramId: 'dev_user_123' });
        if (!user) {
            user = new User({ telegramId: 'dev_user_123', name: 'Dev User', role: 'none', onboarded: false });
            await user.save();
        }
        const token = authMiddleware.generateToken(user);
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: 'Dev Auth failed' });
    }
});

// ==========================================================
// USER ROUTES
// ==========================================================

app.get('/api/user/me', authMiddleware.verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get user' });
    }
});

app.post('/api/user/set-role', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['client', 'vendor', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.role = role;

        let requireSetup = !user.onboarded;

        if (role === 'admin') {
            user.onboarded = true;
            requireSetup = false;
        } else if (role === 'vendor') {
            const vendorProfile = await VendorProfile.findOne({ userId: user._id });
            if (!vendorProfile) {
                requireSetup = true; // Force setup if no vendor profile exists
            } else {
                requireSetup = false; // Already has vendor profile
                user.onboarded = true;
            }
        } else if (role === 'client') {
            // If they are onboarded as anything, they can act as client immediately
            requireSetup = !user.onboarded;
        }

        await user.save();

        // Generate a NEW token reflecting the updated role
        const newToken = authMiddleware.generateToken(user);

        res.json({ message: 'Role updated', user, token: newToken, requireSetup });
    } catch (err) {
        res.status(500).json({ error: 'Failed to set role', details: err.message, stack: err.stack });
    }
});


app.post('/api/user/setup', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { name, profilePicture } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (name) user.name = name;
        if (profilePicture) user.profilePicture = profilePicture;
        if (user.role === 'client') user.onboarded = true;
        await user.save();
        res.json({ message: 'User setup complete', user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to complete user setup' });
    }
});

// ==========================================================
// CATEGORIES
// ==========================================================
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Server error retrieving categories' });
    }
});

// ==========================================================
// FILE UPLOAD
// ==========================================================
// Already defined above (multer)

// ==========================================================
// VENDORS
// ==========================================================

app.get('/api/vendors', async (req, res) => {
    try {
        const { categoryId, search } = req.query;
        let query = {};
        if (categoryId) query.category = categoryId;
        let vendors = await VendorProfile.find(query)
            .populate('category', 'name icon')
            .populate('userId', 'name phone');
        res.json(vendors);
    } catch (err) {
        res.status(500).json({ error: 'Server error retrieving vendors' });
    }
});

// Get vendor by ID — increment viewCount
app.get('/api/vendors/:id', async (req, res) => {
    try {
        // Increment view counter
        const vendor = await VendorProfile.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewCount: 1 } },
            { new: true }
        )
            .populate('category', 'name icon')
            .populate('userId', 'name phone');
        if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
        res.json(vendor);
    } catch (err) {
        res.status(500).json({ error: 'Server error retrieving vendor details' });
    }
});

// Create / update vendor
app.post('/api/vendors', authMiddleware.verifyToken, async (req, res) => {
    try {
        let vendor = await VendorProfile.findOne({ userId: req.user.id });
        if (vendor) {
            Object.assign(vendor, req.body);
            await vendor.save();
        } else {
            vendor = new VendorProfile({ ...req.body, userId: req.user.id });
            await vendor.save();
        }
        await User.findByIdAndUpdate(req.user.id, { role: 'vendor', onboarded: true });
        res.status(201).json(vendor);
    } catch (err) {
        res.status(500).json({ error: 'Server error creating vendor', details: err.message });
    }
});

app.get('/api/vendor/profile', authMiddleware.verifyToken, async (req, res) => {
    try {
        const vendor = await VendorProfile.findOne({ userId: req.user.id }).populate('category', 'name icon');
        if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });
        res.json(vendor);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching vendor profile' });
    }
});

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

// Vendor reviews
app.get('/api/vendors/:id/reviews', async (req, res) => {
    try {
        const reviews = await Order.find({ vendorId: req.params.id, status: 'evaluated' })
            .populate('clientId', 'name')
            .sort({ updatedAt: -1 })
            .limit(10);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Fikrlarni yuklashda xatolik' });
    }
});

// Vendor orders
app.get('/api/vendor/orders', authMiddleware.verifyToken, async (req, res) => {
    try {
        const vendor = await VendorProfile.findOne({ userId: req.user.id });
        if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });
        const orders = await Order.find({ vendorId: vendor._id })
            .populate('clientId', 'name phone')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching vendor orders' });
    }
});

// ==========================================================
// VENDOR REPORT
// ==========================================================
app.get('/api/vendor/report', authMiddleware.verifyToken, async (req, res) => {
    try {
        const vendor = await VendorProfile.findOne({ userId: req.user.id });
        if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

        const allOrders = await Order.find({ vendorId: vendor._id });
        const completed = allOrders.filter(o => ['completed', 'evaluated'].includes(o.status));
        const cancelled = allOrders.filter(o => o.status === 'cancelled');
        const pending = allOrders.filter(o => ['pending', 'accepted', 'in_progress'].includes(o.status));

        const totalEarned = completed.reduce((sum, o) => sum + (o.price || 0), 0);
        const commissionSetting = await Settings.findOne({ key: 'commissionRate' });
        const commissionRate = commissionSetting ? commissionSetting.value : 10;
        const totalCommission = (totalEarned * commissionRate) / 100;
        const netEarned = totalEarned - totalCommission;

        // Monthly breakdown (last 6 months)
        const now = new Date();
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const monthOrders = completed.filter(o => {
                const created = new Date(o.createdAt);
                return created >= d && created <= monthEnd;
            });
            const monthEarned = monthOrders.reduce((sum, o) => sum + (o.price || 0), 0);
            monthlyData.push({
                month: d.toLocaleString('uz-UZ', { month: 'short', year: 'numeric' }),
                orders: monthOrders.length,
                earned: monthEarned
            });
        }

        res.json({
            totalOrders: allOrders.length,
            completedOrders: completed.length,
            cancelledOrders: cancelled.length,
            pendingOrders: pending.length,
            totalEarned,
            totalCommission,
            netEarned,
            viewCount: vendor.viewCount || 0,
            rating: vendor.rating || 0,
            reviewCount: vendor.reviewCount || 0,
            monthlyData,
            commissionRate
        });
    } catch (err) {
        res.status(500).json({ error: 'Report yuklashda xatolik', details: err.message });
    }
});

// ==========================================================
// ORDERS
// ==========================================================

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
                coordinates: (location && location.coordinates) ? location.coordinates : [0, 0]
            },
            appointmentTime: new Date(appointmentTime),
            status: 'pending'
        });
        await newOrder.save();

        // Notify vendor via bot
        const vendorProfile = await VendorProfile.findById(vendorId).populate('userId');
        if (vendorProfile && vendorProfile.userId) {
            const client = await User.findById(req.user.id);
            await sendBotMessage(
                vendorProfile.userId.telegramId,
                `🔔 Yangi buyurtma!\n👤 Mijoz: ${client?.name || 'Noma\'lum'}\n💰 Narx: ${price?.toLocaleString() || 0} so'm\n📋 Xizmat: ${serviceDetails?.name || '-'}\n\nTasdiqlash uchun ilovani oching.`
            );
        }

        res.status(201).json({ message: 'Buyurtma muvaffaqiyatli yaratildi', order: newOrder });
    } catch (err) {
        console.error("Order error details:", err.message, err.stack);
        res.status(500).json({ error: 'Buyurtma yaratishda xatolik yuz berdi', details: err.message });
    }
});

app.put('/api/orders/:id/status', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id)
            .populate('clientId', 'telegramId name')
            .populate({ path: 'vendorId', populate: { path: 'userId' } });

        if (!order) return res.status(404).json({ error: 'Order not found' });

        const oldStatus = order.status;
        order.status = status;

        // Lock chat when order completes
        if (status === 'completed' || status === 'cancelled') {
            order.chatLocked = true;
        }

        await order.save();

        // Bot Notifications
        const clientTgId = order.clientId?.telegramId;
        const vendorTgId = order.vendorId?.userId?.telegramId;
        const vendorName = order.vendorId?.userId?.name || 'Usta';
        const clientName = order.clientId?.name || 'Mijoz';

        if (status === 'accepted') {
            await sendBotMessage(clientTgId, `✅ ${vendorName} buyurtmangizni qabul qildi! Buyurtma № ${order._id.toString().slice(-6).toUpperCase()}`);
            await sendBotMessage(vendorTgId, `📋 Siz buyurtmani qabul qildingiz.\n💰 Narx: ${order.price?.toLocaleString()} so'm`);
        } else if (status === 'in_progress') {
            await sendBotMessage(clientTgId, `🔨 ${vendorName} ish boshladi! Baxtli turar!`);
        } else if (status === 'completed') {
            await sendBotMessage(clientTgId, `🎉 Buyurtmangiz yakunlandi! Iltimos, bahо qoldiring.`);
            await sendBotMessage(vendorTgId, `✅ Buyurtma yakunlandi.\n💰 +${order.price?.toLocaleString()} so'm qo'shildi.`);
        } else if (status === 'cancelled') {
            await sendBotMessage(clientTgId, `❌ Buyurtmangiz bekor qilindi.`);
            await sendBotMessage(vendorTgId, `❌ Buyurtma bekor qilindi.`);
        }

        // Financial Logic: commission on completion
        if (status === 'completed' && oldStatus !== 'completed') {
            const commissionSetting = await Settings.findOne({ key: 'commissionRate' });
            const COMMISSION_RATE = (commissionSetting?.value || 10) / 100;
            const commissionAmount = order.price * COMMISSION_RATE;

            const vendorUser = await User.findById(order.vendorId?.userId?._id || order.vendorId?.userId);
            if (vendorUser) {
                vendorUser.walletBalance = (vendorUser.walletBalance || 0) - commissionAmount;
                await vendorUser.save();
                const Transaction = require('./models/Transaction');
                await new Transaction({
                    userId: vendorUser._id,
                    orderId: order._id,
                    amount: commissionAmount,
                    type: 'commission',
                    status: 'completed',
                    paymentMethod: 'wallet'
                }).save();
            }
        }

        res.json({ message: 'Order status updated', order });
    } catch (err) {
        console.error("Status update failed:", err);
        res.status(500).json({ error: 'Server error updating status', details: err.message });
    }
});

// Submit review
app.post('/api/orders/:id/review', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Yaroqsiz reyting (1-5 bo\'lishi kerak)' });
        }
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });
        if (order.clientId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Ruxsat berilmagan' });
        }
        if (order.status !== 'completed' && order.status !== 'evaluated') {
            return res.status(400).json({ error: 'Faqat yakunlangan buyurtmalarga fikr qoldirish mumkin' });
        }
        order.review = { rating, comment };
        order.status = 'evaluated';
        await order.save();

        const vendorProfile = await VendorProfile.findById(order.vendorId);
        if (vendorProfile) {
            const evaluatedOrders = await Order.find({ vendorId: order.vendorId, status: 'evaluated' });
            const totalRating = evaluatedOrders.reduce((acc, curr) => acc + (curr.review?.rating || 0), 0);
            vendorProfile.reviewCount = evaluatedOrders.length;
            vendorProfile.rating = Number((totalRating / evaluatedOrders.length).toFixed(1));
            await vendorProfile.save();
        }
        res.json({ message: 'Fikr muvaffaqiyatli qabul qilindi', order });
    } catch (err) {
        res.status(500).json({ error: 'Fikr yuborishda xatolik yuz berdi' });
    }
});

// ==========================================================
// CHAT
// ==========================================================

// Get chat messages for an order
app.get('/api/chat/:orderId/messages', authMiddleware.verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('clientId', '_id')
            .populate({ path: 'vendorId', populate: { path: 'userId', select: '_id' } });
        if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });

        // Only client or vendor can read
        const clientId = order.clientId?._id?.toString();
        const vendorUserId = order.vendorId?.userId?._id?.toString();
        if (req.user.id !== clientId && req.user.id !== vendorUserId) {
            return res.status(403).json({ error: 'Ruxsat yo\'q' });
        }

        const messages = await Message.find({ orderId: req.params.orderId })
            .populate('senderId', 'name role')
            .sort({ createdAt: 1 });

        // Mark messages as read for the receiver
        await Message.updateMany(
            { orderId: req.params.orderId, senderId: { $ne: req.user.id }, status: 'unread' },
            { $set: { status: 'read' } }
        );

        res.json({ messages, chatLocked: order.chatLocked });
    } catch (err) {
        res.status(500).json({ error: 'Xabarlarni yuklashda xatolik' });
    }
});

// Get unread messages count for the logged-in user
app.get('/api/notifications/unread-count', authMiddleware.verifyToken, async (req, res) => {
    try {
        // Find all orders where user is client or vendor
        const orders = await Order.find({
            $or: [
                { clientId: req.user.id },
                { 'vendorId.userId': req.user.id }
            ]
        }).select('_id');

        const orderIds = orders.map(o => o._id);

        const unreadCount = await Message.countDocuments({
            orderId: { $in: orderIds },
            senderId: { $ne: req.user.id },
            status: 'unread'
        });

        res.json({ count: unreadCount });
    } catch (err) {
        res.status(500).json({ error: 'Unread count error' });
    }
});

// Send a chat message
app.post('/api/chat/:orderId/send', authMiddleware.verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('clientId', '_id telegramId name')
            .populate({ path: 'vendorId', populate: { path: 'userId', select: '_id telegramId name' } });
        if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });

        // Check if chat is locked
        if (order.chatLocked) {
            return res.status(403).json({ error: 'Bu chat yopilgan. Buyurtma yakunlangan.' });
        }

        // Check if sender is part of this order
        const clientId = order.clientId?._id?.toString();
        const vendorUserId = order.vendorId?.userId?._id?.toString();
        if (req.user.id !== clientId && req.user.id !== vendorUserId) {
            return res.status(403).json({ error: 'Ruxsat yo\'q' });
        }

        const { text } = req.body;
        if (!text || !text.trim()) return res.status(400).json({ error: 'Xabar bo\'sh bo\'lmasligi kerak' });

        // Filter sensitive info
        const { filtered, wasFiltered } = filterSensitiveInfo(text.trim());

        const message = new Message({
            orderId: req.params.orderId,
            senderId: req.user.id,
            text: filtered,
            isFiltered: wasFiltered
        });
        await message.save();
        await message.populate('senderId', 'name role');

        // Send bot notification to the OTHER party
        const senderIsClient = req.user.id === clientId;
        const recipientTgId = senderIsClient
            ? order.vendorId?.userId?.telegramId
            : order.clientId?.telegramId;
        const senderName = senderIsClient ? order.clientId?.name : order.vendorId?.userId?.name;

        if (recipientTgId) {
            const botDeepLink = `https://t.me/${process.env.BOT_USERNAME || 'ustabor_bot'}?start=${req.params.orderId}`;
            await sendBotMessage(
                recipientTgId,
                `💬 *${senderName || 'Foydalanuvchi'}* xabar yozdi:\n\n"${filtered.substring(0, 100)}${filtered.length > 100 ? '...' : ''}"\n\nJavob yozish uchun ilovani oching.`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '✉️ Xabarni o\'qish', web_app: { url: `${process.env.FRONTEND_URL}/chat/${req.params.orderId}` } }],
                            [{ text: '🤖 Botda ochish', url: botDeepLink }]
                        ]
                    }
                }
            );
        }

        res.status(201).json({ message, wasFiltered });
    } catch (err) {
        res.status(500).json({ error: 'Xabar yuborishda xatolik', details: err.message });
    }
});

// ==========================================================
// PAYOUT
// ==========================================================
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
        const payout = new Transaction({ userId: user._id, amount, type: 'payout', status: 'pending', paymentMethod: method });
        await payout.save();
        res.json({ message: 'To\'lov so\'rovi yuborildi', balance: user.walletBalance });
    } catch (err) {
        res.status(500).json({ error: 'Payout request failed' });
    }
});

// ==========================================================
// ADMIN ROUTES
// ==========================================================

const verifyAdmin = authMiddleware.verifyAdmin;

// Dashboard stats
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'client' });
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $in: ['completed', 'evaluated'] } } },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);
        const commissionSetting = await Settings.findOne({ key: 'commissionRate' });
        const commissionRate = commissionSetting?.value || 10;
        const grossRevenue = totalRevenue[0]?.total || 0;
        const commission = (grossRevenue * commissionRate) / 100;

        const recentOrders = await Order.find()
            .populate('clientId', 'name')
            .populate('vendorId', 'userId category')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentReviews = await Order.find({ status: 'evaluated' })
            .populate('clientId', 'name')
            .sort({ updatedAt: -1 })
            .limit(5);

        // Monthly new users chart data
        const now = new Date();
        const monthlyStats = [];
        for (let i = 5; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const newUsers = await User.countDocuments({ role: 'client', createdAt: { $gte: start, $lte: end } });
            const newVendors = await User.countDocuments({ role: 'vendor', createdAt: { $gte: start, $lte: end } });
            const monthOrders = await Order.countDocuments({ createdAt: { $gte: start, $lte: end } });
            monthlyStats.push({
                month: start.toLocaleString('uz-UZ', { month: 'short' }),
                users: newUsers,
                vendors: newVendors,
                orders: monthOrders
            });
        }

        res.json({
            stats: { totalUsers, totalVendors, totalOrders, grossRevenue, commission, commissionRate },
            recentOrders,
            recentReviews,
            monthlyStats
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// Admin: Full reports
app.get('/api/admin/reports', verifyAdmin, async (req, res) => {
    try {
        const allOrders = await Order.find().populate('clientId', 'name').populate('vendorId', 'userId');
        const completed = allOrders.filter(o => ['completed', 'evaluated'].includes(o.status));
        const grossRevenue = completed.reduce((s, o) => s + (o.price || 0), 0);
        const commissionSetting = await Settings.findOne({ key: 'commissionRate' });
        const rate = commissionSetting?.value || 10;

        // Top vendors by earnings
        const vendorMap = {};
        for (const o of completed) {
            const vid = o.vendorId?._id?.toString();
            if (!vid) continue;
            if (!vendorMap[vid]) vendorMap[vid] = { vendorId: vid, orders: 0, earned: 0 };
            vendorMap[vid].orders++;
            vendorMap[vid].earned += o.price || 0;
        }
        const topVendors = Object.values(vendorMap).sort((a, b) => b.earned - a.earned).slice(0, 10);

        res.json({
            totalOrders: allOrders.length,
            completedOrders: completed.length,
            grossRevenue,
            commission: (grossRevenue * rate) / 100,
            commissionRate: rate,
            topVendors
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Admin: Get all users (with filters)
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};
        if (role) query.role = role;
        if (search) query.name = { $regex: search, $options: 'i' };
        const users = await User.find(query).sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Admin: Update user
app.put('/api/admin/users/:id', verifyAdmin, async (req, res) => {
    try {
        const { name, role, phone, onboarded } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { name, role, phone, onboarded } },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        await logActivity(req.user._id, 'update_user', user._id, user.name);
        res.json({ message: 'User updated', user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Admin: Delete user
app.delete('/api/admin/users/:id', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        await VendorProfile.findOneAndDelete({ userId: req.params.id });
        if (user) await logActivity(req.user._id, 'delete_user', user._id, user.name);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Admin: Get all orders
app.get('/api/admin/orders', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;
        const orders = await Order.find(query)
            .populate('clientId', 'name phone')
            .populate({ path: 'vendorId', populate: { path: 'userId', select: 'name' } })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Admin: Update order
app.put('/api/admin/orders/:id', verifyAdmin, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order updated', order });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// Admin: Delete order
app.delete('/api/admin/orders/:id', verifyAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        await Message.deleteMany({ orderId: req.params.id });
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// Admin: Get all chats (read-only overview)
app.get('/api/admin/chats', verifyAdmin, async (req, res) => {
    try {
        // Get all orders that have messages
        const ordersWithChats = await Message.aggregate([
            { $group: { _id: '$orderId', messageCount: { $sum: 1 }, lastMessage: { $last: '$text' }, lastAt: { $last: '$createdAt' } } },
            { $sort: { lastAt: -1 } },
            { $limit: 50 }
        ]);

        const populated = await Promise.all(ordersWithChats.map(async (chat) => {
            const order = await Order.findById(chat._id)
                .populate('clientId', 'name')
                .populate({ path: 'vendorId', populate: { path: 'userId', select: 'name' } });
            return { ...chat, order };
        }));

        res.json(populated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get chats' });
    }
});

// Admin: Get messages of a specific chat
app.get('/api/admin/chats/:orderId', verifyAdmin, async (req, res) => {
    try {
        const messages = await Message.find({ orderId: req.params.orderId })
            .populate('senderId', 'name role')
            .sort({ createdAt: 1 });
        const order = await Order.findById(req.params.orderId)
            .populate('clientId', 'name')
            .populate({ path: 'vendorId', populate: { path: 'userId', select: 'name' } });
        res.json({ messages, order });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get chat messages' });
    }
});

// Admin: Get all vendors
app.get('/api/admin/vendors', verifyAdmin, async (req, res) => {
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

// Admin: Moderate vendor
app.put('/api/admin/vendors/:id/verify', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const vendor = await VendorProfile.findByIdAndUpdate(
            req.params.id,
            { verificationStatus: status },
            { new: true }
        ).populate('userId', 'telegramId name');
        if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

        const msg = status === 'approved'
            ? "✅ Tabriklaymiz! Sizning usta profilingiz tasdiqlandi. Endi siz buyurtmalarni qabul qilishingiz mumkin."
            : "❌ Afsuski, sizning usta profilingiz rad etildi. Iltimos, ma'lumotlarni tekshirib qayta urinib ko'ring.";
        await sendBotMessage(vendor.userId?.telegramId, msg);
        await logActivity(req.user._id, 'verify_vendor', vendor._id, vendor.userId?.name, `Status: ${status}`);

        res.json({ message: `Vendor status updated to ${status}`, vendor });
    } catch (err) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Admin: Delete vendor profile
app.delete('/api/admin/vendors/:id', verifyAdmin, async (req, res) => {
    try {
        const vendor = await VendorProfile.findByIdAndDelete(req.params.id);
        if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
        res.json({ message: 'Vendor deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete vendor' });
    }
});

// Admin: Settings CRUD
app.get('/api/admin/settings', verifyAdmin, async (req, res) => {
    try {
        const settings = await Settings.find();
        const result = {};
        settings.forEach(s => { result[s.key] = s.value; });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

app.put('/api/admin/settings', verifyAdmin, async (req, res) => {
    try {
        const updates = req.body; // { commissionRate: 12, appName: 'Ustabor', ... }
        for (const [key, value] of Object.entries(updates)) {
            await Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true });
        }
        res.json({ message: 'Settings updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Admin: Broadcast message
app.post('/api/admin/broadcast', verifyAdmin, async (req, res) => {
    try {
        const { message, targetRole } = req.body;
        let query = {};
        if (targetRole && targetRole !== 'all') query.role = targetRole;
        const users = await User.find(query);

        let successCount = 0;
        for (const u of users) {
            if (u.telegramId) {
                await sendBotMessage(u.telegramId, message);
                successCount++;
            }
        }
        res.json({ message: 'Broadcast completed', total: users.length, success: successCount });
    } catch (err) {
        res.status(500).json({ error: 'Broadcast failed' });
    }
});

// Admin: Staff — create staff user (by setting role='staff')
app.post('/api/admin/staff', verifyAdmin, async (req, res) => {
    try {
        const { telegramId, name, phone } = req.body;
        let user = await User.findOne({ telegramId });
        if (!user) {
            user = new User({ telegramId, name: name || 'Staff', phone, role: 'staff', onboarded: true });
            await user.save();
        } else {
            user.role = 'staff';
            user.onboarded = true;
            await user.save();
        }
        res.json({ message: 'Staff member created', user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create staff', details: err.message });
    }
});

app.get('/api/admin/staff', verifyAdmin, async (req, res) => {
    try {
        const staff = await User.find({ role: { $in: ['admin', 'staff'] } }).sort({ createdAt: -1 });
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get staff' });
    }
});

// Admin: Upload logo (settings)
app.post('/api/admin/upload-logo', verifyAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Fayl yuklanmadi' });
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        // Save to settings
        Settings.findOneAndUpdate({ key: 'logoUrl' }, { key: 'logoUrl', value: fileUrl }, { upsert: true }).catch(console.error);
        res.json({ url: fileUrl });
    } catch (err) {
        res.status(500).json({ error: 'Logo yuklashda xatolik' });
    }
});

// Admin: Transactions History
const Transaction = require('./models/Transaction');
app.get('/api/admin/transactions', verifyAdmin, async (req, res) => {
    try {
        const { type, status } = req.query;
        let query = {};
        if (type) query.type = type;
        if (status) query.status = status;
        const transactions = await Transaction.find(query)
            .populate('userId', 'name role phone')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

// Admin: Update Transaction Status (e.g. payout approval)
app.put('/api/admin/transactions/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const transaction = await Transaction.findById(req.params.id).populate('userId');
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        transaction.status = status;
        await transaction.save();

        // Notify user via bot
        if (transaction.userId?.telegramId) {
            const msg = status === 'completed'
                ? `✅ Sizning ${transaction.amount.toLocaleString()} so'mlik to'lov so'rovingiz tasdiqlandi!`
                : `❌ Sizning ${transaction.amount.toLocaleString()} so'mlik to'lov so'rovingiz rad etildi.`;
            await sendBotMessage(transaction.userId.telegramId, msg);
        }

        res.json({ message: 'Transaction status updated', transaction });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update transaction status' });
    }
});

// Admin: Category CRUD
app.post('/api/admin/categories', verifyAdmin, async (req, res) => {
    try {
        const { name, icon } = req.body;
        const category = new Category({ name, icon });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

app.put('/api/admin/categories/:id', verifyAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});

app.delete('/api/admin/categories/:id', verifyAdmin, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

app.get('/api/admin/categories', verifyAdmin, async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// ==========================================================
// SERVER
// ==========================================================
// Admin: Global Search
app.get('/api/admin/search', verifyAdmin, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ users: [], orders: [], vendors: [] });

        const regex = new RegExp(q, 'i');

        const [users, vendors, orders] = await Promise.all([
            User.find({ $or: [{ name: regex }, { phone: regex }] }).limit(10),
            VendorProfile.find().populate('userId').then(vps =>
                vps.filter(v => v.userId?.name.match(regex) || v.bio?.match(regex)).slice(0, 10)
            ),
            Order.find().populate('clientId').then(os =>
                os.filter(o => o.clientId?.name.match(regex) || o.serviceDetails?.name.match(regex)).slice(0, 10)
            )
        ]);

        res.json({ users, vendors, orders });
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// Admin: Get Activity Logs
app.get('/api/admin/logs', verifyAdmin, async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .populate('adminId', 'name')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
