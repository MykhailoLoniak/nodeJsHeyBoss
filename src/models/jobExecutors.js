const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { Jobs } = require('./jobs.js');
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
        model: Jobs,
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

// Визначення зв'язку між моделями
JobExecutors.belongsTo(Jobs, { foreignKey: "job_id" });
JobExecutors.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  JobExecutors,
};
