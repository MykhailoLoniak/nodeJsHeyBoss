const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { ContractorDetails } = require('./contractorDetails.js');

const Project = client.define('project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  contractor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ContractorDetails,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  media: {
    type: DataTypes.ARRAY(DataTypes.STRING), // URL до фото або файлу
  },
}, {
  tableName: 'projects',
  underscored: true,
});

// ContractorDetails.hasMany(Project, { foreignKey: 'contractor_id' });
// Project.belongsTo(ContractorDetails, { foreignKey: 'contractor_id' });

module.exports = { Project };
