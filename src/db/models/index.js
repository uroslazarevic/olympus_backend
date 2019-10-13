import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import configPath from '../config/config';

const env = process.env.NODE_ENV || 'development';
const config = configPath[env];

let sequelize;
const db = {};
const basename = path.basename(__filename);

if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], { ...config });
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, { ...config });
}

fs.readdirSync(__dirname)
    .filter((file) => {
        return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
    })
    .forEach((file) => {
        // eslint-disable-next-line dot-notation
        const model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;

// To remember
// const db = {
//     User: sequelize.import('./user'),
//     ChatHistory: sequelize.import('./chatHistory.js'),
// };
