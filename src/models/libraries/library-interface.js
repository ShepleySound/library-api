'use strict';

const ModelInterface = require('../model-interface');
module.exports = class LibraryInterface extends ModelInterface {
  constructor(model) {
    super(model);
  }

  async addNewBook(id, json) {
    try {
      const library = await this.model.findByPk(id);
      const book = await library.createBook(json);
      return book;
    } catch (err) {
      console.error(err.message);
      return err;
    }
  }
  
  /**
   * Adds a book that already exists in the Books table to the library specified by the libraryid.
   * @param {*} libraryid Primary key of a library model.
   * @param {Book} book An instance of the Book model.
   * @returns The book that was added.
   */
  async addExistingBook(libraryid, book) {
    try {
      const library = await this.model.findByPk(libraryid);
      return await library.addBook(book);
    } catch (err) {
      console.error(err.message);
      return err;
    }
  }

  async getBooksInLibrary(id) {
    try {
      const library = await this.model.findByPk(id);
      return await library.getBooks({
        attributes: ['id', 'title', 'author', 'pages', 'UserId'],
      });
    } catch (err) {
      console.error(err.message);
      return err;
    }
  }
};