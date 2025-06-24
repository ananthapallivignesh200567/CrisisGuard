import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    const serverUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:5000';

    this.socket = io(serverUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to CrisisGuard server');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from CrisisGuard server');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    }
  }

  joinFamily(familyId) {
    this.emit('join-family', familyId);
  }

  sendEmergencyAlert(emergencyData) {
    this.emit('emergency-alert', emergencyData);
  }

  sendHealthData(healthData) {
    this.emit('health-data', healthData);
  }

  isConnected() {
    return this.connected;
  }
}

export default new SocketService();