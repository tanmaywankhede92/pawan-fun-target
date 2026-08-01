const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const config = require('./src/config');
const logger = require('./src/config/logger');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookieSecret));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Fun Target API is running',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

const authRoutes = require('./src/routes/auth.routes');
app.use('/api/auth', authRoutes);

app.use(errorHandler);

module.exports = app;
