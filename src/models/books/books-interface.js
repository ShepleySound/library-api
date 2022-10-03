'use strict';

const { Op } = require('sequelize');
const ModelInterface = require('../model-interface');

module.exports = class BookInterface extends ModelInterface {
  constructor(model){
    super(model);
  }

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
      return await this.model.findAll({ where: {
        UserId: {
          [Op.not]: null, 
        },
      }});
    
      // return await books.findAll({
      //   attributes: ['id', 'title', 'author', 'pages', 'LibraryId'],
      // });
    } catch (err) {
      console.error(err.message);
      return err;
    }
  }


  async getAvailableBooks(){
    try {
      return await this.model.findAll({ where: {
        UserId: null,
      }});
    
      // return await books.findAll({
      //   attributes: ['id', 'title', 'author', 'pages', 'LibraryId'],
      // });
    } catch (err) {
      console.error(err.message);
      return err;
    }
  }

// getBooksByUser, getCheckedBooks, getAvailableBooks
};
