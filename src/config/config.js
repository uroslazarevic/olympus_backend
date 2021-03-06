import path from 'path';

const envPath = path.join(__dirname, '../../', `.env.${process.env.NODE_ENV.toLocaleLowerCase()}`);
require('dotenv').config({ path: envPath });

module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: 'localhost',
        dialect: 'postgres',
    },
    staging: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: 'localhost',
        dialect: 'postgres',
    },
    test: {
        username: 'root',
        password: null,
        database: 'database_test',
        host: '127.0.0.1',
        dialect: 'postgres',
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.HOST,
        dialect: 'postgres',
    },
};
