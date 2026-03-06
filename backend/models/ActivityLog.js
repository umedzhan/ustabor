const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'verify_vendor', 'delete_user', 'update_category'
    targetId: { type: mongoose.Schema.Types.ObjectId }, // ID of the user/vendor/order affected
    targetName: { type: String }, // Name/Title of the target for easy reading
    details: { type: String },
    ip: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
