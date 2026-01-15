const mongoose = require('mongoose');

const activationKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usedAt: { type: Date },
  used: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ActivationKey', activationKeySchema);