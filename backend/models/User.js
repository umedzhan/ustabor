const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String },
    profilePicture: { type: String },
    role: { type: String, enum: ['none', 'client', 'vendor', 'admin', 'staff'], default: 'none' },
    onboarded: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
