const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.js');

const Jobs = client.define(
  "jobs",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    job_title: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    employment_type: {
      type: DataTypes.STRING,
    },
    salary: {
      type: DataTypes.INTEGER,
    },
    short_summary: {
      type: DataTypes.STRING,
    },
    full_description: {
      type: DataTypes.STRING,
    },
    application_deadline: {
      type: DataTypes.ENUM('via platform inbox', 'external link', 'by email'),
    },
    visibility: {
      type: DataTypes.ENUM('public', 'private', 'internal'),
    },
    status: {
      type: DataTypes.ENUM('active', 'closed', 'draft'),
      defaultValue: 'draft',
    },

  },
  {
    tableName: "jobs",
    underscored: true,
    timestamps: true,
  }
);

Jobs.belongsTo(User, { foreignKey: "company_id" });

module.exports = {
  Jobs,
};
