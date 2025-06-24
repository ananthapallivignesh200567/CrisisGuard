import api from './api';

class HealthService {
  async submitHealthData(healthData) {
    const response = await api.post('/health/data', healthData);
    return response.data;
  }

  async getHealthData(params = {}) {
    const response = await api.get('/health/data', { params });
    return response;
  }

  async getTrends(period = '7d') {
    const response = await api.get('/health/trends', { params: { period } });
    return response;
  }

  async getRiskAssessment() {
    const response = await api.get('/health/risk-assessment');
    return response;
  }

  // Simulate health data from wearables
  generateMockHealthData() {
    return {
      timestamp: new Date(),
      vitals: {
        heartRate: 65 + Math.random() * 40, // 65-105
        bloodPressure: {
          systolic: 110 + Math.random() * 30, // 110-140
          diastolic: 70 + Math.random() * 20   // 70-90
        },
        bloodOxygen: 95 + Math.random() * 5,  // 95-100
        temperature: 97 + Math.random() * 3,  // 97-100°F
        bloodSugar: 80 + Math.random() * 60   // 80-140 mg/dL
      },
      activity: {
        steps: Math.floor(Math.random() * 15000),
        caloriesBurned: Math.floor(Math.random() * 3000),
        activeMinutes: Math.floor(Math.random() * 120),
        sleepHours: 6 + Math.random() * 3,
        sleepQuality: Math.ceil(Math.random() * 10)
      }
    };
  }

  // Health data validation
  validateHealthData(data) {
    const errors = [];
    
    if (data.vitals) {
      if (data.vitals.heartRate && (data.vitals.heartRate < 30 || data.vitals.heartRate > 220)) {
        errors.push('Heart rate seems abnormal');
      }
      
      if (data.vitals.bloodPressure) {
        const { systolic, diastolic } = data.vitals.bloodPressure;
        if (systolic && diastolic && systolic <= diastolic) {
          errors.push('Blood pressure readings seem incorrect');
        }
      }
      
      if (data.vitals.bloodOxygen && data.vitals.bloodOxygen < 70) {
        errors.push('Blood oxygen level is critically low');
      }
    }
    
    return errors;
  }
}

export default new HealthService();