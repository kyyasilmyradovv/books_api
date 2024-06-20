const express = require('express');
const cors = require('cors');
const app = express();
const swaggerUI = require('swagger-ui-express');
const AppError = require('./utils/error/appError');

// Api documentation
if (process.env.NODE_ENV === 'development') {
  // Avoid serving swagger documentation on production mode
  app.use(
    '/api-docs',
    swaggerUI.serve,
    swaggerUI.setup(require('./swaggers/options'))
  );
}

app.use(cors());

// Logs
app.use(require('morgan')('dev'));

// Parse requests
app.use(require('cookie-parser')());

// Limit requests against ddsos attacks
const limiter = require('express-rate-limit')({
  max: 1000,
  windowMs: 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/', limiter);

// Set maximum limit of request memory for security reasons
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Protecting xss attacks by by checking requests
app.use(require('xss-clean')());

// Serving public folder
app.use('/api', express.static(`${__dirname}/public`));

// Secure http requests
app.use(require('helmet')());

// Sharing server to the outside
app.use(require('cors')());

// Route guide to apis
app.use('/api/v1/', require('./routes/mainRouter'));

// Send not found error for wrong api names
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(require('./controllers/errorController'));

module.exports = app;
