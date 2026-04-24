const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://admin:admin_pass@postgres-primary:5432/analytics_db'
});

console.log('Connected to PostgreSQL database');

module.exports = pool;