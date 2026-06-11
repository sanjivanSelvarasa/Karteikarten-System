const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./0_routes/auth.routes');
const learningSetRoutes = require('./0_routes/learningSet.routes');
const flashcardRoutes = require('./0_routes/flashcard.routes');
const { errorHandler, notFoundHandler } = require('./1_middleware/error.middleware');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
