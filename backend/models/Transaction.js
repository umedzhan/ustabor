const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Optional, for payouts it might be empty
    amount: { type: Number, required: true },
    type: { type: String, enum: ['payment', 'payout', 'commission', 'deposit'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cash', 'card', 'click', 'payme', 'wallet'] },
    reference: { type: String } // external transaction ID
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
