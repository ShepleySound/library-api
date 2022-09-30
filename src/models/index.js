'use strict';

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const ModelInterface = require('./model-interface');
const LibraryInterface = require('./libraries/library-interface');

const DATABASE_URL = process.env.DATABASE_URL || 'sqlite:memory';


const DATABASE_CONFIG = process.env.NODE_ENV === 'production' ? {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
} : process.env.NODE_ENV === 'test' ? {
  logging: false,
} : {};

const sequelizeDB = new Sequelize(DATABASE_URL, DATABASE_CONFIG);

// Require models
const User = require('./users/model')(sequelizeDB, DataTypes);
const Book = require('./books/model')(sequelizeDB, DataTypes);
const Library = require('./libraries/model')(sequelizeDB, DataTypes);

User.hasMany(Book);
Book.belongsTo(User);
Book.belongsTo(Library);
Library.hasMany(Book);


module.exports = { 
  sequelizeDB,
  users: User,
  books: new ModelInterface(Book),
  libraries: new LibraryInterface(Library),

};