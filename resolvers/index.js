import bcrypt from 'bcrypt';
import { PubSub } from 'graphql-subscriptions';

import { requiresAuth, requiresAdmin } from '../permissions';
import { refreshTokens, tryLogin } from '../auth/auth';

export const pubsub = new PubSub();

export default {
    User: {
        // Extact id from parent
        boards: ({ id }, args, { models }) => models.Board.findAll({ where: { owner: id } }),
        suggestions: ({ id }, args, { models }) => models.Suggestion.findAll({ where: { creatorId: id } }),
    },
    Board: {
        suggestions: ({ id }, args, { suggestionLoader }) => suggestionLoader.load(id),
    },
    Suggestion: {
        creatorUsername: async ({ creatorId }, args, { models }) => {
            const { username } = await models.User.findOne({ where: { id: creatorId } });
            return username;
        },
    },
    Query: {
        allUsers: requiresAuth.createResolver((parent, args, { models }) => models.User.findAll()),
        me: (parent, args, { models, user }) => {
            console.log('user', user);
            if (user) {
                return models.User.findOne({ where: { id: user.id } });
            }
            return null;
        },
        userBoards: (parent, { owner }, { models }) => models.Board.findAll({ where: { owner } }),
        userSuggestions: (parent, { creatorId }, { models }) => models.Suggestion.findAll({ where: { creatorId } }),
    },
    Mutation: {
        updateUser: (parent, { username, newUsername }, { models }) =>
            models.User.update({ username: newUsername }, { where: { username } }),
        deleteUser: (parent, args, { models }) => models.User.destroy({ where: args }),
        // Using permissions on createBoard => Now we cant create board if we are not
        createBoard: requiresAuth.createResolver((parent, args, { models }) => models.Board.create(args)),
        createSuggestion: requiresAdmin.createResolver((parent, args, { models }) => models.Suggestion.create(args)),
        register: async (parent, args, { models }) => {
            const user = args;
            user.password = await bcrypt.hash(user.password, 12);
            return models.User.create(user);
        },
        login: async (parent, { email, password }, { models }) => tryLogin(email, password, models),
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
    },
    Subscription: {
        userAdded: {
            subscribe: () => pubsub.asyncIterator(process.env.USER_ADDED),
        },
    },
};
