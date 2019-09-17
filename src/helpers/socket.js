import uuidv4 from 'uuid/v4';
import moment from 'moment';
import models from '../models';

const now = Date.now();

const generateMsg = (msg, room) => ({
    from: msg.from,
    text: msg.text.trim(),
    room,
    date: moment(now).format('h:mm a'),
    id: uuidv4(),
});

const generateWelcomeMsg = async (friendId, room) => {
    const userFriend = await models.User.findOne({ where: { id: friendId }, raw: true });
    return {
        text: `Welcome to live chat with ${userFriend.username}!`,
        from: 'admin',
        date: moment(now).format('h:mm a'),
        id: uuidv4(),
        room,
    };
};

const createChatHistory = (id, chatHistory) => models.ChatHistory.create({ id, chatHistory });

const getChatHistory = async (room) => {
    const chatHistory = await models.ChatHistory.findAll({
        where: { id: room },
        attributes: ['id', 'chatHistory'],
        raw: true,
    });
    return chatHistory;
};

const updateChatHistory = (room, chatHistory) => {
    // console.log(room, chatHistory);
    models.ChatHistory.update({ chatHistory }, { where: { id: room } });
};

const saveChatHistory = async (room, history, oldChatHistory) => {
    if (oldChatHistory.length === 0) {
        return createChatHistory(room, history);
    }
    return updateChatHistory(room, history);
};

export { generateMsg, generateWelcomeMsg, createChatHistory, getChatHistory, updateChatHistory, saveChatHistory };
