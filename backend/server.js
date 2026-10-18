require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const http       = require('http');
const path       = require('path');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const { apiLimiter } = require('./src/middleware/rateLimit');

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  process.env.CLIENT_URL ||
  process.env.FRONTEND_URL ||
  'http://localhost:3000,http://localhost:5173,http://localhost:4173'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== 'production') {
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      return true;
    }
  }
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for socket origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api/', apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (filePath.endsWith('.html') || filePath.endsWith('.htm') || filePath.endsWith('.svg')) {
      res.setHeader('Content-Security-Policy', "default-src 'none'");
    }
  },
}));

app.use('/api/auth',     require('./src/routes/auth'));
app.use('/api/student',  require('./src/routes/student'));
app.use('/api/teacher',  require('./src/routes/teacher'));
app.use('/api/parent',   require('./src/routes/parent'));
app.use('/api/admin',    require('./src/routes/admin'));
app.use('/api/content',  require('./src/routes/content'));
app.use('/api/reels',    require('./src/routes/reels'));
app.use('/api/quiz',     require('./src/routes/quiz'));
app.use('/api/ai',       require('./src/routes/ai'));
app.use('/api/progress',      require('./src/routes/progress'));
app.use('/api/sync',          require('./src/routes/sync'));
app.use('/api/notifications', require('./src/routes/notification'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// 404 Handler for API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
});

// Global centralized error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err.stack || err);
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'An internal server error occurred. Please try again later.'
      : err.message || 'Internal server error';
  res.status(status).json({ error: message });
});

require('./src/socket')(io);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ DB error:', err.message); process.exit(1); });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 VidyAI backend running on port ${PORT}`));

// Graceful shutdown handling
const shutdown = () => {
  console.log('\nShutting down VidyAI backend gracefully...');
  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (_e) {
      process.exit(0);
    }
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
