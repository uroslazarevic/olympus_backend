import socketIO from 'socket.io';
import {
    generateWelcomeMsg,
    getChatHistory,
    saveChatHistory,
    isValid,
    validateToken,
    updateChatHistory,
    countActiveUsers,
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
    let myRooms = []; // [{name:'1-1000', friendId:1000, socketIds:[A,C]},{name:'1-1001', friendId:1001, socketIds:[B]}]
    io.on('connection', (socket) => {
        console.log(`CONNECTED socked with id:  ${socket.id}`);
        socket.emit('connected', 'Client side connected');

        socket.on('signin', async (token) => {
            const room = 'online-users';
            let myId;
            try {
                const res = isValid(token);
                myId = res.user.id;
            } catch (err) {
                socket.emit('signin_error', 'Invalid token. Please reauthenticate.');
            }
            // You should throw error in db with errorHandler!
            if (!myId) return;
            socket.join(room);
            const activeUsers = await countActiveUsers(myId);
            io.to(room).emit('signin', activeUsers);
        });

        socket.on('send_msg', async (msgData) => {
            const { msg, token } = msgData;
            let myId;
            try {
                const res = isValid(token);
                myId = res.user.id;
            } catch (err) {
                io.to(msg.room).emit('join_room_error', 'Invalid token. Please reauthenticate.');
            }
            if (!myId) return;

            console.log('4: Send new msg.');
            // Send welcome message
            io.to(msg.room).emit('send_msg', msg);
            const oldChatHistory = await getChatHistory(msg.room);
            const { chatHistory } = oldChatHistory;
            chatHistory.push(msg);
            await saveChatHistory(msg.room, chatHistory);
        });

        socket.on('edit_message', async (chat) => {
            const { valid } = validateToken(chat.token, chat.room, io);
            if (!valid) return;
            // Send new chat history to all sockets in room
            const newChatHistory = { id: chat.room, chatHistory: chat.history };
            socket.broadcast.to(chat.room).emit('chat_history', newChatHistory);
            // Save new chat history
            await saveChatHistory(chat.room, chat.history);
        });

        socket.on('delete_message', async (data) => {
            const { chat, deleteFor } = data;
            const { valid, myId } = validateToken(chat.token, chat.room, io);
            if (!valid) return;
            const newChatHistory = { id: chat.room, chatHistory: chat.history };
            // DELETE for all users in chat-room
            if (deleteFor === 'everyone') {
                // Send new chat history to all sockets in room
                socket.broadcast.to(chat.room).emit('chat_history', newChatHistory);
                // Save new chat history
                updateChatHistory(chat.room, chat.history);
                return;
            }
            // DELETE for me
            const chatRoom = usersRooms[myId].find((room) => room.name === chat.room);
            chatRoom.socketIds.forEach((socketId) => socket.to(socketId).emit('chat_history', newChatHistory));
        });

        socket.on('join_room', async (data) => {
            const { roomName, userData } = data;
            const friendId = roomName.split('-')[1];
            const chatHistory = await getChatHistory(roomName);
            let myId;
            try {
                const res = isValid(userData.token);
                myId = res.user.id;
            } catch (err) {
                socket.emit('join_room_error', 'Invalid token. Please reauthenticate.');
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
                const roomExist = usersRooms[myId].find((room) => room.name === roomName);
                // User already in join_room
                if (roomExist) {
                    console.log('2: User already registered room.');
                    // We join the room with different socketId - new tab
                    myRooms = myRooms.reduce((acc, room) => {
                        if (room.name === roomName) {
                            room.socketIds.push(socket.id);
                        }
                        acc.push(room);
                        return acc;
                    }, []);
                    usersRooms[myId] = myRooms;
                    socket.join(roomName);
                    socket.emit('chat_history', chatHistory);
                    return;
                }

                console.log('3: User will create a new room.');
                myRooms.push({ name: roomName, friendId, socketIds: [socket.id] });
                usersRooms[myId] = myRooms;
                socket.join(roomName);
                if (!chatHistory) {
                    // Send welcome message
                    socket.emit('send_msg', await generateWelcomeMsg(friendId, roomName));
                    return;
                }
                socket.emit('chat_history', chatHistory);
                return;
            }

            // Add chats to user
            myRooms.push({ name: roomName, friendId, socketIds: [socket.id] });
            usersRooms[myId] = myRooms;
            console.log('1: usersRooms', usersRooms);

            socket.join(roomName);
            // Retrieve chat history
            if (!chatHistory) {
                // Send welcome message
                socket.emit('send_msg', await generateWelcomeMsg(friendId, roomName));
                return;
            }
            socket.emit('chat_history', chatHistory);
        });

        socket.on('leave_chat', async (chat) => {
            const [myId, friendId] = chat.room.split('-');
            socket.leave(chat.room);
            myRooms = myRooms.filter((room) => room.friendId !== friendId);
            usersRooms[myId] = myRooms;
            await saveChatHistory(chat.room, chat.history);
        });

        socket.on('disconnect', async () => {
            console.log(`client ${socket.userId} :: disconnected`);
            io.emit('check_signin');
        });
        socket.on('error', (data) => console.log(data));
        socket.on('reconnect_attempt', () => {
            console.log('RECONNECTION');
        });
    });

    io.on('error', (data) => console.log('IO error', data));

    io.on('reconnect', (attemptNumber) => {
        console.log('IOreconnect', attemptNumber);
    });
};

export { initSocketServer };
