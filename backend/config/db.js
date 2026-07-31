import client from 'pg';
import env from 'dotenv';

env.config();

const { Pool } = client;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default pool;