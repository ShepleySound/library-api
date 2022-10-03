'use strict';

// 3rd party middleware
const express = require('express');
const cors = require('cors');

// Custom middleware
const notFound = require('./middleware/error-handlers/404');
const errorHandler = require('./middleware/error-handlers/500');

// Routers
const authRouter = require('./auth/routes');
// const v1Router = require('./routes/v1');
// const v2Router = require('./routes/v2');
const libraryRouter = require('./routes/libraries');
const bookRouter = require('./routes/books');
const profileRouter = require('./routes/profiles');

const app = express();

// App level middleware
app.use(cors());
// app.use(logger);

// Accept json or form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);
// app.use('/api/v1', v1Router);
app.use('/api/libraries', libraryRouter);
app.use('/api/books', bookRouter);
app.use('/api/profile', profileRouter);
// app.use('/api', v1Router);



app.get('/', (req, res) => {
  res.status(200).send('Welcome to the server!');
});

// Catch-all route (404)
app.use('*', notFound);

// Default error handler (500)
app.use(errorHandler);

module.exports = { app };