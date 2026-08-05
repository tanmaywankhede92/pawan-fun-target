const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Payout = sequelize.define('payouts', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  percentages: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  timestamps: false,
});

module.exports = Payout;
