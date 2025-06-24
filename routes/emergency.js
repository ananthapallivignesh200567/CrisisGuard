const express = require('express');
const Emergency = require('../models/Emergency');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const emergencyResponseService = require('../services/emergencyResponseService');
const router = express.Router();

// Get user's emergencies
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    
    const filter = { userId: req.userId };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const emergencies = await Emergency.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Emergency.countDocuments(filter);

    res.json({
      emergencies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get emergencies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create manual emergency
router.post('/manual', authMiddleware, async (req, res) => {
  try {
    const { type, severity, title, description, location } = req.body;

    const emergency = new Emergency({
      userId: req.userId,
      type,
      severity,
      title,
      description,
      location,
      status: 'active',
      dataSource: 'manual',
      confidence: 1.0
    });

    await emergency.save();

    // Trigger emergency response
    await emergencyResponseService.handleEmergency({
      emergencyId: emergency._id,
      userId: req.userId,
      type,
      severity,
      title,
      description,
      location
    });

    // Emit to family members
    const user = await User.findById(req.userId).populate('familyGroup');
    if (user.familyGroup) {
      req.io.to(user.familyGroup._id.toString()).emit('emergency-alert', {
        emergency,
        user: {
          name: `${user.profile.firstName} ${user.profile.lastName}`,
          id: user._id
        }
      });
    }

    res.status(201).json({ emergency });
  } catch (error) {
    console.error('Manual emergency creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update emergency status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const emergency = await Emergency.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }

    emergency.status = status;
    if (status === 'resolved') {
      emergency.resolvedAt = new Date();
    }

    if (notes) {
      emergency.notes.push({
        author: 'user',
        content: notes
      });
    }

    await emergency.save();

    res.json({ emergency });
  } catch (error) {
    console.error('Update emergency status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Emergency statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await Emergency.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byType: {
            $push: {
              type: '$type',
              severity: '$severity'
            }
          },
          avgConfidence: { $avg: '$confidence' },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const typeStats = await Emergency.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgSeverity: { $avg: { $cond: [
            { $eq: ['$severity', 'low'] }, 1,
            { $cond: [
              { $eq: ['$severity', 'medium'] }, 2,
              { $cond: [
                { $eq: ['$severity', 'high'] }, 3, 4
              ]}
            ]}
          ]}}
        }
      }
    ]);

    res.json({
      overview: stats[0] || { total: 0, resolved: 0, avgConfidence: 0 },
      byType: typeStats
    });
  } catch (error) {
    console.error('Emergency stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;