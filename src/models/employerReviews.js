const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.js');
const { Jobs } = require('./jobs.js');

const EmployerReview = client.define('employer_reviews', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
   employer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // 🔧 Таблиця, не модель
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

EmployerReview.belongsTo(User, { as: 'employer', foreignKey: 'employer_id' });
EmployerReview.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewer_id' });
EmployerReview.belongsTo(Jobs, { foreignKey: 'job_id' });

module.exports = {
  EmployerReview,
}