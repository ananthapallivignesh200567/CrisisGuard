const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['medical', 'financial', 'home', 'safety', 'weather'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  status: {
    type: String,
    enum: ['predicted', 'active', 'resolved', 'false_positive'],
    default: 'predicted'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  predictedAt: {
    type: Date,
    default: Date.now
  },
  occurredAt: Date,
  resolvedAt: Date,
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  dataSource: {
    type: String,
    enum: ['wearable', 'smartphone', 'home_sensor', 'financial', 'manual'],
    required: true
  },
  rawData: mongoose.Schema.Types.Mixed,
  actions: [{
    type: String,
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'failed'] },
    details: String
  }],
  contacts: [{
    contactId: mongoose.Schema.Types.ObjectId,
    notifiedAt: Date,
    acknowledgedAt: Date,
    method: { type: String, enum: ['sms', 'call', 'email', 'push'] }
  }],
  responders: [{
    type: { type: String, enum: ['family', 'emergency_services', 'medical', 'security'] },
    contacted: Boolean,
    eta: Date,
    status: String
  }],
  notes: [{
    timestamp: { type: Date, default: Date.now },
    author: String,
    content: String
  }]
}, {
  timestamps: true
});

emergencySchema.index({ userId: 1, createdAt: -1 });
emergencySchema.index({ type: 1, severity: 1 });
emergencySchema.index({ status: 1, predictedAt: -1 });

module.exports = mongoose.model('Emergency', emergencySchema);