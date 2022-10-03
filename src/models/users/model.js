'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.SECRET || 'secretstring';

const userModel = (sequelize, DataTypes) => {
  const model = sequelize.define('Users', {
    username: { type: DataTypes.STRING, required: true, unique: true },
    password: { type: DataTypes.STRING, required: true },
    role: { type: DataTypes.ENUM('reader', 'writer', 'librarian', 'architect', 'admin'), required: true, defaultValue: 'reader'},
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username, id: this.id }, SECRET);
      },
      set(tokenObj) {
        let token = jwt.sign(tokenObj, SECRET);
        return token;
      },
    },
    capabilities: {
      type: DataTypes.VIRTUAL,
      get() {
        const acl = {
          reader: ['checkout'],
          writer: ['checkout', 'addToCatalog'],
          librarian: ['checkout', 'addToLibrary', 'checkBookStatus'],
          architect: ['checkout', 'buildLibrary', 'destroyLibrary'],
          admin: ['checkout',
            'addToCatalog',
            'checkBookStatus',
            'addToLibrary',
            'updateBook',
            'buildLibrary',
            'updateLibrary',
            'destroyLibrary', 
            'update', 
            'destroyBook',
            'superuser',
          ],
        };
        return acl[this.role];
      },
    },
  });

  model.beforeCreate(async (user) => {
    let hashedPass = await bcrypt.hash(user.password, 10);
    user.password = hashedPass;
  });

  model.authenticateBasic = async function (username, password) {
    const user = await this.findOne({ where: { username } });
    const valid = await bcrypt.compare(password, user.password);
    if (valid) { return user; }
    throw new Error('Invalid User');
  };

  model.authenticateToken = async function (token) {
    try {
      const parsedToken = jwt.verify(token, SECRET);
      const user = this.findOne({where: { username: parsedToken.username } });
      if (user) { return user; }
      throw new Error('User Not Found');
    } catch (e) {
      throw new Error(e.message);
    }
  };

  /**
   * 
   * @param {*} Instance of a Book model. 
   */
  model.prototype.checkoutBook = async function(book) {
    try {
      if (!book.UserId) {
        await this.addBook(book);
        const userBooks = await this.getBooks();
        return {
          books: userBooks,
          message: 'Successfully checked out book.',
        };
      } else {
        throw new Error('Book already checked out.');
      }
    } catch (err) {
      console.error(err);
      const userBooks = await this.getBooks;
      return {
        books: userBooks,
        message: err.message,
      };
    }
  };

  model.prototype.returnBook = async function(book) {
    try {
      if (book.UserId) {
        await this.removeBook(book);
        const userBooks = await this.getBooks();
        return {
          books: userBooks,
          message: 'Successfully returned book.',
        };
      } else {
        throw new Error('Cannot return book because it does not belong to current user.');
      }
    } catch (err) {
      console.error(err);
      const userBooks = await this.getBooks();
      return {
        books: userBooks,
        message: err.message,
      };
    }
  };

  return model;
};

module.exports = userModel;
