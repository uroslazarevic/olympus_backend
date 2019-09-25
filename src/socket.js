import socketIO from 'socket.io';
import {
    generateWelcomeMsg,
    getChatHistory,
    saveChatHistory,
    isValid,
    validateToken,
    countActiveUsers,
    locateChatRoom,
    getChatRooms,
    createChatRoom,
    saveChatUser,
    deleteChatUser,
    addSocketToChatUser,
    deleteSocketFromChatUser,
    findChatByUserId,
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

    // {myId: myRooms, friendId: friendRooms}
    /* [
        {name:'1-1000', friendId:1000, sockets:[{ userId: 1, sockedId: A },{ userId: 1000, sockedId: B }]},
        {name:'1-1001', friendId:1001, sockets:[{ userId: 1, sockedId: A },{ userId: 1001, sockedId: C }]}
        ]
     myRooms
    */
    const usersRooms = {};
    io.on('connection', (socket) => {
        console.log(`CONNECTED socked with id:  ${socket.id}`);
        socket.emit('connected', 'Client side connected');

        socket.on('signin', async (token) => {
            const room = 'online-users';
            socket.join(room);
            const { valid, myId } = validateToken(token, room, io);
            if (!valid) return;
            const activeUsers = await countActiveUsers(myId);
            io.to(room).emit('signin', activeUsers);
        });

        socket.on('send_msg', async (msgData) => {
            const { msg, token } = msgData;
            const { valid, myId } = validateToken(token, msg.room, io);
            if (!valid) return;
            console.log('4: Send new msg.', msg.room);
            const friendId = msg.room.split('-')[1];
            const friendRoom = `${friendId}-${myId}`;
            if (usersRooms[friendId] && usersRooms[friendId].find((r) => r.name === friendRoom)) {
                // Send message to friend room, where we are joined
                io.to(friendRoom).emit('send_msg', msg);
            } else {
                // Send message to our room, where we are joined
                io.to(msg.room).emit('send_msg', msg);
            }
            const myChatHistory = (await getChatHistory(msg.room)).chatHistory;
            myChatHistory.push(msg);
            await saveChatHistory(msg.room, myChatHistory);
            const friendChatHistory = await getChatHistory(friendRoom);
            if (friendChatHistory) {
                friendChatHistory.chatHistory.push(msg);
                await saveChatHistory(friendRoom, friendChatHistory.chatHistory);
                return;
            }
            const welcomeMsg = await generateWelcomeMsg(myId, friendId, friendRoom);
            await saveChatHistory(friendRoom, [welcomeMsg, msg]);
        });

        socket.on('edit_message', async (chat) => {
            const { valid } = validateToken(chat.token, chat.room, io);
            if (!valid) return;
            const [myId, friendId] = chat.room.split('-');
            const friendRoom = `${friendId}-${myId}`;

            // Edit friend ChatHistory
            const frChatHistory = await getChatHistory(friendRoom);
            const editedFriendsCH = frChatHistory.chatHistory.map((msg) =>
                msg.id == chat.editedMsg.id ? chat.editedMsg : msg
            );

            // Determine room data
            const { chatRoomData } = locateChatRoom(usersRooms, chat.room);

            console.log('chatRoomData.sockets', chatRoomData.sockets);

            // Inform mine and friends connected sockets about edited message
            chatRoomData.sockets.forEach((soc) => {
                if (soc.userId == myId) {
                    console.log('myId:', soc);
                    socket.to(soc.socketId).emit('chat_history', { id: chat.room, chatHistory: chat.history });
                } else {
                    console.log('frId', soc);
                    socket.to(soc.socketId).emit('chat_history', { id: friendRoom, chatHistory: editedFriendsCH });
                }
            });
            // Save new chat history
            await saveChatHistory(chat.room, chat.history);
            await saveChatHistory(friendRoom, editedFriendsCH);
        });

        socket.on('delete_message', async (data) => {
            const { chat, deleteFor } = data;
            const { valid } = validateToken(chat.token, chat.room, io);
            if (!valid) return;
            const [myId, friendId] = chat.room.split('-');
            const friendRoom = `${friendId}-${myId}`;

            // Determine room data
            const { chatRoomData } = locateChatRoom(usersRooms, chat.room);

            // Update chat history of all users
            if (deleteFor === 'everyone') {
                // Update friends ChatHistory
                const frChatHistory = await getChatHistory(friendRoom);
                const updatedFriendsCH = frChatHistory.chatHistory.filter((msg) => msg.id !== chat.deletedMsg.id);
                const updatedMyCH = chat.history.filter((msg) => msg.id !== chat.deletedMsg.id);
                console.log('chatRoomData', chatRoomData, myId, myId);
                // Inform mine and friends connected sockets about deleted message
                chatRoomData.sockets.forEach((soc) => {
                    if (soc.userId == myId) {
                        console.log('111');
                        socket.to(soc.socketId).emit('chat_history', { id: chat.room, chatHistory: updatedMyCH });
                    } else {
                        console.log('222');
                        socket.to(soc.socketId).emit('chat_history', { id: friendRoom, chatHistory: updatedFriendsCH });
                    }
                });

                // Save new chat history
                await saveChatHistory(chat.room, chat.history);
                await saveChatHistory(friendRoom, updatedFriendsCH);
                return;
            }

            // DELETE for me
            chatRoomData.sockets.forEach((soc) => {
                if (soc.userId == myId) {
                    console.log('333');
                    socket.to(soc.socketId).emit('chat_history', { id: chat.room, chatHistory: chat.history });
                }
            });
            await saveChatHistory(chat.room, chat.history);
        });

        socket.on('join_room', async (data) => {
            // Get chat rooms
            const chatRooms = getChatRooms();

            const { roomName, userData } = data;
            const { valid, myId } = validateToken(userData.token, roomName, io);
            if (!valid) return;
            const friendId = roomName.split('-')[1];

            if (usersRooms[friendId]) {
                const roomExist = usersRooms[friendId].find((room) => room.friendId === myId.toString());
                const friendRoom = `${friendId}-${myId}`;
                if (roomExist) {
                    console.log('1.1: User joins friendRoom.');
                    socket.join(friendRoom);
                    roomExist.sockets.push({ userId: myId, socketId: socket.id });
                    // Update friends sockets array with my socket !
                    usersRooms[friendId] = usersRooms[friendId].reduce((acc, room) => {
                        room.name === friendRoom ? acc.push(roomExist) : acc.push(room);
                        return acc;
                    }, []);
                    const myChatHistory = await getChatHistory(`${myId}-${friendId}`);
                    if (myChatHistory) {
                        console.log('1.1.1: And gets myChatHistory');
                        socket.emit('chat_history', myChatHistory);
                        return;
                    }
                    console.log('1.1.2: And gets friendChatHistory');
                    const myRoom = `${myId}-${friendId}`;
                    const friendChatHistory = await getChatHistory(friendRoom);
                    const welcomeMsg = await generateWelcomeMsg(friendId, myId, myRoom);
                    const newChatHistory = { ...friendChatHistory, id: myRoom };
                    newChatHistory.chatHistory.unshift(welcomeMsg);
                    // Retrieve chat history
                    socket.emit('chat_history', newChatHistory);
                    await saveChatHistory(myRoom, newChatHistory.chatHistory);
                    return;
                }
            }

            const chatHistory = await getChatHistory(roomName);

            /**
             * @CHAT_ROOM_EXISTS
             * and I have created it => roomName = `${myId}-${friendId}`
             */

            if (chatRooms[roomName]) {
                const chatUser = findChatByUserId(roomName, myId);
                // User already in the room, we will simply return,
                // mby remove this logic after putting permission on frontend
                if (chatUser) {
                    console.log(`2: User in chatRoom: ${roomName} => joining with new socketId: ${socket.id}`);
                    // Add new socket to chat room user sockets array
                    addSocketToChatUser(roomName, myId, socket.id);
                    console.log('chatRooms', getChatRooms()[roomName]);
                    socket.emit('chat_history', chatHistory);
                    return;
                }
                console.log(`3: User with "${myId}" ID, joins the room: ${roomName}`);
                socket.join(roomName);
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
                const chatUser = findChatByUserId(roomName, myId);
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
             * roomName = `${friendId}-${myId}`
             */

            const myId = roomName.split('-').map((v) => parseInt(v, 10))[1];
            const chatUser = findChatByUserId(roomName, myId);
            // I am logged in room with multiple sockets => delete just current socket
            if (chatUser.sockets.length > 1) {
                deleteSocketFromChatUser(roomName, myId, socket.id);
            } else {
                // I am logged in room with just this socket => delete my chatUser data from chat room
                deleteChatUser(roomName, myId);
            }
            await saveChatHistory(roomName, history);
            console.log('chatRooms', getChatRooms()[roomName]);
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
