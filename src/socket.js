import jwt from 'jsonwebtoken';
import socketIO from 'socket.io';
import { generateMsg, generateWelcomeMsg, getChatHistory } from './helpers/socket';

const isValid = (token) => jwt.verify(token, process.env.SECRET);

const initSocketServer = (httpServer) => {
    httpServer.listen(process.env.SOCKET_PORT, () =>
        console.log(`Socket running on port: http://localhost:${process.env.SOCKET_PORT}`)
    );

    const io = socketIO(httpServer);

    // middleware
    io.use((socket, next) => {
        const { token } = socket.handshake.query;

        if (isValid(token)) {
            return next();
        }

        return next(new Error('authentication error'));
    });
    const usersRooms = {};
    io.on('connection', (socket) => {
        console.log(`CONNECTED socked with id:  ${socket.id}`);

        socket.emit('connected', 'Client side connected');

        let room;
        socket.on('chat_room', async (msg) => {
            const { friendId, userData } = msg;
            let myId;
            try {
                const {
                    user: { id },
                } = isValid(userData.token);
                myId = id;
            } catch (err) {
                socket.emit('chat_room_error', 'Invalid token. Please reauthenticate.');
            }
            if (!myId) return;

            const friendRooms = usersRooms[friendId];
            if (friendRooms && friendRooms.includes(myId)) {
                console.log('1: User joins friend room.');
                room = `${friendId}-${myId}`;
                socket.join(room);
                // Retrieve chat history
                const chatHistory = await getChatHistory(room);
                io.to(room).emit('chat_history', chatHistory);
                io.to(room).emit('chat_msg', generateMsg(msg));
                return;
            }

            const myRooms = usersRooms[myId] || [];

            if (myRooms.length !== 0) {
                room = `${myId}-${friendId}`;
                // User already in chat_room
                if (myRooms.includes(friendId)) {
                    console.log('2: User already registered room.');
                    // Retrieve chat history
                    io.to(room).emit('chat_history', await getChatHistory(room));
                    io.to(room).emit('chat_msg', generateMsg(msg));
                    return;
                }
                console.log('3: User will create a new room.');
                myRooms[myId].push(friendId);
                socket.join(room);
                // Retrieve chat history
                io.to(room).emit('chat_history', await getChatHistory(room));
                // Send welcome message
                io.to(room).emit('chat_msg', generateWelcomeMsg(friendId));
                io.to(room).emit('chat_msg', generateMsg(msg));
                return;
            }

            // Send msg
            // socket.emit('chat_msg', generateMsg(msg));
            myRooms.push(friendId);
            usersRooms[myId] = myRooms.filter((e) => e !== null);

            room = `${myId}-${friendId}`;
            socket.join(room);
            // Retrieve chat history
            io.to(room).emit('chat_history', await getChatHistory(room));
            // Send welcome message
            // io.to(room).emit('chat_msg', generateWelcomeMsg(friendId));
        });

        // leave room
        // socket.on("leave_chat", (room) => {

        // })
    });
};

export { initSocketServer };
