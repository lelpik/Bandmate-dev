const mariadb = require('mariadb');
const dotenv = require('dotenv');

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost', 
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bandmate',
  connectionLimit: 5
});

async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (err) {
    console.error("Error connecting to MariaDB:", err);
    throw err;
  }
}

module.exports = { pool, getConnection };
