const HealthData = require('../models/HealthData');
const Emergency = require('../models/Emergency');
const User = require('../models/User');
const emergencyResponseService = require('./emergencyResponseService');
const cron = require('node-cron');

class PredictiveService {
  constructor() {
    this.riskThresholds = {
      heartRate: { low: 60, high: 100, critical: 180 },
      bloodPressure: { 
        systolic: { high: 140, critical: 180 },
        diastolic: { high: 90, critical: 120 }
      },
      bloodSugar: { low: 70, high: 180, critical: 400 },
      bloodOxygen: { low: 95, critical: 88 }
    };
  }

  async analyzeHealthData(healthData, socket = null) {
    try {
      const risks = [];
      const vitals = healthData.vitals || {};

      // Heart rate analysis
      if (vitals.heartRate) {
        if (vitals.heartRate > this.riskThresholds.heartRate.critical) {
          risks.push({
            type: 'cardiac_emergency',
            severity: 'critical',
            confidence: 0.95,
            message: 'Extremely high heart rate detected'
          });
        } else if (vitals.heartRate > this.riskThresholds.heartRate.high) {
          risks.push({
            type: 'cardiac_concern',
            severity: 'high',
            confidence: 0.8,
            message: 'Elevated heart rate detected'
          });
        }
      }

      // Blood pressure analysis
      if (vitals.bloodPressure) {
        const { systolic, diastolic } = vitals.bloodPressure;
        if (systolic > this.riskThresholds.bloodPressure.systolic.critical ||
            diastolic > this.riskThresholds.bloodPressure.diastolic.critical) {
          risks.push({
            type: 'hypertensive_crisis',
            severity: 'critical',
            confidence: 0.9,
            message: 'Dangerous blood pressure levels detected'
          });
        }
      }

      // Blood sugar analysis
      if (vitals.bloodSugar) {
        if (vitals.bloodSugar < this.riskThresholds.bloodSugar.low) {
          risks.push({
            type: 'hypoglycemia',
            severity: 'high',
            confidence: 0.85,
            message: 'Low blood sugar detected'
          });
        } else if (vitals.bloodSugar > this.riskThresholds.bloodSugar.critical) {
          risks.push({
            type: 'diabetic_emergency',
            severity: 'critical',
            confidence: 0.9,
            message: 'Extremely high blood sugar'
          });
        }
      }

      // Blood oxygen analysis
      if (vitals.bloodOxygen && vitals.bloodOxygen < this.riskThresholds.bloodOxygen.critical) {
        risks.push({
          type: 'respiratory_emergency',
          severity: 'critical',
          confidence: 0.9,
          message: 'Dangerously low blood oxygen'
        });
      }

      // Process high-risk situations
      for (const risk of risks) {
        if (risk.severity === 'critical') {
          await this.createPredictedEmergency(healthData.userId, risk, healthData);
          
          if (socket) {
            socket.emit('emergency-prediction', risk);
          }
        }
      }

      return { risks, analyzed: true };
    } catch (error) {
      console.error('Health data analysis error:', error);
      return { risks: [], analyzed: false, error: error.message };
    }
  }

  async createPredictedEmergency(userId, risk, healthData) {
    try {
      const emergency = new Emergency({
        userId,
        type: 'medical',
        severity: risk.severity,
        title: risk.message,
        description: `Predicted ${risk.type} based on health data analysis`,
        confidence: risk.confidence,
        dataSource: 'wearable',
        rawData: healthData,
        location: healthData.location
      });

      await emergency.save();

      // Trigger emergency response for critical predictions
      if (risk.severity === 'critical') {
        await emergencyResponseService.handleEmergency({
          emergencyId: emergency._id,
          userId,
          type: 'medical',
          severity: risk.severity,
          title: risk.message,
          description: emergency.description,
          location: healthData.location
        });
      }

      return emergency;
    } catch (error) {
      console.error('Create predicted emergency error:', error);
      throw error;
    }
  }

  async generateRiskAssessment(userId) {
    try {
      // Get recent health data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentData = await HealthData.find({
        userId,
        timestamp: { $gte: thirtyDaysAgo }
      }).sort({ timestamp: -1 });

      if (recentData.length === 0) {
        return {
          overall: 'insufficient_data',
          cardiovascular: 0,
          diabetes: 0,
          general: 0,
          recommendations: ['Sync your health devices regularly for better monitoring']
        };
      }

