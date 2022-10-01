'use strict';

const express = require('express');
const { books, libraries } = require('../models');
const bearerAuth = require('../auth/middleware/bearer.js');
const permissions = require('../auth/middleware/acl.js');

const router = express.Router();

router.post('/', handleCreate);
router.patch('/:bookid/:libraryid', handleAddExistingBookToLibrary);

// Creates a book with no library association
async function handleCreate(req, res) {
  let obj = req.body;
  let newRecord = await books.create(obj);
  res.status(201).json(newRecord);
}

// Updates a book's information
async function handleUpdate(req, res) {
  const id = req.params.id;
  const obj = req.body;
  let updatedRecord = await books.update(id, obj);
  res.status(200).json(updatedRecord);
}

// Creates an association between a book and a library
async function handleAddExistingBookToLibrary(req, res) {
  const book = await books.get(req.params.bookid);
  const libraryid = req.params.libraryid;
  let library = await libraries.addExistingBook(libraryid, book);
  res.status(200).json(library);
}

module.exports = router;