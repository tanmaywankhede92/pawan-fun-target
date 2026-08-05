const { sequelize } = require('../../config/database');
const User = require('./user.model');
const Role = require('./role.model');
const BalanceAddRemove = require('./balanceAddRemove.model');
const Maintenance = require('./maintenance.model');
const Payout = require('./payout.model');
const Result = require('./result.model');
const Record = require('./record.model');           

Role.hasMany(User, { foreignKey: 'role', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role', as: 'roleName' });

User.hasMany(BalanceAddRemove, { foreignKey: 'user_id', as: 'balanceLedger' });
BalanceAddRemove.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Record, { foreignKey: 'user_id', as: 'records' });
Record.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.belongsTo(User, { foreignKey: 'sponsor_agent_id', as: 'sponsorAgent' });

module.exports = {
  sequelize,
  User,
  Role,
  BalanceAddRemove,
  Maintenance,
  Payout,
  Result,
  Record,
};
