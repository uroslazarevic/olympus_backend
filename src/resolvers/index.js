import bcrypt from 'bcrypt';
import { PubSub } from 'graphql-subscriptions';
import mkdirp from 'mkdirp';
import fs from 'fs';
import shortid from 'shortid';

import { UserInputError } from 'apollo-server';
// import { requiresAuth } from '../permissions';
import { refreshTokens, tryLogin } from '../auth/auth';

export const pubsub = new PubSub();

const UPLOAD_DIR = './uploads';
// Ensure upload directory exists.
mkdirp.sync(UPLOAD_DIR);

const storeFS = ({ stream, filename }) => {
    const id = shortid.generate();
    const path = `${UPLOAD_DIR}/${id}-${filename}`;
    return new Promise((resolve, reject) =>
        stream
            .on('error', (error) => {
                if (stream.truncated) {
                    // Delete the truncated file.
                    fs.unlinkSync(path);
                    reject(error);
                }
            })
            .pipe(fs.createWriteStream(path))
            .on('error', (error) => reject(error))
            .on('finish', () => resolve({ id, path }))
    );
};

const base64 = (file) => {
    // read binary data
    const bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return Buffer.from(bitmap).toString('base64');
};

const processUpload = async (file, id, models) => {
    const { createReadStream, filename } = await file;
    const stream = createReadStream();
    const { path } = await storeFS({ stream, filename });
    const base64Src = base64(path);
    fs.unlinkSync(path);
    await models.User.update({ avatar: base64Src }, { where: { id } });
    return { filename };
};

export default {
    Query: {
        allUsers: (parent, args, { models }) => models.User.findAll(),
        chatHistory: async (parent, { room }, { models }) =>
            models.ChatHistory.findAll({ where: { id: room }, raw: true }),
        me: (parent, { id }, { models }) => models.User.findOne({ where: { id } }),
    },
    Mutation: {
        register: async (parent, args, { models }) => {
            const user = args;
            user.password = await bcrypt.hash(user.password, 12);
            return models.User.create(user);
        },
        login: async (parent, { email, password }, { models }) => tryLogin(email, password, models),
        createChatHistory: async (parent, { room, history }, { models }) =>
            models.ChatHistory.create({ id: room, chatHistory: history }),
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
        fileUpload: async (parent, { file, id }, { models }) => processUpload(file, id, models),
        profileSettings: async (parent, args, { models }) => {
            const { id, name, pseudonym } = args;
            await models.User.update({ name, pseudonym }, { where: { id } });
            return true;
        },
    },
    Subscription: {
        userAdded: {
            subscribe: () => pubsub.asyncIterator(process.env.USER_ADDED),
        },
    },
};
