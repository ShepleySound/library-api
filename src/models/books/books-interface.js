'use strict';

const ModelInterface = require('../model-interface');

module.exports = class BookInterface extends ModelInterface {
  constructor(model){
    super(model);
  }

  // async getAllBooks(id){
  //   try {
  //     //  const books = await this.model.findByPk(id);
  //     // return await this.model.findAll({
  //     //   attributes: ['id', 'title', 'author', 'pages'],
  //     // });
  //     return await this.model.findAll()
  //   } catch (err) {
  //     console.error(err.message);
  //     return err;
  //   }
  // }

  async getBooksByUser(userId){
    try {
      const user = await this.model.findAll( { where: {
        UserId: userId,
      }});
      return await user.getBooks({
        attributes: ['id', 'title', 'author', 'pages', 'LibraryId'],
      });
    } catch (err) {
      console.error(err.message);
      return err;
    }
  }

  async getCheckedBooks(){
    try {
      const books = await this.model.findAll({ where: {
        UserId: !null,
      }});
    
      return await books.findAll({
        attributes: ['id', 'title', 'author', 'pages', 'LibraryId'],
      });
    } catch (err) {
      console.error(err.message);
      return err;
    }
  }


  async getAvailableBooks(){
    try {
      const books = await this.model.findAll({ where: {
        UserId: null,
      }});
    
      return await books.findAll({
        attributes: ['id', 'title', 'author', 'pages', 'LibraryId'],
      });
    } catch (err) {
      console.error(err.message);
      return err;
    }
  }

// getBooksByUser, getCheckedBooks, getAvailableBooks
};
