'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');

const { users, books } = require('../models');
const bearerAuth = require('../auth/middleware/bearer.js');
const permissions = require('../auth/middleware/acl.js');

const router = express.Router();

router.get('/', bearerAuth, async (req, res) => {
  try {
    const decoded = jwt.decode(req.token);
    const user = await users.findByPk(decoded.id, {
      attributes: {
        exclude: ['password'],
      },
    });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return err;
  }
});

router.patch('/checkout/:bookid', bearerAuth, async (req, res) => {
  try {
    const decoded = jwt.decode(req.token);
    const user = await users.findByPk(decoded.id, {
      attributes: {
        exclude: ['password'],
      },
    });
    const bookId = req.params.bookid;
    const book = await books.get(bookId);
    const checkedBooks = await user.checkoutBook(book);
    res.status(200).json(checkedBooks);
  } catch (err) {
    console.error(err);
    return err;
  }
});

router.patch('/return/:bookid', bearerAuth, async (req, res) => {
  try {
    const decoded = jwt.decode(req.token);
    const user = await users.findByPk(decoded.id, {
      attributes: {
        exclude: ['password'],
      },
    });
    const bookId = req.params.bookid;
    const book = await books.get(bookId);
    const checkedBooks = await user.returnBook(book);
    res.status(200).json(checkedBooks);
  } catch (err) {
    console.error(err);
    return err;
  }
});

module.exports = router;