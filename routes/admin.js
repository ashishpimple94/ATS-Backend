const express = require('express');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const ActivationKey = require('../models/ActivationKey');
const MessageLog = require('../models/MessageLog');
const crypto = require('crypto');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const totalKeys = await ActivationKey.countDocuments({});
    const activeKeys = await ActivationKey.countDocuments({ isActive: true });
    const usedKeys = await ActivationKey.countDocuments({ used: true });
    const totalMessages = await MessageLog.countDocuments({});

    res.json({
      totalKeys,
      activeKeys,
      usedKeys,
      totalMessages,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate activation keys
router.post('/generate-keys', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { numberOfKeys, expiresAt } = req.body;

    const keys = [];
    for (let i = 0; i < numberOfKeys; i++) {
      const key = crypto.randomBytes(32).toString('hex');
      
      const activationKey = new ActivationKey({
        key,
        createdBy: req.userId,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      });

      await activationKey.save();
      keys.push(activationKey.key);
    }

    res.json({
      message: `${numberOfKeys} activation keys generated successfully`,
      keys
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all activation keys
router.get('/keys', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const keys = await ActivationKey.find({})
      .populate('createdBy', 'username email')
      .populate('usedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json(keys);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all message logs
router.get('/messages', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const messages = await MessageLog.find({})
      .populate('sentBy', 'username email')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;