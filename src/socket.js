import socketIO from 'socket.io';
import {
    generateMsg,
    generateWelcomeMsg,
    getChatHistory,
    saveChatHistory,
    isValid,
    validateToken,
} from './helpers/socket';

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
            io.to(roomName).emit('chat_msg', generateMsg(msg, roomName));
            const oldChatHistory = await getChatHistory(roomName);
            const { chatHistory } = oldChatHistory[0];
            chatHistory.push(msg);
            await saveChatHistory(roomName, chatHistory, oldChatHistory);
        });
        socket.on('edit_message', async (chat) => {
            const { valid } = validateToken(chat.token, chat.room, io);
            if (!valid) return;
            const oldChatHistory = await getChatHistory(chat.room);
            // Send new chat history to all sockets in room
            const newChatHistory = [{ id: chat.room, chatHistory: chat.history }];
            socket.broadcast.to(chat.room).emit('chat_history', newChatHistory);
            // Save new chat history
            await saveChatHistory(chat.room, chat.history, oldChatHistory);
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

            console.log('USERS ROOM', usersRooms[myId]);

            if (usersRooms[myId]) {
                // User already in chat_room
                if (myRooms.includes(friendId)) {
                    console.log('2: User already registered room.');
                    socket.join(roomName);
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

            // Add chats to user
            myRooms.push(friendId);
            usersRooms[myId] = myRooms;

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
            saveChatHistory(chat.room, chat.history, oldChatHistory);
        });
    });

    io.on('error', (data) => console.log('IO error', data));

    io.on('reconnect', (attemptNumber) => {
        console.log('IOreconnect', attemptNumber);
    });
};

export { initSocketServer };
