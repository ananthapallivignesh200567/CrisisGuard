import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, AlertTriangle, Activity, Users, Shield, Plus } from 'lucide-react';
import './EmergencyCenter.css';

const EmergencyCenter = ({ user }) => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
    priority: 1
  });

  useEffect(() => {
    fetchEmergencyData();
    requestLocationPermission();
  }, []);

  const fetchEmergencyData = async () => {
    try {
      // Simulated emergency data
      setEmergencyContacts([
        { id: 1, name: 'Dr. Sarah Johnson', phone: '+1-555-0123', relationship: 'Primary Doctor', priority: 1 },
        { id: 2, name: 'Mom', phone: '+1-555-0456', relationship: 'Family', priority: 1 },
        { id: 3, name: 'John Smith', phone: '+1-555-0789', relationship: 'Spouse', priority: 1 },
        { id: 4, name: 'Emergency Contact', phone: '+1-555-0987', relationship: 'Friend', priority: 2 }
      ]);

      setActiveEmergencies([
        {
          id: 1,
          type: 'medical',
          severity: 'high',
          title: 'Irregular Heart Rate Detected',
          description: 'Heart rate variability above normal range for 15 minutes',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'monitoring',
          actions: ['Contact doctor', 'Monitor vitals', 'Rest']
        }
      ]);

      setEmergencyHistory([
        {
          id: 1,
          type: 'financial',
          title: 'Suspicious Transaction Blocked',
          description: 'Blocked $2,500 charge from unknown merchant',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          resolved: true
        },
        {
          id: 2,
          type: 'home',
          title: 'Water Leak Detected',
          description: 'Basement moisture sensor triggered',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          resolved: true
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch emergency data:', error);
    }
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location permission granted');
        },
        (error) => {
          console.error('Location permission denied:', error);
          setLocationSharing(false);
        }
      );
    }
  };

  const handleEmergencyCall = (type) => {
    const emergencyNumbers = {
      police: '911',
      fire: '911',
      medical: '911',
      poison: '1-800-222-1222'
    };

    if (window.confirm(`Are you sure you want to call ${emergencyNumbers[type]}?`)) {
      window.location.href = `tel:${emergencyNumbers[type]}`;
    }
  };

  const handleContactEmergency = (contact) => {
    if (window.confirm(`Call ${contact.name} at ${contact.phone}?`)) {
      window.location.href = `tel:${contact.phone}`;
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const contact = {
        ...newContact,
        id: Date.now()
      };
      setEmergencyContacts(prev => [...prev, contact]);
      setNewContact({ name: '', phone: '', relationship: '', priority: 1 });
      setShowContactForm(false);
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
  };

  const handleResolveEmergency = (emergencyId) => {
    setActiveEmergencies(prev => 
      prev.filter(emergency => emergency.id !== emergencyId)
    );
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };
    return colors[severity] || '#6b7280';
  };

  const getEmergencyIcon = (type) => {
    const icons = {
      medical: Activity,
      financial: Shield,
      home: AlertTriangle,
      safety: Users
    };
    return icons[type] || AlertTriangle;
  };

  return (
    <div className="emergency-center">
      <div className="emergency-header">
        <h1>Emergency Center</h1>
        <div className="location-status">
          <MapPin size={20} />
          <span>{locationSharing ? 'Location Sharing: Active' : 'Location Sharing: Disabled'}</span>
        </div>
      </div>

      {/* Emergency Actions */}
      <div className="emergency-actions">
        <h2>Emergency Actions</h2>
        <div className="action-buttons">
          <button 
            className="emergency-btn police"
            onClick={() => handleEmergencyCall('police')}
          >
            <Phone size={24} />
            <div>
              <strong>Police</strong>
              <span>911</span>
            </div>
          </button>
          <button 
            className="emergency-btn fire"
            onClick={() => handleEmergencyCall('fire')}
          >
            <AlertTriangle size={24} />
            <div>
              <strong>Fire Dept</strong>
              <span>911</span>
            </div>
          </button>
          <button 
            className="emergency-btn medical"
            onClick={() => handleEmergencyCall('medical')}
          >
            <Activity size={24} />
            <div>
              <strong>Medical</strong>
              <span>911</span>
            </div>
          </button>
          <button 
            className="emergency-btn poison"
            onClick={() => handleEmergencyCall('poison')}
          >
            <Shield size={24} />
            <div>
              <strong>Poison Control</strong>
              <span>1-800-222-1222</span>
            </div>
          </button>
        </div>
      </div>

      {/* Active Emergencies */}
      {activeEmergencies.length > 0 && (
        <div className="active-emergencies">
          <h2>Active Emergencies</h2>
          <div className="emergency-list">
            {activeEmergencies.map(emergency => {
              const Icon = getEmergencyIcon(emergency.type);
              return (
                <div 
                  key={emergency.id} 
                  className="emergency-card active"
                  style={{ borderColor: getSeverityColor(emergency.severity) }}
                >
                  <div className="emergency-icon">
                    <Icon size={24} color={getSeverityColor(emergency.severity)} />
                  </div>
                  <div className="emergency-content">
                    <div className="emergency-header">
                      <h3>{emergency.title}</h3>
                      <span className={`severity-badge ${emergency.severity}`}>
                        {emergency.severity.toUpperCase()}
                      </span>
                    </div>
                    <p>{emergency.description}</p>
                    <div className="emergency-meta">
                      <span className="timestamp">
                        <Clock size={16} />
                        {emergency.timestamp.toLocaleTimeString()}
                      </span>
                      <span className="status">{emergency.status}</span>
                    </div>
                    <div className="emergency-actions">
                      {emergency.actions.map((action, index) => (
                        <span key={index} className="action-tag">{action}</span>
                      ))}
                    </div>
                  </div>
                  <button 
                    className="resolve-btn"
                    onClick={() => handleResolveEmergency(emergency.id)}
                  >
                    Resolve
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      <div className="emergency-contacts">
        <div className="section-header">
          <h2>Emergency Contacts</h2>
          <button 
            className="add-contact-btn"
            onClick={() => setShowContactForm(true)}
          >
            <Plus size={20} />
            Add Contact
          </button>
        </div>

        {showContactForm && (
          <div className="contact-form-overlay">
            <form className="contact-form" onSubmit={handleAddContact}>
              <h3>Add Emergency Contact</h3>
              <input
                type="text"
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Relationship"
                value={newContact.relationship}
                onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                required
              />
              <select
                value={newContact.priority}
                onChange={(e) => setNewContact(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              >
                <option value={1}>Priority 1 (Immediate)</option>
                <option value={2}>Priority 2 (Secondary)</option>
                <option value={3}>Priority 3 (Backup)</option>
              </select>
              <div className="form-actions">
                <button type="button" onClick={() => setShowContactForm(false)}>Cancel</button>
                <button type="submit">Add Contact</button>
              </div>
            </form>
          </div>
        )}

        <div className="contacts-grid">
          {emergencyContacts.map(contact => (
            <div key={contact.id} className="contact-card">
              <div className="contact-info">
                <h4>{contact.name}</h4>
                <p>{contact.phone}</p>
                <span className="relationship">{contact.relationship}</span>
                <span className={`priority priority-${contact.priority}`}>
                  Priority {contact.priority}
                </span>
              </div>
              <button 
                className="call-btn"
                onClick={() => handleContactEmergency(contact)}
              >
                <Phone size={20} />
                Call
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency History */}
      <div className="emergency-history">
        <h2>Recent Emergency History</h2>
        <div className="history-list">
          {emergencyHistory.map(emergency => {
            const Icon = getEmergencyIcon(emergency.type);
            return (
              <div key={emergency.id} className="history-item">
                <div className="history-icon">
                  <Icon size={20} />
                </div>
                <div className="history-content">
                  <h4>{emergency.title}</h4>
                  <p>{emergency.description}</p>
                  <span className="timestamp">
                    {emergency.timestamp.toLocaleDateString()} at{' '}
                    {emergency.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <span className={`status ${emergency.resolved ? 'resolved' : 'pending'}`}>
                  {emergency.resolved ? 'Resolved' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmergencyCenter;