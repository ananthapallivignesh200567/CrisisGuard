import React, { useState, useEffect } from 'react';
import './FamilyCenter.css';

const FamilyCenter = ({ user }) => {
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      relation: 'Spouse',
      status: 'safe',
      location: 'Downtown Office',
      lastSeen: new Date(Date.now() - 30 * 60000),
      healthStatus: 'good',
      emergencyContact: true,
      avatar: '👩‍💼'
    },
    {
      id: 2,
      name: 'Alex Johnson',
      relation: 'Child',
      status: 'safe',
      location: 'Roosevelt High School',
      lastSeen: new Date(Date.now() - 15 * 60000),
      healthStatus: 'good',
      emergencyContact: false,
      avatar: '👨‍🎓'
    },
    {
      id: 3,
      name: 'Margaret Smith',
      relation: 'Mother',
      status: 'attention',
      location: 'Sunny Acres Care Home',
      lastSeen: new Date(Date.now() - 2 * 60 * 60000),
      healthStatus: 'monitoring',
      emergencyContact: true,
      avatar: '👵'
    }
  ]);

  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: '',
    phone: '',
    email: ''
  });

  const [familyAlerts, setFamilyAlerts] = useState([
    {
      id: 1,
      type: 'check-in',
      member: 'Margaret Smith',
      message: 'Missed morning medication check-in',
      timestamp: new Date(Date.now() - 60 * 60000),
      severity: 'warning'
    },
    {
      id: 2,
      type: 'location',
      member: 'Alex Johnson',
      message: 'Arrived safely at school',
      timestamp: new Date(Date.now() - 30 * 60000),
      severity: 'info'
    }
  ]);

  const [sharedCalendar, setSharedCalendar] = useState([
    {
      id: 1,
      title: 'Alex - Soccer Practice',
      date: '2024-06-26',
      time: '16:00',
      type: 'activity',
      assignedTo: 'Alex Johnson'
    },
    {
      id: 2,
      title: 'Margaret - Doctor Appointment',
      date: '2024-06-27',
      time: '10:00',
      type: 'medical',
      assignedTo: 'Margaret Smith'
    },
    {
      id: 3,
      title: 'Family Dinner',
      date: '2024-06-28',
      time: '18:00',
      type: 'family',
      assignedTo: 'All'
    }
  ]);

  useEffect(() => {
    // Simulate real-time location updates
    const interval = setInterval(() => {
      setFamilyMembers(prev => 
        prev.map(member => ({
          ...member,
          lastSeen: new Date(Date.now() - Math.random() * 60 * 60000)
        }))
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return '#10B981';
      case 'attention': return '#F59E0B';
      case 'emergency': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatLastSeen = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  const sendCheckIn = (memberId) => {
    const member = familyMembers.find(m => m.id === memberId);
    alert(`Check-in request sent to ${member.name}`);
  };

  const callMember = (memberId) => {
    const member = familyMembers.find(m => m.id === memberId);
    alert(`Calling ${member.name}...`);
  };

  const addFamilyMember = () => {
    if (newMember.name && newMember.relation) {
      const member = {
        id: Date.now(),
        ...newMember,
        status: 'safe',
        location: 'Unknown',
        lastSeen: new Date(),
        healthStatus: 'good',
        emergencyContact: false,
        avatar: '👤'
      };
      
      setFamilyMembers(prev => [...prev, member]);
      setNewMember({ name: '', relation: '', phone: '', email: '' });
      setShowAddMember(false);
    }
  };

  const dismissAlert = (alertId) => {
    setFamilyAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="family-center">
      <div className="family-header">
        <h1>Family Center</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddMember(true)}
        >
          + Add Family Member
        </button>
      </div>

      {/* Family Alerts */}
      {familyAlerts.length > 0 && (
        <div className="family-alerts">
          <h2>🔔 Family Alerts</h2>
          <div className="alerts-list">
            {familyAlerts.map(alert => (
              <div key={alert.id} className={`alert-card alert-${alert.severity}`}>
                <div className="alert-content">
                  <div className="alert-member">{alert.member}</div>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-time">{formatLastSeen(alert.timestamp)}</div>
                </div>
                <button 
                  className="alert-dismiss"
                  onClick={() => dismissAlert(alert.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Family Members Grid */}
      <div className="family-members">
        <h2>👥 Family Members</h2>
        <div className="members-grid">
          {familyMembers.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-header">
                <div className="member-avatar">{member.avatar}</div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p className="member-relation">{member.relation}</p>
                </div>
                <div 
                  className="member-status"
                  style={{ backgroundColor: getStatusColor(member.status) }}
                >
                  <span className="status-dot"></span>
                </div>
              </div>
              
              <div className="member-details">
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <span className="detail-text">{member.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🕒</span>
                  <span className="detail-text">Last seen {formatLastSeen(member.lastSeen)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">❤️</span>
                  <span className={`health-status health-${member.healthStatus}`}>
                    {member.healthStatus}
                  </span>
                </div>
              </div>

              <div className="member-actions">
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => sendCheckIn(member.id)}
                >
                  Check-in
                </button>
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => callMember(member.id)}
                >
                  📞 Call
                </button>
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => setSelectedMember(member)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Calendar */}
      <div className="shared-calendar">
        <h2>📅 Family Calendar</h2>
        <div className="calendar-events">
          {sharedCalendar.map(event => (
            <div key={event.id} className={`calendar-event event-${event.type}`}>
              <div className="event-date">
                <div className="event-day">{new Date(event.date).getDate()}</div>
                <div className="event-month">
                  {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                </div>
              </div>
              <div className="event-details">
                <h4>{event.title}</h4>
                <p>{event.time} - {event.assignedTo}</p>
              </div>
              <div className="event-actions">
                <button className="btn btn-sm btn-outline">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Sharing */}
      <div className="location-sharing">
        <h2>🗺️ Family Locations</h2>
        <div className="location-map-placeholder">
          <div className="map-container">
            <div className="map-overlay">
              <p>Interactive family location map would appear here</p>
              <div className="location-pins">
                {familyMembers.map(member => (
                  <div key={member.id} className="location-pin">
                    <span className="pin-avatar">{member.avatar}</span>
                    <span className="pin-label">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="emergency-contacts">
        <h2>🚨 Emergency Contacts</h2>
        <div className="contacts-list">
          {familyMembers
            .filter(member => member.emergencyContact)
            .map(member => (
              <div key={member.id} className="contact-card">
                <div className="contact-info">
                  <span className="contact-avatar">{member.avatar}</span>
                  <div>
                    <h4>{member.name}</h4>
                    <p>{member.relation}</p>
                  </div>
                </div>
                <button className="btn btn-emergency">
                  📞 Emergency Call
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Family Member</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddMember(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Relation</label>
                <select
                  value={newMember.relation}
                  onChange={(e) => setNewMember(prev => ({ ...prev, relation: e.target.value }))}
                >
                  <option value="">Select relation</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddMember(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={addFamilyMember}
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedMember.name} - Details</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedMember(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="member-detail-grid">
                <div className="detail-section">
                  <h4>Current Status</h4>
                  <p>Status: <span className={`status-badge status-${selectedMember.status}`}>{selectedMember.status}</span></p>
                  <p>Location: {selectedMember.location}</p>
                  <p>Last seen: {formatLastSeen(selectedMember.lastSeen)}</p>
                </div>
                <div className="detail-section">
                  <h4>Health Status</h4>
                  <p>Overall: <span className={`health-badge health-${selectedMember.healthStatus}`}>{selectedMember.healthStatus}</span></p>
                  <p>Emergency Contact: {selectedMember.emergencyContact ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedMember(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyCenter;