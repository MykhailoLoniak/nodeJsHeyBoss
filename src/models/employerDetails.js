const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.js');

const EmployerDetails = client.define(
  "employerDetails",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    company_name: {
      type: DataTypes.STRING,
    },
    company_type: {
      type: DataTypes.STRING,
    },
    company_location: {
      type: DataTypes.STRING,
    },
    about: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    phone_number: {
      type: DataTypes.STRING,
    },
    team_size: {
      type: DataTypes.STRING,
    },
    clients: {
      type:  DataTypes.ARRAY(DataTypes.STRING),
    },
    contact_info: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    // rating: {
    //   type: DataTypes.STRING,
    // },
    avatar: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "employer_details",
    underscored: true,
  }
);

module.exports = {
  EmployerDetails,
};
