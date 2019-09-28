import socketIO from 'socket.io';
import {
    generateWelcomeMsg,
    getChatHistory,
    saveChatHistory,
    isValid,
    validateToken,
    addActiveUser,
    removeActiveUser,
    ONLINE_ROOM,
    getChatRooms,
    createChatRoom,
    saveChatUser,
    deleteChatUser,
    addSocketToChatUser,
    deleteSocketFromChatUser,
    findChatUserById,
    findChatUsersByRoom,
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

    io.on('connection', (socket) => {
        console.log(`CONNECTED socked with id:  ${socket.id}`);
        socket.emit('connected', 'Client side connected');

        socket.on('signin', async (token) => {
            socket.join(ONLINE_ROOM);
            const { valid, myId } = validateToken(token, ONLINE_ROOM, io);
            if (!valid) return;
            const activeUsers = await addActiveUser(myId, socket.id);
            io.to(ONLINE_ROOM).emit('signin', activeUsers);
        });

        socket.on('send_msg', async (msgData) => {
            const { msg, token } = msgData;
            const { valid, myId } = validateToken(token, msg.room, io);
            if (!valid) return;

            console.log('4: Send new msg.', msg.room);
            const chatRooms = getChatRooms();
            const friendId = msg.room.split('-')[1];
            const friendRoom = `${friendId}-${myId}`;
            if (chatRooms[friendRoom]) {
                // Send message to friend room, where we are joined
                io.to(friendRoom).emit('send_msg', msg);
            } else {
                // Send message to our room, where we are joined
                io.to(msg.room).emit('send_msg', msg);
            }
            const myDBChatHistory = await getChatHistory(msg.room);
            const myNewChatHistory = [...myDBChatHistory.chatHistory, msg];
            await saveChatHistory(msg.room, myNewChatHistory);

            const frDBChatHistory = await getChatHistory(friendRoom);
            // Friend has chat history => append new msg to his chat history
            if (frDBChatHistory) {
                const newFrChatHistory = [...frDBChatHistory.chatHistory, msg];
                await saveChatHistory(friendRoom, newFrChatHistory);
                return;
            }
            // Friend doesnt have chat history with us => create one for him
            const welcomeMsg = await generateWelcomeMsg(myId, friendId, friendRoom);
            await saveChatHistory(friendRoom, [welcomeMsg, msg]);
        });

        socket.on('edit_message', async (chat) => {
            const { valid } = validateToken(chat.token, chat.room, io);
            if (!valid) return;

            const [myId, friendId] = chat.room.split('-').map((v) => parseInt(v, 10));
            const friendRoom = `${friendId}-${myId}`;

            // Edit friend ChatHistory
            const frDBChatHistory = await getChatHistory(friendRoom);
            const frNewChatHistory = frDBChatHistory.chatHistory.map((msg) =>
                msg.id == chat.editedMsg.id ? chat.editedMsg : msg
            );

            // Find chat users by roomName
            const { myChatUser, frChatUser } = findChatUsersByRoom(chat.room);

            const myNewDBChatHistory = { id: chat.room, chatHistory: chat.history };
            const frNewDBChatHistory = { id: friendRoom, chatHistory: frNewChatHistory };
            myChatUser.sockets.forEach((socId) => socket.to(socId).emit('chat_history', myNewDBChatHistory));
            // Inform friend sockets about edited message, if they are joined in chat room
            if (frChatUser) {
                frChatUser.sockets.forEach((socId) => socket.to(socId).emit('chat_history', frNewDBChatHistory));
            }

            // Save new chat histories
            await saveChatHistory(chat.room, myNewDBChatHistory.chatHistory);
            await saveChatHistory(friendRoom, frNewDBChatHistory.chatHistory);
        });

        socket.on('delete_message', async (data) => {
            const { chat, deleteFor } = data;
            const { valid } = validateToken(chat.token, chat.room, io);
            if (!valid) return;
            const [myId, friendId] = chat.room.split('-').map((v) => parseInt(v, 10));
            const friendRoom = `${friendId}-${myId}`;

            // Find chat users by roomName
            const { myChatUser, frChatUser } = findChatUsersByRoom(chat.room);
            // Create my new db chat history
            const myNewDBChatHistory = { id: chat.room, chatHistory: chat.history };

            // Update chat history of all users
            if (deleteFor === 'everyone') {
                // Update friends ChatHistory
                const frDBChatHistory = await getChatHistory(friendRoom);
                const frNewChatHistory = frDBChatHistory.chatHistory.filter((msg) => msg.id !== chat.deletedMsg.id);
                const frNewDBChatHistory = { id: friendRoom, chatHistory: frNewChatHistory };
                // Inform mine and friends connected sockets about deleted message
                myChatUser.sockets.forEach((socId) => socket.to(socId).emit('chat_history', myNewDBChatHistory));
                // Inform friend sockets about edited message, if they are joined in chat room
                if (frChatUser) {
                    frChatUser.sockets.forEach((socId) => socket.to(socId).emit('chat_history', frNewDBChatHistory));
                }

                // Save new chat histories
                await saveChatHistory(chat.room, myNewDBChatHistory.chatHistory);
                await saveChatHistory(friendRoom, frNewDBChatHistory.chatHistory);
                return;
            }

            // Inform my sockets about deleted msg
            myChatUser.sockets.forEach((socId) => socket.to(socId).emit('chat_history', myNewDBChatHistory));
            await saveChatHistory(chat.room, myNewDBChatHistory.chatHistory);
        });

        socket.on('join_room', async (data) => {
            // Get chat rooms
            const chatRooms = getChatRooms();
            console.log('JOIN_ROOM_START', chatRooms);

            const { roomName, userData } = data;
            const { valid, myId } = validateToken(userData.token, roomName, io);
            if (!valid) return;

            const friendId = roomName.split('-')[1];
            const friendRoom = `${friendId}-${myId}`;
            const chatHistory = await getChatHistory(roomName);

            /**
             * @CHAT_ROOM_EXISTS
             * and friend has created it => roomName = `${friendId}-${myId}`
             */

            if (chatRooms[friendRoom]) {
                // Join with socket in friends room
                socket.join(friendRoom);

                const chatUser = findChatUserById(friendRoom, myId);
                if (chatUser && chatUser.sockets.length >= 1) {
                    // Add my socket to my chatUser data in friends room
                    addSocketToChatUser(friendRoom, myId, socket.id);
                } else {
                    // Add my chat user data to friends room
                    const newChatUser = { id: myId, sockets: [socket.id] };
                    saveChatUser(friendRoom, newChatUser);
                }
                // User doesn't have previous chat history
                if (!chatHistory) {
                    // Send welcome message
                    const welcomeMsg = await generateWelcomeMsg(friendId, myId, roomName);
                    socket.emit('send_msg', await welcomeMsg);
                    await saveChatHistory(roomName, [welcomeMsg]);
                    console.log('chatRooms', getChatRooms());
                    return;
                }
                socket.emit('chat_history', chatHistory);
                console.log('chatRooms', getChatRooms());
                return;
            }

            /**
             * @CHAT_ROOM_EXISTS
             * and I have created it => roomName = `${myId}-${friendId}`
             */

            if (chatRooms[roomName]) {
                socket.join(roomName);
                const chatUser = findChatUserById(roomName, myId);
                if (chatUser) {
                    console.log(`2: User in chatRoom: ${roomName} => joining with new socketId: ${socket.id}`);
                    // Add new socket to chat room user sockets array
                    addSocketToChatUser(roomName, myId, socket.id);
                    console.log('chatRooms', getChatRooms()[roomName]);
                    socket.emit('chat_history', chatHistory);
                    return;
                }
                console.log(`3: User with "${myId}" ID, joins the room: ${roomName}`);
                // Add new user to chat room
                const newChatUser = { id: myId, sockets: [socket.id] };
                saveChatUser(roomName, newChatUser);
                // User doesn't have previous chat history
                if (!chatHistory) {
                    // Send welcome message
                    const welcomeMsg = await generateWelcomeMsg(friendId, myId, roomName);
                    socket.emit('send_msg', await welcomeMsg);
                    await saveChatHistory(roomName, [welcomeMsg]);
                    console.log('chatRooms', getChatRooms());
                    return;
                }
                socket.emit('chat_history', chatHistory);
                console.log('chatRooms', getChatRooms());
                return;
            }

            /**
             * @CHAT_ROOM_DOESNT_EXISTS
             * and I will create it => roomName = `${myId}-${friendId}`
             */

            console.log('0: Create chat history');
            const newChatUser = { id: myId, sockets: [socket.id] };
            const chatRoom = [newChatUser];
            createChatRoom(roomName, chatRoom);
            // Join chat room with socket
            socket.join(roomName);
            // User doesn't have previous chat history
            if (!chatHistory) {
                // Send welcome message
                const welcomeMsg = await generateWelcomeMsg(friendId, myId, roomName);
                socket.emit('send_msg', welcomeMsg);
                await saveChatHistory(roomName, [welcomeMsg]);
                console.log('chatRooms', getChatRooms());
                return;
            }
            // User has chat history
            socket.emit('chat_history', chatHistory);
            console.log('chatRooms', getChatRooms());
        });

        socket.on('leave_chat', async (chat) => {
            const { room: roomName, history } = chat;
            // Socket leaves chat room
            socket.leave(chat.room);
            const chatRooms = getChatRooms();

            /**
             * @I_AM_LEAVING_FROM_ROOM_CREATED_BY_ME
             * roomName = `${myId}-${friendId}`
             */

            if (chatRooms[roomName]) {
                const myId = roomName.split('-').map((v) => parseInt(v, 10))[0];
                const chatUser = findChatUserById(roomName, myId);
                // I am logged in room with multiple sockets => delete just current socket
                if (chatUser.sockets.length > 1) {
                    deleteSocketFromChatUser(roomName, myId, socket.id);
                } else {
                    // I am logged in room with just this socket => delete my chatUser data from chat room
                    deleteChatUser(roomName, myId);
                }
                await saveChatHistory(chat.room, chat.history);
                console.log('chatRooms', getChatRooms()[roomName]);
                return;
            }

            /**
             * @I_AM_LEAVING_FROM_ROOM_CREATED_BY_FRIEND
             * roomName = `${myId}-${friendId}` && friendRoom = `${friendId}-${myId}`
             * we still recieve roomName
             */

            const [myId, friendId] = roomName.split('-').map((v) => parseInt(v, 10));
            const friendRoom = `${friendId}-${myId}`;

            const chatUser = findChatUserById(friendRoom, myId);
            // I am logged in room with multiple sockets => delete just current socket
            if (chatUser.sockets.length > 1) {
                deleteSocketFromChatUser(friendRoom, myId, socket.id);
            } else {
                // I am logged in room with just this socket => delete my chatUser data from chat room
                deleteChatUser(friendRoom, myId);
            }
            await saveChatHistory(roomName, history);
            console.log('chatRooms', getChatRooms()[friendRoom]);
        });

        socket.on('disconnect', async () => {
            console.log(`client ${socket.id} :: disconnected`);
            socket.leave(ONLINE_ROOM);
            const activeUsers = await removeActiveUser(socket.id);
            io.to(ONLINE_ROOM).emit('signin', activeUsers);
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
