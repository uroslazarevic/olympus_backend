import uuidv4 from 'uuid/v4';
import jwt from 'jsonwebtoken';
import models from '../models';

const onlineUsers = [];

const generateWelcomeMsg = async (friendId, room) => {
    const userFriend = await models.User.findOne({ where: { id: friendId }, raw: true });
    return {
        text: `Welcome to live chat with ${userFriend.username}!`,
        from: 'admin',
        date: Date.now(),
        id: uuidv4(),
        room,
    };
};

const createChatHistory = (id, chatHistory) => models.ChatHistory.create({ id, chatHistory });

const getChatHistory = async (room) => {
    const chatHistory = await models.ChatHistory.findOne({
        where: { id: room },
        attributes: ['id', 'chatHistory'],
        raw: true,
    });
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

const countActiveUsers = async (userId) => {
    const botsCount = 9;
    const registeredUsers = await models.User.count();
    const realUsers = registeredUsers - botsCount;
    const found = onlineUsers.find((id) => id === userId);
    console.log('onlineUsers', onlineUsers, userId);
    if (!found) {
        onlineUsers.push(userId);
    }
    return `${onlineUsers.length}/${realUsers}`;
};

export {
    generateWelcomeMsg,
    createChatHistory,
    getChatHistory,
    updateChatHistory,
    saveChatHistory,
    validateToken,
    isValid,
    countActiveUsers,
};