      // Calculate risk scores
      const cardiovascularRisk = this.calculateCardiovascularRisk(recentData);
      const diabetesRisk = this.calculateDiabetesRisk(recentData);
      const generalRisk = this.calculateGeneralRisk(recentData);

      const overallRisk = Math.max(cardiovascularRisk, diabetesRisk, generalRisk);
      
      let riskLevel;
      if (overallRisk < 0.3) riskLevel = 'low';
      else if (overallRisk < 0.6) riskLevel = 'medium';
      else riskLevel = 'high';

      const recommendations = this.generateRecommendations(cardiovascularRisk, diabetesRisk, generalRisk);

      return {
        overall: riskLevel,
        cardiovascular: cardiovascularRisk,
        diabetes: diabetesRisk,
        general: generalRisk,
        recommendations,
        dataPoints: recentData.length,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Risk assessment error:', error);
      throw error;
    }
  }

  calculateCardiovascularRisk(healthData) {
    let riskScore = 0;
    let dataPoints = 0;

    healthData.forEach(data => {
      if (data.vitals.heartRate) {
        dataPoints++;
        if (data.vitals.heartRate > 100) riskScore += 0.3;
        if (data.vitals.heartRate > 120) riskScore += 0.4;
      }
      
      if (data.vitals.bloodPressure) {
        dataPoints++;
        const { systolic, diastolic } = data.vitals.bloodPressure;
        if (systolic > 140 || diastolic > 90) riskScore += 0.4;
        if (systolic > 160 || diastolic > 100) riskScore += 0.5;
      }
    });

    return dataPoints > 0 ? Math.min(riskScore / dataPoints, 1) : 0;
  }

  calculateDiabetesRisk(healthData) {
    let riskScore = 0;
    let dataPoints = 0;

    healthData.forEach(data => {
      if (data.vitals.bloodSugar) {
        dataPoints++;
        if (data.vitals.bloodSugar > 140) riskScore += 0.3;
        if (data.vitals.bloodSugar > 200) riskScore += 0.5;
        if (data.vitals.bloodSugar < 70) riskScore += 0.4;
      }
    });

    return dataPoints > 0 ? Math.min(riskScore / dataPoints, 1) : 0;
  }

  calculateGeneralRisk(healthData) {
    let riskScore = 0;
    let factors = 0;

    const avgSleep = healthData.reduce((sum, data) => {
      if (data.activity && data.activity.sleepHours) {
        factors++;
        return sum + data.activity.sleepHours;
      }
      return sum;
    }, 0) / Math.max(factors, 1);

    if (avgSleep < 6) riskScore += 0.3;
    if (avgSleep < 5) riskScore += 0.4;

    return Math.min(riskScore, 1);
  }

  generateRecommendations(cardiovascular, diabetes, general) {
    const recommendations = [];

    if (cardiovascular > 0.6) {
      recommendations.push('Consider consulting a cardiologist');
      recommendations.push('Monitor blood pressure daily');
      recommendations.push('Reduce sodium intake and increase exercise');
    }

    if (diabetes > 0.6) {
      recommendations.push('Monitor blood sugar levels more frequently');
      recommendations.push('Consider consulting an endocrinologist');
      recommendations.push('Review dietary habits with a nutritionist');
    }

    if (general > 0.5) {
      recommendations.push('Improve sleep hygiene - aim for 7-8 hours nightly');
      recommendations.push('Increase physical activity gradually');
    }

    if (recommendations.length === 0) {
      recommendations.push('Keep up the great work with your health monitoring!');
      recommendations.push('Continue regular health check-ups');
    }

    return recommendations;
  }

  startContinuousMonitoring() {
    // Run health analysis every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('Running continuous health monitoring...');
        
        // Get recent health data that hasn't been analyzed
        const fiveMinutesAgo = new Date();
        fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

        const recentHealthData = await HealthData.find({
          timestamp: { $gte: fiveMinutesAgo },
          analyzed: { $ne: true }
        });

        for (const data of recentHealthData) {
          await this.analyzeHealthData(data);
          
          // Mark as analyzed
          await HealthData.findByIdAndUpdate(data._id, { analyzed: true });
        }
      } catch (error) {
        console.error('Continuous monitoring error:', error);
      }
    });

    console.log('🔍 Predictive monitoring service started');
  }
}

module.exports = new PredictiveService();