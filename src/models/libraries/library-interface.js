'use strict';

const { books } = require('..');
const ModelInterface = require('../model-interface');

module.exports = class LibraryInterface extends ModelInterface {
  constructor(model) {
    super(model);
  }

  async addBook(id, json) {
    try {
      const library = await this.model.findByPk(id);
      const book = await library.createBook(json);
      return book;
    } catch (err) {
      console.error(err.message);
      return err;
    }
  }
};