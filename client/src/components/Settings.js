import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Globe, 
  Smartphone, 
  Heart, 
  Users, 
  AlertTriangle, 
  Save, 
  Eye, 
  EyeOff,
  Edit3,
  Camera,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Key,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import './Settings.css';

const Settings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
    medicalInfo: user?.medicalInfo || '',
    profilePicture: user?.profilePicture || null
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    emergencyAlerts: true,
    healthReminders: true,
    familyUpdates: true,
    systemUpdates: false,
    soundEnabled: true,
    vibrationEnabled: true
  });

  // Privacy & Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    locationSharing: true,
    dataSharing: false,
    profileVisibility: 'family',
    loginAlerts: true,
    sessionTimeout: 30,
    biometricLogin: false
  });

  // App Preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    units: 'imperial',
    dashboardLayout: 'default',
    autoRefresh: true,
    compactMode: false
  });

  // Health Settings
  const [healthSettings, setHealthSettings] = useState({
    trackingEnabled: true,
    shareWithFamily: true,
    shareWithDoctor: false,
    criticalAlertsOnly: false,
    heartRateAlerts: true,
    medicationReminders: true,
    appointmentReminders: true
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Load settings from API or localStorage
    loadUserSettings();
    requestNotificationPermission();
  }, []);

  const loadUserSettings = async () => {
    try {
      // Simulate API call to load user settings
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setNotificationSettings(prev => ({ ...prev, ...settings.notifications }));
        setSecuritySettings(prev => ({ ...prev, ...settings.security }));
        setPreferences(prev => ({ ...prev, ...settings.preferences }));
        setHealthSettings(prev => ({ ...prev, ...settings.health }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call to save settings
      const settings = {
        profile: profileData,
        notifications: notificationSettings,
        security: securitySettings,
        preferences: preferences,
        health: healthSettings
      };
      
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportData = () => {
    const data = {
      profile: profileData,
      settings: {
        notifications: notificationSettings,
        security: securitySettings,
        preferences: preferences,
        health: healthSettings
      },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crisisguard-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your data. Type "DELETE" to confirm.')) {
        // Handle account deletion
        console.log('Account deletion requested');
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Privacy & Security', icon: Shield },
    { id: 'health', label: 'Health Settings', icon: Heart },
    { id: 'preferences', label: 'App Preferences', icon: Smartphone },
    { id: 'account', label: 'Account Management', icon: Key }
  ];

  const renderProfileSettings = () => (
    <div className="settings-section">
      <h3>Profile Information</h3>
      
      <div className="profile-picture-section">
        <div className="profile-picture-container">
          {profileData.profilePicture ? (
            <img src={profileData.profilePicture} alt="Profile" className="profile-picture" />
          ) : (
            <div className="profile-picture-placeholder">
              <User size={40} />
            </div>
          )}
          <label className="profile-picture-edit">
            <Camera size={16} />
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="Enter first name"
          />
        </div>
        
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Enter last name"
          />
        </div>
        
        <div className="form-group">
          <label><Mail size={16} /> Email</label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
          />
        </div>
        
        <div className="form-group">
          <label><Phone size={16} /> Phone</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter phone number"
          />
        </div>
        
        <div className="form-group">
          <label><Calendar size={16} /> Date of Birth</label>
          <input
            type="date"
            value={profileData.dateOfBirth}
            onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
          />
        </div>
        
        <div className="form-group">
          <label>Emergency Contact</label>
          <input
            type="tel"
            value={profileData.emergencyContact}
            onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
            placeholder="Emergency contact number"
          />
        </div>
      </div>

      <div className="form-group">
        <label><MapPin size={16} /> Address</label>
        <textarea
          value={profileData.address}
          onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Enter your address"
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Medical Information</label>
        <textarea
          value={profileData.medicalInfo}
          onChange={(e) => setProfileData(prev => ({ ...prev, medicalInfo: e.target.value }))}
          placeholder="Allergies, medications, medical conditions..."
          rows="4"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Notification Preferences</h3>
      
      <div className="settings-group">
        <h4>Delivery Methods</h4>
        <div className="toggle-group">
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ 
                  ...prev, emailNotifications: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Email Notifications
            </label>
          </div>
          
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ 
                  ...prev, pushNotifications: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Push Notifications
            </label>
          </div>
          
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={notificationSettings.smsNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ 
                  ...prev, smsNotifications: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              SMS Notifications
            </label>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h4>Alert Types</h4>
        <div className="toggle-group">
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={notificationSettings.emergencyAlerts}
                onChange={(e) => setNotificationSettings(prev => ({ 
                  ...prev, emergencyAlerts: e.target.checked 
                }))}
              />
              <span className="toggle-slider emergency"></span>
              Emergency Alerts
            </label>
            <span className="setting-description">Critical emergency notifications</span>
          </div>
          
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={notificationSettings.healthReminders}
                onChange={(e) => setNotificationSettings(prev => ({ 
                  ...prev, healthReminders: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Health Reminders
            </label>
          </div>
          
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={notificationSettings.familyUpdates}
                onChange={(e) => setNotificationSettings(prev => ({ 
                  ...prev, familyUpdates: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Family Updates
            </label>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h4>Sound & Vibration</h4>
        <div className="toggle-group">
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={notificationSettings.soundEnabled}
                onChange={(e) => setNotificationSettings(prev => ({ 
                  ...prev, soundEnabled: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Sound Enabled
            </label>
          </div>
          
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={notificationSettings.vibrationEnabled}
                onChange={(e) => setNotificationSettings(prev => ({ 
                  ...prev, vibrationEnabled: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Vibration Enabled
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>Privacy & Security</h3>
      
      <div className="settings-group">
        <h4>Security Features</h4>
        <div className="toggle-group">
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={securitySettings.twoFactorAuth}
                onChange={(e) => setSecuritySettings(prev => ({ 
                  ...prev, twoFactorAuth: e.target.checked 
                }))}
              />
              <span className="toggle-slider security"></span>
              Two-Factor Authentication
            </label>
            <span className="setting-description">Add extra security to your account</span>
          </div>
          
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={securitySettings.biometricLogin}
                onChange={(e) => setSecuritySettings(prev => ({ 
                  ...prev, biometricLogin: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Biometric Login
            </label>
          </div>
          
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={securitySettings.loginAlerts}
                onChange={(e) => setSecuritySettings(prev => ({ 
                  ...prev, loginAlerts: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Login Alerts
            </label>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h4>Privacy Settings</h4>
        <div className="form-group">
          <label>Profile Visibility</label>
          <select
            value={securitySettings.profileVisibility}
            onChange={(e) => setSecuritySettings(prev => ({ 
              ...prev, profileVisibility: e.target.value 
            }))}
          >
            <option value="public">Public</option>
            <option value="family">Family Only</option>
            <option value="private">Private</option>
          </select>
        </div>
        
        <div className="toggle-group">
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={securitySettings.locationSharing}
                onChange={(e) => setSecuritySettings(prev => ({ 
                  ...prev, locationSharing: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Location Sharing
            </label>
          </div>
          
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={securitySettings.dataSharing}
                onChange={(e) => setSecuritySettings(prev => ({ 
                  ...prev, dataSharing: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Anonymous Data Sharing
            </label>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h4>Change Password</h4>
        <form onSubmit={handlePasswordChange} className="password-form">
          <div className="form-group">
            <label>Current Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ 
                  ...prev, currentPassword: e.target.value 
                }))}
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ 
                ...prev, newPassword: e.target.value 
              }))}
              placeholder="Enter new password"
            />
          </div>
          
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ 
                ...prev, confirmPassword: e.target.value 
              }))}
              placeholder="Confirm new password"
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <RefreshCw size={16} className="spinning" /> : <Key size={16} />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );

  const renderHealthSettings = () => (
    <div className="settings-section">
      <h3>Health Monitoring Settings</h3>
      
      <div className="settings-group">
        <h4>Data Collection</h4>
        <div className="toggle-group">
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={healthSettings.trackingEnabled}
                onChange={(e) => setHealthSettings(prev => ({ 
                  ...prev, trackingEnabled: e.target.checked 
                }))}
              />
              <span className="toggle-slider health"></span>
              Health Tracking Enabled
            </label>
            <span className="setting-description">Monitor vital signs and health metrics</span>
          </div>
          
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={healthSettings.heartRateAlerts}
                onChange={(e) => setHealthSettings(prev => ({ 
                  ...prev, heartRateAlerts: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Heart Rate Alerts
            </label>
          </div>
          
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={healthSettings.criticalAlertsOnly}
                onChange={(e) => setHealthSettings(prev => ({ 
                  ...prev, criticalAlertsOnly: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Critical Alerts Only
            </label>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h4>Data Sharing</h4>
        <div className="toggle-group">
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={healthSettings.shareWithFamily}
                onChange={(e) => setHealthSettings(prev => ({ 
                  ...prev, shareWithFamily: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Share with Family
            </label>
          </div>
          
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={healthSettings.shareWithDoctor}
                onChange={(e) => setHealthSettings(prev => ({ 
                  ...prev, shareWithDoctor: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Share with Healthcare Provider
            </label>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h4>Reminders</h4>
        <div className="toggle-group">
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={healthSettings.medicationReminders}
                onChange={(e) => setHealthSettings(prev => ({ 
                  ...prev, medicationReminders: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Medication Reminders
            </label>
          </div>
          
          <div className="toggle-item">
            <label>
              <input
                type="checkbox"
                checked={healthSettings.appointmentReminders}
                onChange={(e) => setHealthSettings(prev => ({ 
                  ...prev, appointmentReminders: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Appointment Reminders
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="settings-section">
      <h3>App Preferences</h3>
      
      <div className="settings-group">
        <h4>Appearance</h4>
        <div className="form-group">
          <label><Moon size={16} /> Theme</label>
          <select
            value={preferences.theme}
            onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>
        
        <div className="toggle-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.compactMode}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, compactMode: e.target.checked 
              }))}
            />
            <span className="toggle-slider"></span>
            Compact Mode
          </label>
        </div>
      </div>

      <div className="settings-group">
        <h4>Localization</h4>
        <div className="form-group">
          <label><Globe size={16} /> Language</label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Timezone</label>
          <select
            value={preferences.timezone}
            onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Units</label>
          <select
            value={preferences.units}
            onChange={(e) => setPreferences(prev => ({ ...prev, units: e.target.value }))}
          >
            <option value="imperial">Imperial (ft, lb, °F)</option>
            <option value="metric">Metric (m, kg, °C)</option>
          </select>
        </div>
      </div>

      <div className="settings-group">
        <h4>Dashboard</h4>
        <div className="form-group">
          <label>Layout</label>
          <select
            value={preferences.dashboardLayout}
            onChange={(e) => setPreferences(prev => ({ ...prev, dashboardLayout: e.target.value }))}
          >
            <option value="default">Default</option>
            <option value="compact">Compact</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>
        
        <div className="toggle-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.autoRefresh}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, autoRefresh: e.target.checked 
              }))}
            />
            <span className="toggle-slider"></span>
            Auto-refresh Data
          </label>
        </div>
      </div>
    </div>
  );

  const renderAccountManagement = () => (
    <div className="settings-section">
      <h3>Account Management</h3>
      
      <div className="settings-group">
        <h4>Data Management</h4>
        <div className="action-buttons">
          <button className="btn-secondary" onClick={handleExportData}>
            <Download size={16} />
            Export My Data
          </button>
        </div>
      </div>

      <div className="settings-group danger-zone">
        <h4>Danger Zone</h4>
        <p className="danger-description">
          These actions are permanent and cannot be undone.
        </p>
        <div className="action-buttons">
          <button className="btn-danger" onClick={handleDeleteAccount}>
            <Trash2 size={16} />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <div className="settings-actions">
          {saveSuccess && (
            <span className="save-success">✓ Settings saved</span>
          )}
          <button 
            className="btn-primary save-btn"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="spinning" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="settings-main">
          {activeTab === 'profile' && renderProfileSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'health' && renderHealthSettings()}
          {activeTab === 'preferences' && renderPreferences()}
          {activeTab === 'account' && renderAccountManagement()}
        </div>
      </div>
    </div>
  );
};

export default Settings;