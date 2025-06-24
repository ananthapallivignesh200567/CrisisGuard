const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const socketIo = require('socket.io');
const http = require('http');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const emergencyRoutes = require('./routes/emergency');
const healthRoutes = require('./routes/health');
const familyRoutes = require('./routes/family');
const alertRoutes = require('./routes/alerts');

// Import services
const predictiveService = require('./services/predictiveService');
const emergencyResponseService = require('./services/emergencyResponseService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crisisguard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-family', (familyId) => {
    socket.join(familyId);
    console.log(`User joined family room: ${familyId}`);
  });

  socket.on('emergency-alert', (data) => {
    // Broadcast emergency to family members
    socket.to(data.familyId).emit('emergency-received', data);
    emergencyResponseService.handleEmergency(data);
  });

  socket.on('health-data', (data) => {
    // Process real-time health data
    predictiveService.analyzeHealthData(data, socket);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/alerts', alertRoutes);

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start predictive monitoring services
predictiveService.startContinuousMonitoring();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚨 CrisisGuard Server running on port ${PORT}`);
});