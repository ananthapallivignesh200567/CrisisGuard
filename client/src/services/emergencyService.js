import api from './api';

class EmergencyService {
  async getEmergencies(params = {}) {
    const response = await api.get('/emergency', { params });
    return response;
  }

  async createManualEmergency(emergencyData) {
    const response = await api.post('/emergency/manual', emergencyData);
    return response.data;
  }

  async updateEmergencyStatus(emergencyId, statusData) {
    const response = await api.put(`/emergency/${emergencyId}/status`, statusData);
    return response.data;
  }

  async getStats() {
    const response = await api.get('/emergency/stats');
    return response;
  }

  // Emergency types for manual reporting
  getEmergencyTypes() {
    return [
      { value: 'medical', label: 'Medical Emergency', icon: '🏥' },
      { value: 'safety', label: 'Safety/Security', icon: '🚨' },
      { value: 'home', label: 'Home Emergency', icon: '🏠' },
      { value: 'financial', label: 'Financial Crisis', icon: '💳' },
      { value: 'weather', label: 'Weather Emergency', icon: '🌪️' }
    ];
  }

  getSeverityLevels() {
    return [
      { value: 'low', label: 'Low Priority', color: '#10b981' },
      { value: 'medium', label: 'Medium Priority', color: '#f59e0b' },
      { value: 'high', label: 'High Priority', color: '#ef4444' },
      { value: 'critical', label: 'Critical Emergency', color: '#dc2626' }
    ];
  }
}

export default new EmergencyService();