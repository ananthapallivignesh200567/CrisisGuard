const Emergency = require('../models/Emergency');
const User = require('../models/User');
const Family = require('../models/Family');
const notificationService = require('./notificationService');

class EmergencyResponseService {
  async handleEmergency(emergencyData) {
    try {
      const { emergencyId, userId, type, severity, title, description, location } = emergencyData;

      console.log(`🚨 Handling ${severity} ${type} emergency for user ${userId}`);

      // Get user and family information
      const user = await User.findById(userId).populate('familyGroup');
      if (!user) {
        throw new Error('User not found');
      }

      // Start emergency response protocol
      const responseActions = [];

      // 1. Notify emergency contacts
      if (user.medicalInfo.emergencyContacts.length > 0) {
        for (const contact of user.medicalInfo.emergencyContacts) {
          try {
            await notificationService.notifyEmergencyContact(contact, {
              userName: `${user.profile.firstName} ${user.profile.lastName}`,
              emergency: title,
              location: location ? `${location.latitude}, ${location.longitude}` : 'Unknown',
              severity,
              timestamp: new Date()
            });
            
            responseActions.push({
              type: 'contact_notified',
              status: 'completed',
              details: `Notified ${contact.name} at ${contact.phoneNumber}`
            });
          } catch (error) {
            responseActions.push({
              type: 'contact_notification_failed',
              status: 'failed',
              details: `Failed to notify ${contact.name}: ${error.message}`
            });
          }
        }
      }

      // 2. Notify family members
      if (user.familyGroup) {
        const family = await Family.findById(user.familyGroup).populate('members.userId');
        
        for (const member of family.members) {
          if (member.userId._id.toString() !== userId && member.permissions.receiveAlerts) {
            try {
              await notificationService.notifyFamilyMember(member.userId, {
                memberName: `${user.profile.firstName} ${user.profile.lastName}`,
                emergency: title,
                severity,
                location,
                timestamp: new Date()
              });

              responseActions.push({
                type: 'family_notified',
                status: 'completed',
                details: `Notified family member ${member.userId.profile.firstName}`
              });
            } catch (error) {
              responseActions.push({
                type: 'family_notification_failed',
                status: 'failed',
                details: `Failed to notify family member: ${error.message}`
              });
            }
          }
        }
      }

      // 3. Handle critical emergencies
      if (severity === 'critical') {
        // Auto-call emergency services for critical medical emergencies
        if (type === 'medical' && user.preferences.emergencySettings.autoCallEmergency) {
          try {
            await this.contactEmergencyServices(user, emergencyData);
            responseActions.push({
              type: 'emergency_services_contacted',
              status: 'completed',
              details: 'Emergency services have been contacted'
            });
          } catch (error) {
            responseActions.push({
              type: 'emergency_services_failed',
              status: 'failed',
              details: `Failed to contact emergency services: ${error.message}`
            });
          }
        }

        // Reserve hospital bed for medical emergencies
        if (type === 'medical' && user.medicalInfo.preferredHospital) {
          try {
            await this.reserveHospitalBed(user, emergencyData);
            responseActions.push({
              type: 'hospital_notified',
              status: 'completed',
              details: `Preferred hospital ${user.medicalInfo.preferredHospital} has been notified`
            });
          } catch (error) {
            responseActions.push({
              type: 'hospital_notification_failed',
              status: 'failed',
              details: 'Failed to notify hospital'
            });
          }
        }
      }

      // 4. Dispatch appropriate services
      await this.dispatchServices(type, severity, location, responseActions);

      // 5. Update emergency record with actions taken
      if (emergencyId) {
        await Emergency.findByIdAndUpdate(emergencyId, {
          $push: { actions: { $each: responseActions } },
          status: 'active'
        });
      }

      return {
        success: true,
        actionsCompleted: responseActions.filter(a => a.status === 'completed').length,
        actionsFailed: responseActions.filter(a => a.status === 'failed').length,
        responseTime: new Date()
      };

    } catch (error) {
      console.error('Emergency response error:', error);
      throw error;
    }
  }

  async contactEmergencyServices(user, emergencyData) {
    // In a real implementation, this would integrate with local emergency services APIs
    console.log(`🚑 EMERGENCY SERVICES ALERT:
      User: ${user.profile.firstName} ${user.profile.lastName}
      Phone: ${user.profile.phoneNumber}
      Emergency: ${emergencyData.title}
      Location: ${emergencyData.location ? 
        `${emergencyData.location.latitude}, ${emergencyData.location.longitude}` : 
        user.profile.address.street + ', ' + user.profile.address.city}
      Medical Info: ${JSON.stringify(user.medicalInfo, null, 2)}
    `);

    // Simulate emergency services contact
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('✅ Emergency services contacted successfully');
        resolve(true);
      }, 2000);
    });
  }

  async reserveHospitalBed(user, emergencyData) {
    // In a real implementation, this would integrate with hospital management systems
    console.log(`🏥 HOSPITAL NOTIFICATION:
      Patient: ${user.profile.firstName} ${user.profile.lastName}
      Emergency: ${emergencyData.title}
      Preferred Hospital: ${user.medicalInfo.preferredHospital}
      Insurance: ${user.medicalInfo.insuranceInfo.provider}
      Allergies: ${user.medicalInfo.allergies.join(', ')}
      Current Medications: ${user.medicalInfo.medications.map(m => m.name).join(', ')}
    `);

    return new Promise(resolve => {
      setTimeout(() => {
        console.log('✅ Hospital notified and bed reserved');
        resolve(true);
      }, 3000);
    });
  }

  async dispatchServices(type, severity, location, responseActions) {
    const services = {
      medical: ['paramedics', 'hospital'],
      home: ['fire_department', 'utility_company'],
      safety: ['police', 'security'],
      financial: ['bank_fraud_dept', 'credit_monitoring']
    };

    const relevantServices = services[type] || [];

    for (const service of relevantServices) {
      try {
        await this.contactService(service, { type, severity, location });
        responseActions.push({
          type: `${service}_dispatched`,
          status: 'completed',
          details: `${service.replace('_', ' ')} has been contacted`
        });
      } catch (error) {
        responseActions.push({
          type: `${service}_dispatch_failed`,
          status: 'failed',
          details: `Failed to contact ${service}: ${error.message}`
        });
      }
    }
  }

  async contactService(service, emergencyInfo) {
    // Simulate service contact
    console.log(`📞 Contacting ${service} for ${emergencyInfo.type} emergency (${emergencyInfo.severity})`);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          console.log(`✅ ${service} contacted successfully`);
          resolve(true);
        } else {
          reject(new Error(`${service} unavailable`));
        }
      }, 1000);
    });
  }
}

module.exports = new EmergencyResponseService();