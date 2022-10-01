'use strict';

const express = require('express');
const { libraries } = require('../models');
const bearerAuth = require('../auth/middleware/bearer.js');
const permissions = require('../auth/middleware/acl.js');

const router = express.Router();

router.post('/:id/addbook', handleAddNewBookToLibrary);
router.get('/:id/getbooks', getBooksInLibrary);

async function handleAddNewBookToLibrary(req, res) {
  const id = req.params.id;
  let book = await libraries.addNewBook(id, req.body);
  res.status(200).json(book);
}

async function getBooksInLibrary(req, res) {
  const id = req.params.id;
  let books = await libraries.getBooksInLibrary(id);
  res.status(200).json(books);
}

module.exports = router;