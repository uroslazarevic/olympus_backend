export const chatResolver = {
    Query: {
        chatHistory: async (parent, { room }, { models }) =>
            models.ChatHistory.findAll({ where: { id: room }, raw: true }),
    },
    Mutation: {
        createChatHistory: async (parent, { room, history }, { models }) =>
            models.ChatHistory.create({ id: room, chatHistory: history }),
    },
};
