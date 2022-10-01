'use strict';

const express = require('express');
const { books, libraries } = require('../models');
const bearerAuth = require('../auth/middleware/bearer.js');
const permissions = require('../auth/middleware/acl.js');

const router = express.Router();

router.get('/', bearerAuth, handleGetAll);
router.get('/:id', bearerAuth, handleGetOne);
router.get('/all/:userId', bearerAuth, permissions('checkBookStatus'), getBooksByUser);
router.get('/checked', bearerAuth, permissions('checkBookStatus'), getCheckedBooks);
router.get('/available', bearerAuth, getAvailableBooks);
router.post('/', bearerAuth, permissions('addToCatalog'), handleCreate);
router.put('/', bearerAuth, permissions('updateBook'), handleUpdate);
router.patch('/', bearerAuth, permissions('updateBook'), handleUpdate);
router.patch('/:bookid/:libraryid', bearerAuth, permissions('addToLibrary'), handleAddExistingBookToLibrary);
router.delete('/', bearerAuth, permissions('destroyBook'), handleDelete);

async function handleGetAll(req, res) {
  let records = await books.get();
  res.status(200).json(records);
}

async function handleGetOne(req, res) {
  const id = req.params.id;
  let record = await books.get(id);
  res.status(200).json(record);
}

// Gets books belonging to a specific user
async function getBooksByUser(req, res) {
  const id = req.params.id;
  let userBooks = await books.getBooksByUser(id);
  res.status(200).json(userBooks);
}

// Gets any book that is checked from library
async function getCheckedBooks(req, res) {
  const id = req.params.id;
  let books = await books.getCheckedBooks(id);
  res.status(200).json(books);
}

// get any book currently available for checkout
async function getAvailableBooks(req, res) {
  const id = req.params.id;
  let books = await books.getAvailableBooks(id);
  res.status(200).json(books);
}

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

async function handleDelete(req, res) {
  let id = req.params.id;
  let deletedRecord = await books.delete(id);
  res.status(200).json(deletedRecord);
}

// Creates an association between a book and a library
async function handleAddExistingBookToLibrary(req, res) {
  const book = await books.get(req.params.bookid);
  const libraryid = req.params.libraryid;
  let library = await libraries.addExistingBook(libraryid, book);
  res.status(200).json(library);
}



module.exports = router;