const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.js');

const ContractorDetails = client.define(
  "contractorDetails",
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
    job_category: {
      type: DataTypes.STRING,
    },
    work_experience: {
      type: DataTypes.STRING,
    },
    portfolio: {
      type: DataTypes.STRING,
    },
    section_title: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    avatar: {
      type: DataTypes.STRING,
    },
    location: {
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
    contact_info: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
  },
  {
    tableName: "contractor_details",
    underscored: true,
  }
);


module.exports = {
  ContractorDetails,
};
