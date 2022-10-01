'use strict';

const express = require('express');
const { libraries } = require('../models');
const bearerAuth = require('../auth/middleware/bearer.js');
const permissions = require('../auth/middleware/acl.js');

const router = express.Router();

router.get('/', bearerAuth, handleGetAll);
router.get('/:id', bearerAuth, handleGetOne);
router.get('/:id/books', bearerAuth, getBooksInLibrary);
router.post('/', bearerAuth, permissions('buildLibrary'), handleCreate);
// router.post('/:id/addbook', bearerAuth, permissions('addToLibrary'), handleAddNewBookToLibrary);
router.put('/:id', bearerAuth, permissions('updateLibrary'), handleUpdate);
router.patch('/:id', bearerAuth, permissions('updateLibrary'), handleUpdate);
router.delete('/:id', bearerAuth, permissions('destroyLibrary'), handleDelete);

async function handleGetAll(req, res) {
  let records = await libraries.get();
  res.status(200).json(records);
}

async function handleGetOne(req, res) {
  const id = req.params.id;
  let record = await libraries.get(id);
  res.status(200).json(record);
}

async function handleCreate(req, res) {
  let obj = req.body;
  let newRecord = await libraries.create(obj);
  res.status(201).json(newRecord);
}

async function handleUpdate(req, res) {
  const id = req.params.id;
  const obj = req.body;
  let updatedRecord = await libraries.update(id, obj);
  res.status(200).json(updatedRecord);
}

async function handleDelete(req, res) {
  let id = req.params.id;
  let deletedRecord = await libraries.delete(id);
  res.status(200).json(deletedRecord);
}

// async function handleAddNewBookToLibrary(req, res) {
//   const id = req.params.id;
//   let book = await libraries.addNewBook(id, req.body);
//   res.status(200).json(book);
// }

async function getBooksInLibrary(req, res) {
  const id = req.params.id;
  let books = await libraries.getBooksInLibrary(id);
  res.status(200).json(books);
}

module.exports = router;