const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String }, // Can be set after sharing contact
    role: { type: String, enum: ['client', 'vendor', 'admin'], default: 'client' },
    walletBalance: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
