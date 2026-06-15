import { Server } from 'socket.io';

let io;
// Map to track connected users: userId -> set of socketIds (to support multi-tab logins)
const userSockets = new Map();

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Register user
        socket.on('register', (userId) => {
            if (!userId) return;
            console.log(`Socket registered for user: ${userId}`);
            
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);
            socket.userId = userId;
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            if (socket.userId && userSockets.has(socket.userId)) {
                const sockets = userSockets.get(socket.userId);
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    userSockets.delete(socket.userId);
                }
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io is not initialized!");
    }
    return io;
};

// Send real-time notification to a specific user
export const emitToUser = (userId, event, data) => {
    if (!io) return;
    if (userSockets.has(userId)) {
        const socketIds = userSockets.get(userId);
        socketIds.forEach((socketId) => {
            io.to(socketId).emit(event, data);
        });
        console.log(`Emitted event '${event}' to user ${userId} on sockets:`, Array.from(socketIds));
    } else {
        console.log(`User ${userId} is offline. Socket event '${event}' not sent.`);
    }
};
