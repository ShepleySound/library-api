'use strict';

require('dotenv').config();
const { app } = require('./src/server');
const { sequelizeDB } = require('./src/models');
const PORT = process.env.PORT || 3002;

sequelizeDB.sync()
  .then(() => console.log('Database connection successful.'))
  .catch(err => console.error(err.message));

app.listen(PORT, () => {
  console.log(`Server started. Listening on port ${PORT}`);
});