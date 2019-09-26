import path from 'path';
import Sequelize from 'sequelize';

const env = process.env.NODE_ENV || 'development';
const configPath = path.join(__dirname, '/../config/config.js');
// eslint-disable-next-line import/no-dynamic-require
const config = require(configPath)[env];

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], { ...config });
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, { ...config });
}

const db = {
    User: sequelize.import('./user'),
    ChatHistory: sequelize.import('./chatHistory.js'),
};

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
