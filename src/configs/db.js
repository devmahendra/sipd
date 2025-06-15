require('dotenv').config({ path: __dirname + '/../../.env' });
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: Number(process.env.DB_MAX_CONNECTION), 
    idleTimeoutMillis: Number(process.env.DB_TIMEOUT),
});

module.exports = pool;
