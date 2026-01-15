const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'sent' }, // sent, failed, pending
  deviceId: { type: String }, // Device ID from mobile app
}, { timestamps: true });

module.exports = mongoose.model('MessageLog', messageLogSchema);