'use strict';

const ModelInterface = require('../model-interface');

module.exports = class LibraryInterface extends ModelInterface {
  constructor(model) {
    super(model);
  }

  async get(id = null){
    try {
      let record;
      if (id) {
        record = await this.model.findByPk(id);
      } else {
        record = await this.model.findAll();
      }
      return record;
    } catch(err) {
      console.error(err.message);
      return err;
    }
  }

  async addBook(id, json) {
    try {
      const library = await this.model.findByPk(id);
      console.log(library);
      let book = await library.createBook(json);
      console.log(book);
    } catch (err) {
      console.error(err.message);
      return err;
    }
  }
};