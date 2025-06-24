import React, { useState, useEffect } from 'react';
import './HealthMonitoring.css';

const HealthMonitoring = ({ user }) => {
  const [healthData, setHealthData] = useState({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    bloodSugar: 95,
    temperature: 98.6,
    steps: 8520,
    sleep: 7.2
  });
  
  const [predictions, setPredictions] = useState([]);
  const [medications, setMedications] = useState([
    { id: 1, name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', nextDose: '2024-06-26T08:00:00', taken: false },
    { id: 2, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', nextDose: '2024-06-25T18:00:00', taken: true }
  ]);
  
  const [symptoms, setSymptoms] = useState('');
  const [isConnectingDevice, setIsConnectingDevice] = useState(false);

  useEffect(() => {
    // Simulate real-time health data updates
    const interval = setInterval(() => {
      setHealthData(prev => ({
        ...prev,
        heartRate: Math.floor(Math.random() * 20) + 65,
        steps: prev.steps + Math.floor(Math.random() * 50)
      }));
    }, 5000);

    // Simulate health predictions
    const predictionInterval = setInterval(() => {
      const randomPredictions = [
        { type: 'warning', message: 'Heart rate variability indicates stress. Consider rest.', confidence: 85 },
        { type: 'info', message: 'Blood pressure trending upward. Monitor closely.', confidence: 72 },
        { type: 'critical', message: 'Irregular sleep pattern detected. Health risk increasing.', confidence: 91 }
      ];
      
      if (Math.random() > 0.7) {
        const prediction = randomPredictions[Math.floor(Math.random() * randomPredictions.length)];
        setPredictions(prev => [prediction, ...prev.slice(0, 4)]);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(predictionInterval);
    };
  }, []);

  const markMedicationTaken = (id) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === id ? { ...med, taken: true } : med
      )
    );
  };

  const connectDevice = async (deviceType) => {
    setIsConnectingDevice(true);
    // Simulate device connection
    setTimeout(() => {
      setIsConnectingDevice(false);
      alert(`${deviceType} connected successfully!`);
    }, 2000);
  };

  const logSymptoms = () => {
    if (symptoms.trim()) {
      alert(`Symptoms logged: ${symptoms}`);
      setSymptoms('');
    }
  };

  const getHealthStatus = () => {
    const { heartRate, bloodPressure } = healthData;
    if (heartRate > 100 || bloodPressure.systolic > 140) return 'warning';
    if (heartRate < 60 || bloodPressure.systolic < 90) return 'warning';
    return 'good';
  };

  return (
    <div className="health-monitoring">
      <div className="health-header">
        <h1>Health Monitoring</h1>
        <div className={`health-status status-${getHealthStatus()}`}>
          <span className="status-indicator"></span>
          {getHealthStatus() === 'good' ? 'All Systems Normal' : 'Monitoring Required'}
        </div>
      </div>

      {/* Real-time Health Metrics */}
      <div className="health-grid">
        <div className="health-card">
          <div className="health-metric">
            <div className="metric-header">
              <span className="metric-icon">❤️</span>
              <h3>Heart Rate</h3>
            </div>
            <div className="metric-value">
              <span className="value">{healthData.heartRate}</span>
              <span className="unit">BPM</span>
            </div>
            <div className="metric-trend">
              <span className="trend-indicator">↗️</span>
              <span>Normal range</span>
            </div>
          </div>
        </div>

        <div className="health-card">
          <div className="health-metric">
            <div className="metric-header">
              <span className="metric-icon">🩸</span>
              <h3>Blood Pressure</h3>
            </div>
            <div className="metric-value">
              <span className="value">{healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic}</span>
              <span className="unit">mmHg</span>
            </div>
            <div className="metric-trend">
              <span className="trend-indicator">➡️</span>
              <span>Optimal</span>
            </div>
          </div>
        </div>

        <div className="health-card">
          <div className="health-metric">
            <div className="metric-header">
              <span className="metric-icon">🍯</span>
              <h3>Blood Sugar</h3>
            </div>
            <div className="metric-value">
              <span className="value">{healthData.bloodSugar}</span>
              <span className="unit">mg/dL</span>
            </div>
            <div className="metric-trend">
              <span className="trend-indicator">✅</span>
              <span>Normal</span>
            </div>
          </div>
        </div>

        <div className="health-card">
          <div className="health-metric">
            <div className="metric-header">
              <span className="metric-icon">🚶</span>
              <h3>Steps Today</h3>
            </div>
            <div className="metric-value">
              <span className="value">{healthData.steps.toLocaleString()}</span>
              <span className="unit">steps</span>
            </div>
            <div className="metric-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min((healthData.steps / 10000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Health Predictions */}
      {predictions.length > 0 && (
        <div className="predictions-section">
          <h2>🤖 AI Health Insights</h2>
          <div className="predictions-list">
            {predictions.map((prediction, index) => (
              <div key={index} className={`prediction-card prediction-${prediction.type}`}>
                <div className="prediction-content">
                  <p>{prediction.message}</p>
                  <div className="prediction-confidence">
                    Confidence: {prediction.confidence}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication Tracking */}
      <div className="medications-section">
        <h2>💊 Medication Schedule</h2>
        <div className="medications-list">
          {medications.map(med => (
            <div key={med.id} className={`medication-card ${med.taken ? 'taken' : 'pending'}`}>
              <div className="medication-info">
                <h4>{med.name}</h4>
                <p>{med.dosage} - {med.frequency}</p>
                <small>Next dose: {new Date(med.nextDose).toLocaleTimeString()}</small>
              </div>
              <div className="medication-actions">
                {!med.taken && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => markMedicationTaken(med.id)}
                  >
                    Mark Taken
                  </button>
                )}
                {med.taken && <span className="taken-indicator">✅</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device Connections */}
      <div className="devices-section">
        <h2>📱 Connected Devices</h2>
        <div className="devices-grid">
          <button 
            className="device-card"
            onClick={() => connectDevice('Apple Watch')}
            disabled={isConnectingDevice}
          >
            <span className="device-icon">⌚</span>
            <span>Apple Watch</span>
            <span className="device-status connected">Connected</span>
          </button>
          
          <button 
            className="device-card"
            onClick={() => connectDevice('Blood Pressure Monitor')}
            disabled={isConnectingDevice}
          >
            <span className="device-icon">🩺</span>
            <span>BP Monitor</span>
            <span className="device-status disconnected">Connect</span>
          </button>
          
          <button 
            className="device-card"
            onClick={() => connectDevice('Glucose Meter')}
            disabled={isConnectingDevice}
          >
            <span className="device-icon">🔬</span>
            <span>Glucose Meter</span>
            <span className="device-status disconnected">Connect</span>
          </button>
        </div>
      </div>

      {/* Symptom Logging */}
      <div className="symptoms-section">
        <h2>📝 Log Symptoms</h2>
        <div className="symptom-input">
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe any symptoms you're experiencing..."
            className="symptom-textarea"
          />
          <button 
            className="btn btn-primary"
            onClick={logSymptoms}
            disabled={!symptoms.trim()}
          >
            Log Symptoms
          </button>
        </div>
      </div>

      {/* Emergency Actions */}
      <div className="emergency-actions">
        <button className="btn btn-emergency">
          🚨 Medical Emergency
        </button>
        <button className="btn btn-secondary">
          📞 Call Doctor
        </button>
        <button className="btn btn-secondary">
          🏥 Find Nearest Hospital
        </button>
      </div>
    </div>
  );
};

export default HealthMonitoring;