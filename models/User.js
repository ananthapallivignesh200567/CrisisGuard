const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: Date,
    phoneNumber: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'USA' }
    }
  },
  medicalInfo: {
    bloodType: String,
    allergies: [String],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      prescriber: String
    }],
    conditions: [String],
    emergencyContacts: [{
      name: String,
      relationship: String,
      phoneNumber: String,
      email: String,
      isPrimary: { type: Boolean, default: false }
    }],
    preferredHospital: String,
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      groupNumber: String
    }
  },
  devices: [{
    deviceId: String,
    deviceType: { type: String, enum: ['wearable', 'smartphone', 'home_sensor'] },
    lastSync: Date,
    isActive: { type: Boolean, default: true }
  }],
  familyGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family'
  },
  subscription: {
    plan: { 
      type: String, 
      enum: ['individual', 'family', 'senior', 'premium'], 
      default: 'individual' 
    },
    status: { type: String, enum: ['active', 'inactive', 'trial'], default: 'trial' },
    expiresAt: Date
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    emergencySettings: {
      autoCallEmergency: { type: Boolean, default: true },
      shareLocationWithFamily: { type: Boolean, default: true },
      voiceActivation: { type: Boolean, default: false }
    }
  },
  isActive: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);