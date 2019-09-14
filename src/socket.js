import jwt from 'jsonwebtoken';
import socketIO from 'socket.io';
import {
    generateMsg,
    generateWelcomeMsg,
    getChatHistory,
    createChatHistory,
    updateChatHistory,
} from './helpers/socket';

const isValid = (token) => jwt.verify(token, process.env.SECRET);

const initSocketServer = (httpServer) => {
    const io = socketIO(httpServer);

    httpServer.listen(process.env.SOCKET_PORT, () =>
        console.log(`Socket running on port: http://localhost:${process.env.SOCKET_PORT}`)
    );

    // middleware
    io.use((socket, next) => {
        const { token } = socket.handshake.query;

        if (isValid(token)) {
            return next();
        }

        return next(new Error('authentication error'));
    });

    const usersRooms = {};
    let myRooms = [];
    io.on('connection', (socket) => {
        console.log(`CONNECTED socked with id:  ${socket.id}`);

        socket.emit('connected', 'Client side connected');

        socket.on('disconnect', () => console.log(`client ${socket.userId} :: disconnected`));
        socket.on('error', (data) => console.log(data));

        socket.on('reconnect_attempt', () => {
            console.log('RECONNECTION');
        });

        socket.on('chat_msg', async (msgData) => {
            const { msg, token, roomName } = msgData;
            let myId;
            try {
                const {
                    user: { id },
                } = isValid(token);
                myId = id;
            } catch (err) {
                io.to(roomName).emit('chat_room_error', 'Invalid token. Please reauthenticate.');
            }
            if (!myId) return;

            console.log('4: Send new msg.');
            // Send welcome message
            socket.emit('chat_msg', generateMsg(msg, roomName));
            // io.to(roomName).emit('chat_msg', generateMsg(msg, roomName));
        });

        socket.on('chat_room', async (data) => {
            const { roomName, userData } = data;
            const friendId = roomName.split('-')[1];
            const chatHistory = await getChatHistory(roomName);
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
                const room = `${friendId}-${myId}`;
                socket.join(room);
                // Retrieve chat history
                io.to(room).emit('chat_history', await getChatHistory(room));
                return;
            }

            if (usersRooms[myId]) {
                // User already in chat_room
                if (myRooms.includes(friendId)) {
                    console.log('2: User already registered room.');

                    socket.emit('chat_history', chatHistory);
                    return;
                }
                console.log('3: User will create a new room.');
                myRooms.push(friendId);
                socket.join(roomName);
                if (chatHistory.length === 0) {
                    // Send welcome message
                    socket.emit('chat_msg', await generateWelcomeMsg(friendId, roomName));
                    return;
                }
                socket.emit('chat_history', chatHistory);
                return;
            }

            // Send msg
            myRooms.push(friendId);
            // const theRoom = { ids:[myRooms.filter((e) => e !== null)], sockets:[] }
            // theRoom.ids =
            usersRooms[myId] = myRooms.filter((e) => e !== null);

            socket.join(roomName);
            // Retrieve chat history
            if (chatHistory.length === 0) {
                // Send welcome message
                socket.emit('chat_msg', await generateWelcomeMsg(friendId, roomName));
                return;
            }
            socket.emit('chat_history', chatHistory);
        });

        socket.on('leave_chat', async (chat) => {
            const friendId = chat.room.split('-')[1];
            myRooms = myRooms.filter((id) => id !== friendId);

            const oldChatHistory = await getChatHistory(chat.room);
            if (oldChatHistory.length === 0) {
                return createChatHistory(chat.room, chat.history);
            }
            return updateChatHistory(chat.room, chat.history);
        });
    });

    io.on('error', (data) => console.log('IO error', data));

    io.on('reconnect', (attemptNumber) => {
        console.log('IOreconnect', attemptNumber);
    });
};

export { initSocketServer };
