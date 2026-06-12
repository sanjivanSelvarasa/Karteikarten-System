const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./0_routes/auth.routes');
const learningSetRoutes = require('./0_routes/learningSet.routes');
const flashcardRoutes = require('./0_routes/flashcard.routes');
const { errorHandler, notFoundHandler } = require('./1_middleware/error.middleware');

const app = express();

const defaultAllowedOrigins = ['http://localhost:5173', 'https://karteikarten.gian.ink'];
const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : defaultAllowedOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (configuredOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/learning-sets', learningSetRoutes);
app.use('/api', flashcardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
