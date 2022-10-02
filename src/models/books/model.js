'use strict';


module.exports = (sequelizeDB, DataTypes) => {
  return sequelizeDB.define('books', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pages: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Pages must be greater than 0',
        },
      },
    },
  });
};