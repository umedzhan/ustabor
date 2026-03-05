const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    isFiltered: { type: Boolean, default: false } // true if content was masked
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
