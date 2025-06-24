import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import emergencyService from '../services/emergencyService';
import healthService from '../services/healthService';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [emergencyStats, setEmergencyStats] = useState(null);
  const [recentEmergencies, setRecentEmergencies] = useState([]);
  const [healthTrends, setHealthTrends] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, emergenciesResponse, trendsResponse, riskResponse] = await Promise.all([
        emergencyService.getStats(),
        emergencyService.getEmergencies({ limit: 5 }),
        healthService.getTrends('7d'),
        healthService.getRiskAssessment()
      ]);

      setEmergencyStats(statsResponse.data.overview);
      setRecentEmergencies(emergenciesResponse.data.emergencies);
      setHealthTrends(trendsResponse.data.trends);
      setRiskAssessment(riskResponse.data.riskAssessment);
    } catch (error) {
      console.error('Dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyAlert = async () => {
    try {
      await emergencyService.createManualEmergency({
        type: 'safety',
        severity: 'high',
        title: 'Manual Emergency Alert',
        description: 'Emergency button pressed by user',
        location: await getCurrentLocation()
      });
      
      alert('Emergency alert sent to your contacts and family members!');
    } catch (error) {
      console.error('Emergency alert error:', error);
      alert('Failed to send emergency alert. Please try again.');
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          () => resolve(null)
        );
      } else {
        resolve(null);
      }
    });
  };

  const getRiskColor = (risk) => {
    if (risk < 0.3) return '#10b981';
    if (risk < 0.6) return '#f59e0b';
    return '#dc2626';
  };

  const getRiskLabel = (risk) => {
    if (risk < 0.3) return 'Low Risk';
    if (risk < 0.6) return 'Medium Risk';
    return 'High Risk';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.firstName}!</h1>
          <p>Your health and safety monitoring dashboard</p>
        </div>
        
        <div className="quick-actions">
          <button className="btn btn-emergency" onClick={handleEmergencyAlert}>
            🚨 Emergency Alert
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="dashboard-grid">
        <div className="grid grid-4">
          <div className="stat-card">
            <div className="stat-number">{emergencyStats?.total || 0}</div>
            <div className="stat-label">Total Alerts</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{emergencyStats?.resolved || 0}</div>
            <div className="stat-label">Resolved</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">
              {riskAssessment ? Math.round(riskAssessment.cardiovascular * 100) : 0}%
            </div>
            <div className="stat-label">Cardio Risk</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">
              {user?.familyGroup ? '✓' : '✗'}
            </div>
            <div className="stat-label">Family Connected</div>
          </div>
        </div>

        {/* Health Risk Assessment */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Health Risk Assessment</h3>
          </div>
          <div className="card-content">
            {riskAssessment ? (
              <div className="risk-assessment">
                <div className="risk-item">
                  <div className="risk-label">Cardiovascular</div>
                  <div className="risk-bar">
                    <div 
                      className="risk-fill" 
                      style={{ 
                        width: `${riskAssessment.cardiovascular * 100}%`,
                        backgroundColor: getRiskColor(riskAssessment.cardiovascular)
                      }}
                    ></div>
                  </div>
                  <div className="risk-value">
                    {getRiskLabel(riskAssessment.cardiovascular)}
                  </div>
                </div>
                
                <div className="risk-item">
                  <div className="risk-label">Diabetes</div>
                  <div className="risk-bar">
                    <div 
                      className="risk-fill" 
                      style={{ 
                        width: `${riskAssessment.diabetes * 100}%`,
                        backgroundColor: getRiskColor(riskAssessment.diabetes)
                      }}
                    ></div>
                  </div>
                  <div className="risk-value">
                    {getRiskLabel(riskAssessment.diabetes)}
                  </div>
                </div>
                
                <div className="risk-item">
                  <div className="risk-label">General Health</div>
                  <div className="risk-bar">
                    <div 
                      className="risk-fill" 
                      style={{ 
                        width: `${riskAssessment.general * 100}%`,
                        backgroundColor: getRiskColor(riskAssessment.general)
                      }}
                    ></div>
                  </div>
                  <div className="risk-value">
                    {getRiskLabel(riskAssessment.general)}
                  </div>
                </div>

                <div className="recommendations mt-3">
                  <h4>Recommendations:</h4>
                  <ul>
                    {riskAssessment.recommendations?.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="no-data">
                <p>Connect your health devices to see risk assessment</p>
                <Link to="/health" className="btn btn-primary">
                  Set Up Health Monitoring
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Emergencies */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Alerts</h3>
            <Link to="/emergency" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          <div className="card-content">
            {recentEmergencies.length > 0 ? (
              <div className="emergency-list">
                {recentEmergencies.map((emergency) => (
                  <div key={emergency._id} className="emergency-item">
                    <div className={`emergency-status ${emergency.severity}`}>
                      {emergency.severity === 'critical' ? '🔴' : 
                       emergency.severity === 'high' ? '🟠' : 
                       emergency.severity === 'medium' ? '🟡' : '🟢'}
                    </div>
                    <div className="emergency-details">
                      <div className="emergency-title">{emergency.title}</div>
                      <div className="emergency-time">
                        {new Date(emergency.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`emergency-badge ${emergency.status}`}>
                      {emergency.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No recent emergencies - great news! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="quick-actions-grid">
              <Link to="/health" className="action-button">
                <span className="action-icon">❤️</span>
                <span className="action-text">Health Check</span>
              </Link>
              
              <Link to="/family" className="action-button">
                <span className="action-icon">👨‍👩‍👧‍👦</span>
                <span className="action-text">Family Status</span>
              </Link>
              
              <button 
                className="action-button" 
                onClick={() => window.location.href = 'tel:911'}
              >
                <span className="action-icon">📞</span>
                <span className="action-text">Call 911</span>
              </button>
              
              <Link to="/settings" className="action-button">
                <span className="action-icon">⚙️</span>
                <span className="action-text">Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Button */}
      <div className="emergency-button-container">
        <button className="emergency-btn" onClick={handleEmergencyAlert}>
          🚨
        </button>
      </div>
    </div>
  );
};

export default Dashboard;