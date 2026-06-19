import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import app from './app.js';
import pool from './config/db.js';
import { initSocket } from './utils/socket.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('PostgreSQL connected successfully');

        const server = createServer(app);
        initSocket(server);

        server.listen(PORT, () => {
            console.log(`Ridivo server running on port ${PORT}`);
        });

    } catch (err) {
        console.error('Failed to connect to database:', err.message);
        process.exit(1);
    }
};

start();



//  Initialize everything required before accepting requests.
//  It does NOT contain business logic.
//  It only starts the application.