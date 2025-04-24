const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.js');
const { Jobs } = require('./jobs.js');

const ContractorReview = client.define('contractor_reviews', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', 
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  reviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  rating: {
    type: DataTypes.INTEGER, 
    allowNull: false,
  },
  comment: {
    type: DataTypes.STRING,
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: true, 
    references: {
      model: 'jobs',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
}, {
  timestamps: true,
  underscored: true,
});

ContractorReview.belongsTo(User, { as: 'employer', foreignKey: 'employer_id' });
ContractorReview.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewer_id' });
ContractorReview.belongsTo(Jobs, { foreignKey: 'job_id' });

module.exports = {
  ContractorReview,
}