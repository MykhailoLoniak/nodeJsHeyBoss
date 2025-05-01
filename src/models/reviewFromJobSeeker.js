const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.js');
const { Job } = require('./job.js'); // Однина, бо модель повинна бути Job

const ReviewFromJobSeeker = client.define('review_from_job_seeker', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = {
  ReviewFromJobSeeker,
};
