import bcrypt from 'bcrypt';
import { PubSub } from 'graphql-subscriptions';

import { UserInputError } from 'apollo-server';
// import { requiresAuth } from '../permissions';
import { refreshTokens, tryLogin } from '../auth/auth';

export const pubsub = new PubSub();

export default {
    Query: {
        allUsers: (parent, args, { models }) => models.User.findAll(),
        chatHistory: async (parent, { room }, { models }) =>
            models.ChatHistory.findAll({ where: { id: room }, raw: true }),
        me: (parent, args, { models, user }) => {
            console.log('user', user);
            if (user) {
                return models.User.findOne({ where: { id: user.id } });
            }
            return null;
        },
    },
    Mutation: {
        register: async (parent, args, { models }) => {
            const user = args;
            user.password = await bcrypt.hash(user.password, 12);
            return models.User.create(user);
        },
        login: async (parent, { email, password }, { models }) => tryLogin(email, password, models),
        createChatHistory: async (parent, { room, history }, { models }) => {
            return models.ChatHistory.create({ id: room, chatHistory: history });
        },
        createUser: async (parent, args, { models }) => {
            const user = args;
            user.password = 'dummypass';
            const userAdded = await models.User.create(user);
            pubsub.publish(process.env.USER_ADDED, {
                userAdded,
            });
            return userAdded;
        },
        refreshTokens: (parent, { token, refreshToken }, { models }) => refreshTokens(token, refreshToken, models),
        userInputError: (parent, args) => {
            if (args.input !== 'expected') {
                throw new UserInputError('Form Arguments invalid', {
                    invalidArgs: Object.keys(args),
                });
            }
        },
    },
    Subscription: {
        userAdded: {
            subscribe: () => pubsub.asyncIterator(process.env.USER_ADDED),
        },
    },
};
