const { sequelize } = require('./src/config/database');
const models = require('./src/database/models');

const User = models.User;
const RefreshToken = models.RefreshToken;

console.log('=== users table ===');
console.log('Table: ' + User.tableName + '\n');
Object.entries(User.rawAttributes).forEach(([name, attr]) => {
  const parts = [name + ': ' + attr.type.key];
  if (attr.primaryKey) parts.push('PK');
  if (attr.autoIncrement) parts.push('AUTO_INCREMENT');
  if (attr.allowNull === false) parts.push('NOT NULL');
  if (attr.defaultValue !== undefined && attr.defaultValue !== null) {
    parts.push('DEFAULT ' + attr.defaultValue);
  }
  if (attr.unique) parts.push('UNIQUE');
  if (attr.references) parts.push('FK -> ' + attr.references.model + '(' + attr.references.key + ')');
  if (attr.validate) {
    const vals = attr.validate;
    if (vals.len) parts.push('LENGTH(' + vals.len[0] + '-' + vals.len[1] + ')');
  }
  console.log('  ' + parts.join(', '));
});

console.log('\n=== refresh_tokens table ===');
console.log('Table: ' + RefreshToken.tableName + '\n');
Object.entries(RefreshToken.rawAttributes).forEach(([name, attr]) => {
  const parts = [name + ': ' + attr.type.key];
  if (attr.primaryKey) parts.push('PK');
  if (attr.autoIncrement) parts.push('AUTO_INCREMENT');
  if (attr.allowNull === false) parts.push('NOT NULL');
  if (attr.defaultValue !== undefined) parts.push('DEFAULT ' + attr.defaultValue);
  if (attr.references) parts.push('FK -> ' + attr.references.model + '(' + attr.references.key + ')');
  console.log('  ' + parts.join(', '));
});

sequelize.close();
