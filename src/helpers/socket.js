import uuidv4 from 'uuid/v4';
import jwt from 'jsonwebtoken';
import models from '../db/models';

let chatRooms = {};
const onlineUsers = [];
const ONLINE_ROOM = 'ONLINE_ROOM';

const generateWelcomeMsg = async (friendId, myId, room) => {
    const userFriend = await models.ProfileSettings.findOne({ where: { userId: friendId }, raw: true });
    return {
        text: `Welcome to live chat with ${userFriend.name}!`,
        from: 'admin',
        date: Date.now(),
        id: uuidv4(),
        room,
        for: myId,
    };
};

const createChatHistory = (id, chatHistory) => models.ChatHistory.create({ id, chatHistory });

const getChatHistory = async (room) => {
    const chatHistory = await models.ChatHistory.findOne({
        where: { id: room },
        attributes: ['id', 'chatHistory'],
        raw: true,
    });
    console.log('chatHistory', chatHistory);
    return chatHistory;
};

const updateChatHistory = (room, chatHistory) => models.ChatHistory.update({ chatHistory }, { where: { id: room } });

const saveChatHistory = async (room, history) => {
    const oldChatHistory = await getChatHistory(room);
    if (!oldChatHistory) {
        return createChatHistory(room, history);
    }
    return updateChatHistory(room, history);
};

const isValid = (token) => jwt.verify(token, process.env.SECRET);

const validateToken = (token, roomName, io) => {
    const validationData = { valid: false, myId: null };
    try {
        const {
            user: { id },
        } = isValid(token);
        validationData.myId = id;
        validationData.valid = true;
    } catch (err) {
        io.to(roomName).emit('chat_room_error', 'Invalid token. Please reauthenticate.');
    }
    return validationData;
};

const findUsersRegistered = () => models.User.count();

const addActiveUser = async (userId, socketId) => {
    const botsCount = 1;
    const registeredUsers = await findUsersRegistered();
    const realUsers = registeredUsers - botsCount;
    const index = onlineUsers.findIndex((user) => user.userId === userId);
    if (index === -1) {
        const newUser = { userId, sockets: [socketId] };
        onlineUsers.push(newUser);
    } else {
        // Add new socket to same user
        onlineUsers[index].sockets.push(socketId);
    }
    return `${onlineUsers.length}/${realUsers}`;
};

const removeActiveUser = async (socketId) => {
    const botsCount = 1;
    const registeredUsers = await findUsersRegistered();
    const realUsers = registeredUsers - botsCount;
    const index = onlineUsers.findIndex((user) => {
        const foundSocketId = user.sockets.find((socId) => socId === socketId);
        if (foundSocketId) {
            return user;
        }

        return null;
    });

    const userToRemove = onlineUsers[index];
    if (userToRemove) {
        if (userToRemove.sockets.length > 1) {
            const socIndexToRemove = userToRemove.sockets.findIndex((socId) => socId === socketId);
            userToRemove.sockets.splice(socIndexToRemove, 1);
            onlineUsers[index] = userToRemove;
        } else {
            onlineUsers.splice(index, 1);
        }
    }

    return `${onlineUsers.length}/${realUsers}`;
};

const findChatUserById = (roomName, id) => chatRooms[roomName].find((user) => user.id === id);

const getChatRooms = () => chatRooms;

const createChatRoom = (roomName, chatRoom) => {
    chatRooms = { ...chatRooms, [roomName]: chatRoom };
};

const addSocketToChatUser = (roomName, id, socketId) => {
    const chatUser = findChatUserById(roomName, id);
    const updChatUser = { ...chatUser, sockets: [...chatUser.sockets, socketId] };
    const newChatUsers = [...chatRooms[roomName].filter((user) => user.id !== id), updChatUser];
    chatRooms[roomName] = newChatUsers;
};

const deleteSocketFromChatUser = (roomName, id, socketId) => {
    const chatUser = findChatUserById(roomName, id);
    const newChatUserSockets = chatUser.sockets.filter((socId) => socId !== socketId);
    const updChatUser = { ...chatUser, sockets: newChatUserSockets };
    const newChatUsers = [...chatRooms[roomName].filter((user) => user.id !== id), updChatUser];
    chatRooms[roomName] = newChatUsers;
};

const saveChatUser = (roomName, chatUser) => chatRooms[roomName].push(chatUser);

const deleteChatUser = (roomName, id) => {
    const newChatUsers = chatRooms[roomName].filter((user) => user.id !== id);
    chatRooms[roomName] = newChatUsers;
};

const findChatUsersByRoom = (roomName) => {
    const [myId, friendId] = roomName.split('-').map((v) => parseInt(v, 10));
    const friendRoom = `${friendId}-${myId}`;

    if (chatRooms[friendRoom]) {
        // Friend has created the room => find chat users there
        const myChatUser = findChatUserById(friendRoom, myId);
        const frChatUser = findChatUserById(friendRoom, friendId);
        return { myChatUser, frChatUser };
    }
    // I've created the room => find chat users there
    const myChatUser = findChatUserById(roomName, myId);
    const frChatUser = findChatUserById(roomName, friendId);
    return { myChatUser, frChatUser };
};

export {
    generateWelcomeMsg,
    createChatHistory,
    getChatHistory,
    saveChatHistory,
    validateToken,
    isValid,
    addActiveUser,
    removeActiveUser,
    ONLINE_ROOM,
    getChatRooms,
    createChatRoom,
    addSocketToChatUser,
    deleteSocketFromChatUser,
    findChatUserById,
    saveChatUser,
    deleteChatUser,
    findChatUsersByRoom,
};
