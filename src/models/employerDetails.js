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
  },
  {
    tableName: "employer_details",
    underscored: true,
  }
);

EmployerDetails.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  EmployerDetails,
};
