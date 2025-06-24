const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'dependent'],
      default: 'member'
    },
    relationship: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    permissions: {
      viewLocation: { type: Boolean, default: true },
      receiveAlerts: { type: Boolean, default: true },
      viewHealthSummary: { type: Boolean, default: false }
    }
  }],
  settings: {
    emergencyProtocol: {
      cascadeOrder: [String], // Order of contacts to notify
      autoCallEmergency: { type: Boolean, default: true },
      locationSharing: { type: Boolean, default: true }
    },
    checkInSchedule: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
      time: String // HH:MM format
    }
  },
  emergencyPlan: {
    meetingPoints: [{
      name: String,
      address: String,
      latitude: Number,
      longitude: Number
    }],
    importantContacts: [{
      name: String,
      phoneNumber: String,
      relationship: String
    }],
    medicalFacilities: [{
      name: String,
      address: String,
      phoneNumber: String,
      specialties: [String]
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Family', familySchema);