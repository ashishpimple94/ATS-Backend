const express = require('express');
const { verifyToken } = require('../middleware/auth');
const ActivationKey = require('../models/ActivationKey');
const User = require('../models/User');
const MessageLog = require('../models/MessageLog');

const router = express.Router();

// Validate activation key
router.post('/validate', async (req, res) => {
  try {
    const { key, deviceId } = req.body;

    const activationKey = await ActivationKey.findOne({ key, isActive: true });
    
    if (!activationKey) {
      return res.status(400).json({ message: 'Invalid or inactive activation key' });
    }

    if (activationKey.used) {
      return res.status(400).json({ message: 'Activation key already used' });
    }

    if (activationKey.expiresAt && new Date() > new Date(activationKey.expiresAt)) {
      return res.status(400).json({ message: 'Activation key has expired' });
    }

    // Mark key as used
    activationKey.used = true;
    activationKey.usedAt = new Date();
    activationKey.usedBy = req.userId;
    await activationKey.save();

    res.json({
      message: 'Activation key validated successfully',
      isValid: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's message configuration
router.get('/message-config', verifyToken, async (req, res) => {
  try {
    // This would return the current message configuration for the user
    // For now, returning a default configuration
    res.json({
      defaultMessage: "Sorry, I am unable to take calls right now. I will call you back later.",
      isActive: true,
      updatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Log sent message
router.post('/log-message', verifyToken, async (req, res) => {
  try {
    const { phoneNumber, message, deviceId } = req.body;

    const messageLog = new MessageLog({
      phoneNumber,
      message,
      sentBy: req.userId,
      deviceId
    });

    await messageLog.save();

    res.json({
      message: 'Message logged successfully',
      messageId: messageLog._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;