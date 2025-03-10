const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./User.js');

const ContractorDetails = client.define(
  "contractorDetails",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    skills: {
      type: DataTypes.TEXT,
      // allowNull: false,
    },
    experience: {
      type: DataTypes.STRING,
    },
    portfolio: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "contractor_details",
  }
);

// User.hasOne(ContractorDetails, { foreignKey: "userId", as: "contractorDetails" });
ContractorDetails.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  ContractorDetails,
};
