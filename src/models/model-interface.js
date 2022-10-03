'use strict';
class ModelInterface {

  constructor(model) {
    this.model = model;
  }

  async create(json) {
    try {
      let record = await this.model.create(json);
      return record;
    } catch (err) {
      console.error(err.message);
      return err;
    }
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

  // async readWithRelations(query) {
  //   try {
  //     let record = await this.model.findOne(query);
  //     return record;
  //   } catch(err) {
  //     console.error(err.message);
  //     return err;
  //   }
  // }

  // Returns the number of records updated. Should be either 0 or 1.
  async update(id, json) {
    try {
      await this.model.update(json, {
        where: {
          id: id,
        },
      });
      const updated = await this.model.findByPk(id);
      return updated;
    } catch(err) {
      console.error(err.message);
      return err;
    }
  }
  // Returns the number of records deleted. Should be either 0 or 1.
  async delete(id) {
    try {
      await this.model.destroy({
        where: {
          id: id,
        },
      });
      const deleted = await this.model.findByPk(id);
      return deleted;
    } catch(err) {
      console.error(err);
      return err;
    }
  }
}

module.exports = ModelInterface;