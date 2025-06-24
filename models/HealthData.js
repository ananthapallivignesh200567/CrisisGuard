const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  vitals: {
    heartRate: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    bloodOxygen: Number,
    temperature: Number,
    bloodSugar: Number,
    weight: Number
  },
  activity: {
    steps: Number,
    caloriesBurned: Number,
    activeMinutes: Number,
    sleepHours: Number,
    sleepQuality: { type: Number, min: 1, max: 10 }
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  anomalies: [{
    type: String,
    severity: { type: String, enum: ['low', 'medium', 'high'] },
    confidence: Number
  }],
  riskScore: {
    cardiovascular: Number,
    diabetes: Number,
    general: Number
  }
}, {
  timestamps: true
});

healthDataSchema.index({ userId: 1, timestamp: -1 });
healthDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model('HealthData', healthDataSchema);