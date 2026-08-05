const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Record = sequelize.define('record', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  amt: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  nxt_draw: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  draw_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  tck_result: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  tck_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  win_qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  win_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  win_result: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  bonus: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  claimed_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  balance_after_bet: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  win_status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },
  record_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  lottery_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'funtarget',
  },
  bonus_status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },
  claim_status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },
  claim_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  claim_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  user_commi: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  agent_commi: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  underscored: true,
  paranoid: true,
});

module.exports = Record;
