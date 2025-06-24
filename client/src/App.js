import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import HealthMonitoring from './components/HealthMonitoring';
import FamilyCenter from './components/FamilyCenter';
import EmergencyCenter from './components/EmergencyCenter';
import Settings from './components/Settings';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Services
import authService from './services/authService';
import socketService from './services/socketService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userProfile = await authService.getProfile();
        setUser(userProfile.user);
        setIsAuthenticated(true);
        
        // Initialize socket connection
        socketService.connect(token);
        setupSocketListeners();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.on('emergency-alert', (data) => {
      setEmergencyAlerts(prev => [...prev, data]);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('🚨 Family Emergency', {
          body: `${data.user.name}: ${data.emergency.title}`,
          icon: '/emergency-icon.png'
        });
      }
    });

    socketService.on('emergency-prediction', (prediction) => {
      setEmergencyAlerts(prev => [...prev, {
        type: 'prediction',
        severity: prediction.severity,
        message: prediction.message,
        timestamp: new Date()
      }]);
    });
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Initialize socket connection
      socketService.connect(response.token);
      setupSocketListeners();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Initialize socket connection
      socketService.connect(response.token);
      setupSocketListeners();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    socketService.disconnect();
  };

  const dismissAlert = (index) => {
    setEmergencyAlerts(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading CrisisGuard...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* Emergency Alerts */}
        {emergencyAlerts.length > 0 && (
          <div className="emergency-alerts">
            {emergencyAlerts.map((alert, index) => (
              <div key={index} className={`alert alert-${alert.severity || 'warning'}`}>
                <div className="alert-content">
                  <span className="alert-icon">🚨</span>
                  <div className="alert-text">
                    <strong>{alert.type === 'prediction' ? 'Health Warning' : 'Emergency Alert'}</strong>
                    <p>{alert.message || alert.emergency?.title}</p>
                  </div>
                </div>
                <button 
                  className="alert-dismiss"
                  onClick={() => dismissAlert(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {isAuthenticated ? (
          <>
            <Navbar user={user} onLogout={handleLogout} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/health" element={<HealthMonitoring user={user} />} />
                <Route path="/family" element={<FamilyCenter user={user} />} />
                <Route path="/emergency" element={<EmergencyCenter user={user} />} />
                <Route path="/settings" element={<Settings user={user} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </>
        ) : (
          <div className="auth-container">
            <Routes>
              <Route 
                path="/login" 
                element={<Login onLogin={handleLogin} />} 
              />
              <Route 
                path="/register" 
                element={<Register onRegister={handleRegister} />} 
              />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;