const nodemailer = require('nodemailer');
const twilio = require('twilio');

class NotificationService {
  constructor() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Initialize Twilio client
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  async notifyEmergencyContact(contact, emergencyInfo) {
    const message = `🚨 EMERGENCY ALERT: ${emergencyInfo.userName} needs help!

Emergency: ${emergencyInfo.emergency}
Severity: ${emergencyInfo.severity.toUpperCase()}
Location: ${emergencyInfo.location}
Time: ${emergencyInfo.timestamp.toLocaleString()}

This is an automated alert from CrisisGuard. Please check on ${emergencyInfo.userName} immediately.

If this is a false alarm, please contact ${emergencyInfo.userName} to update their status.`;

    const notifications = [];

    // Send SMS
    if (contact.phoneNumber && this.twilioClient) {
      try {
        await this.twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: contact.phoneNumber
        });
        notifications.push({ type: 'sms', status: 'sent' });
      } catch (error) {
        console.error('SMS notification error:', error);
        notifications.push({ type: 'sms', status: 'failed', error: error.message });
      }
    }

    // Send Email
    if (contact.email) {
      try {
        await this.emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: contact.email,
          subject: `🚨 EMERGENCY: ${emergencyInfo.userName} needs help!`,
          text: message,
          html: `
            <div style="background-color: #fee; border-left: 4px solid #dc2626; padding: 20px; font-family: Arial, sans-serif;">
              <h2 style="color: #dc2626; margin-top: 0;">🚨 EMERGENCY ALERT</h2>
              <p><strong>${emergencyInfo.userName}</strong> needs help!</p>
              <ul>
                <li><strong>Emergency:</strong> ${emergencyInfo.emergency}</li>
                <li><strong>Severity:</strong> <span style="color: #dc2626; font-weight: bold;">${emergencyInfo.severity.toUpperCase()}</span></li>
                <li><strong>Location:</strong> ${emergencyInfo.location}</li>
                <li><strong>Time:</strong> ${emergencyInfo.timestamp.toLocaleString()}</li>
              </ul>
              <p style="margin-top: 20px;">
                <strong>This is an automated alert from CrisisGuard.</strong><br>
                Please check on ${emergencyInfo.userName} immediately.
              </p>
              <p style="color: #666; font-size: 14px;">
                If this is a false alarm, please contact ${emergencyInfo.userName} to update their status.
              </p>
            </div>
          `
        });
        notifications.push({ type: 'email', status: 'sent' });
      } catch (error) {
        console.error('Email notification error:', error);
        notifications.push({ type: 'email', status: 'failed', error: error.message });
      }
    }

    return notifications;
  }

  async notifyFamilyMember(familyMember, emergencyInfo) {
    const message = `🚨 Family Alert: ${emergencyInfo.memberName} has an emergency

Type: ${emergencyInfo.emergency}
Severity: ${emergencyInfo.severity}
${emergencyInfo.location ? `Location: ${emergencyInfo.location.latitude}, ${emergencyInfo.location.longitude}` : ''}
Time: ${emergencyInfo.timestamp.toLocaleString()}

Please check the CrisisGuard app for more details and to coordinate response.`;

    const notifications = [];

    // Send SMS to family member
    if (familyMember.profile.phoneNumber && this.twilioClient) {
      try {
        await this.twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: familyMember.profile.phoneNumber
        });
        notifications.push({ type: 'sms', status: 'sent' });
      } catch (error) {
        notifications.push({ type: 'sms', status: 'failed', error: error.message });
      }
    }

    // Send Email to family member
    try {
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: familyMember.email,
        subject: `🚨 Family Emergency: ${emergencyInfo.memberName}`,
        text: message,
        html: `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #f59e0b; margin-top: 0;">🚨 Family Emergency Alert</h2>
            <p><strong>${emergencyInfo.memberName}</strong> has an emergency situation:</p>
            <ul>
              <li><strong>Type:</strong> ${emergencyInfo.emergency}</li>
              <li><strong>Severity:</strong> ${emergencyInfo.severity}</li>
              ${emergencyInfo.location ? `<li><strong>Location:</strong> ${emergencyInfo.location.latitude}, ${emergencyInfo.location.longitude}</li>` : ''}
              <li><strong>Time:</strong> ${emergencyInfo.timestamp.toLocaleString()}</li>
            </ul>
            <p style="margin-top: 20px;">
              Please check the CrisisGuard app for more details and to coordinate response.
            </p>
          </div>
        `
      });
      notifications.push({ type: 'email', status: 'sent' });
    } catch (error) {
      notifications.push({ type: 'email', status: 'failed', error: error.message });
    }

    return notifications;
  }

  async sendTestAlert(userId, type, message) {
    const User = require('../models/User');
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (type === 'sms' && user.profile.phoneNumber && this.twilioClient) {
      await this.twilioClient.messages.create({
        body: `CrisisGuard Test Alert: ${message}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.profile.phoneNumber
      });
    } else if (type === 'email') {
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'CrisisGuard Test Alert',
        text: message,
        html: `
          <div style="background-color: #e0f2fe; border-left: 4px solid #0288d1; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #0288d1; margin-top: 0;">CrisisGuard Test Alert</h2>
            <p>${message}</p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This is a test message. Your CrisisGuard emergency notification system is working properly.
            </p>
          </div>
        `
      });
    }

    return true;
  }
}

module.exports = new NotificationService();