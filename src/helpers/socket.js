import uuidv4 from 'uuid/v4';
import moment from 'moment';
import models from '../models';

const now = Date.now();

const generateMsg = (msgData) => {
    const {
        text,
        userData: { username },
        id,
    } = msgData;

    return {
        text: text.trim(),
        from: username,
        date: moment(now).format('h:mm a'),
        id,
    };
};

const generateWelcomeMsg = async (id) => {
    const userFriend = models.User.findOne({ where: { id }, raw: true });

    return {
        text: `Welcome to live chat with ${userFriend.username}!`,
        from: 'admin',
        date: moment(now).format('h:mm a'),
        id: uuidv4(),
    };
};

const createChatHistory = (room, chatHistory) => models.ChatHistory.create({ room, chatHistory });

const getChatHistory = async (room) => {
    console.log('room', room);
    const chatHistory = await models.ChatHistory.findAll({
        where: { id: room },
        attributes: ['id', 'chatHistory'],
        raw: true,
    });
    return chatHistory;
};

const saveChatHistory = (room, chatHistory) => models.ChatHistory.update({ chatHistory }, { where: { id: room } });

export { generateMsg, generateWelcomeMsg, createChatHistory, getChatHistory, saveChatHistory };
