const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { Job } = require('./jobs.js');
const { User } = require('./user.js');

const JobExecutors = client.define(
  "job_executors",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    job_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Job,
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('assigned', 'completed', 'in_progress'),
      defaultValue: 'assigned',
    },
    start_date: {
      type: DataTypes.DATE,
    },
    end_date: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "job_executors",
    underscored: true,
    timestamps: true,
  }
);

module.exports = {
  JobExecutors,
};
