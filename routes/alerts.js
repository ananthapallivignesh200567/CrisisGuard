const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const router = express.Router();

// Test emergency alert
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const { type = 'sms', message = 'This is a test emergency alert from CrisisGuard' } = req.body;

    await notificationService.sendTestAlert(req.userId, type, message);

    res.json({ message: 'Test alert sent successfully' });
  } catch (error) {
    console.error('Test alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification preferences
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { preferences } = req.body;

    const User = require('../models/User');
    await User.findByIdAndUpdate(req.userId, {
      'preferences.notifications': preferences
    });

    res.json({ message: 'Notification preferences updated' });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;