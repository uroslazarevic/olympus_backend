import bcrypt from 'bcrypt';
import { PubSub } from 'graphql-subscriptions';
import { UserInputError } from 'apollo-server';

import { refreshTokens, tryLogin } from '../../auth/auth';

export const pubsub = new PubSub();

export const userResolver = {
    Query: {
        allUsers: (parent, args, { models }) => models.User.findAll(),
        me: (parent, { id }, { models }) => models.User.findOne({ where: { id } }),
    },
    Mutation: {
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
