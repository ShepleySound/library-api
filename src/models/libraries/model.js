'use strict';

module.exports = (sequelizeDB, DataTypes) => {
  return sequelizeDB.define('libraries', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};