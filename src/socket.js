import socketIO from 'socket.io';
import {
    generateWelcomeMsg,
    getChatHistory,
    saveChatHistory,
    isValid,
    validateToken,
    countActiveUsers,
    locateChatRoom,
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
    const usersRooms = {};
    /* [
        {name:'1-1000', friendId:1000, sockets:[{ userId: 1, sockedId: A },{ userId: 1000, sockedId: B }]},
        {name:'1-1001', friendId:1001, sockets:[{ userId: 1, sockedId: A },{ userId: 1001, sockedId: C }]}
        ]
     myRooms
    */

    let myRooms = [];
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
            const { roomName, userData } = data;
            const { valid, myId } = validateToken(userData.token, roomName, io);
            if (!valid) return;
            const friendId = roomName.split('-')[1];
            const chatHistory = await getChatHistory(roomName);

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

            if (usersRooms[myId]) {
                const roomExist = usersRooms[myId].find((room) => room.name === roomName);
                // User already in join_room
                if (roomExist) {
                    console.log('2: User already registered room.');
                    // We join the room with different socketId - new tab
                    myRooms = myRooms.reduce((acc, room) => {
                        if (room.name === roomName) {
                            room.sockets.push({ userId: myId, socketId: socket.id });
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
                myRooms.push({ name: roomName, friendId, sockets: [{ userId: myId, socketId: socket.id }] });
                usersRooms[myId] = myRooms;
                socket.join(roomName);
                if (!chatHistory) {
                    // Send welcome message
                    const welcomeMsg = await generateWelcomeMsg(friendId, myId, roomName);
                    socket.emit('send_msg', await welcomeMsg);
                    await saveChatHistory(roomName, [welcomeMsg]);
                    return;
                }
                socket.emit('chat_history', chatHistory);
                return;
            }

            // Add chats to user
            myRooms.push({ name: roomName, friendId, sockets: [{ userId: myId, socketId: socket.id }] });
            usersRooms[myId] = myRooms;
            console.log('0: Create chat history');

            socket.join(roomName);
            // Retrieve chat history
            if (!chatHistory) {
                // Send welcome message
                const welcomeMsg = await generateWelcomeMsg(friendId, myId, roomName);
                socket.emit('send_msg', welcomeMsg);
                await saveChatHistory(roomName, [welcomeMsg]);
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
