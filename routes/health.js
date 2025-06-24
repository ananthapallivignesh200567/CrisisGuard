const express = require('express');
const HealthData = require('../models/HealthData');
const { authMiddleware } = require('../middleware/auth');
const predictiveService = require('../services/predictiveService');
const router = express.Router();

// Submit health data
router.post('/data', authMiddleware, async (req, res) => {
  try {
    const healthData = new HealthData({
      userId: req.userId,
      ...req.body
    });

    await healthData.save();

    // Analyze for predictions
    const analysis = await predictiveService.analyzeHealthData(healthData);
    
    res.status(201).json({ 
      message: 'Health data recorded',
      analysis 
    });
  } catch (error) {
    console.error('Health data submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get health data
router.get('/data', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;
    
    const filter = { userId: req.userId };
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const healthData = await HealthData.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ healthData });
  } catch (error) {
    console.error('Get health data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get health trends
router.get('/trends', authMiddleware, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let days;
    switch (period) {
      case '24h': days = 1; break;
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      default: days = 7;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await HealthData.aggregate([
      {
        $match: {
          userId: req.userId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          avgHeartRate: { $avg: '$vitals.heartRate' },
          avgSteps: { $avg: '$activity.steps' },
          avgSleepHours: { $avg: '$activity.sleepHours' },
          riskScores: { $push: '$riskScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ trends });
  } catch (error) {
    console.error('Health trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get risk assessment
router.get('/risk-assessment', authMiddleware, async (req, res) => {
  try {
    const riskAssessment = await predictiveService.generateRiskAssessment(req.userId);
    res.json({ riskAssessment });
  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;