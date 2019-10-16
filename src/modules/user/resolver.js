import bcrypt from 'bcrypt';
import { PubSub } from 'graphql-subscriptions';
import { UserInputError } from 'apollo-server';

import { refreshTokens, tryLogin } from '../../auth/auth';
import { processUpload } from './service';

export const pubsub = new PubSub();

export const userResolver = {
    User: {
        // For nested queries purpose
        profileSettings: async ({ id }, args, { models }) =>
            models.ProfileSettings.findOne({ where: { userId: id }, raw: true }),
    },
    Query: {
        getProfileSettings: (parent, args, { models, user }) =>
            models.ProfileSettings.findOne({ where: { userId: user.id } }),
        allUsers: (parent, args, { models }) => models.User.findAll(),
    },
    Mutation: {
        register: async (parent, args, { models }) => {
            const user = args;

            user.password = await bcrypt.hash(user.password, 12);
            const existingUser = await models.User.findOne({
                where: { username: user.username, email: user.email },
                raw: true,
            });
            if (existingUser) {
                throw new Error('User already registered');
            }
            const newUser = await models.User.create(user);
            await newUser.createProfileSettings(newUser);
            return newUser;
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
        fileUpload: (parent, { file, id }, { models }) => processUpload(file, id, models),
        setProfileSettings: async (parent, { settings }, { models }) => {
            const { id, name, pseudonym, city, country } = settings;
            await models.ProfileSettings.update({ name, pseudonym, city, country }, { where: { userId: id } });
            return true;
        },
    },
    Subscription: {
        userAdded: {
            subscribe: () => pubsub.asyncIterator(process.env.USER_ADDED),
        },
    },
};
