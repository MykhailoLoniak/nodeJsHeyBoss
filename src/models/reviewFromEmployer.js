const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.js');
const { Job } = require('./job.js'); 
const ReviewFromEmployer = client.define('review_from_employer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0, max: 5 },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
}, {
  timestamps: true,
  underscored: true,
});

module.exports = {
  ReviewFromEmployer,
};
