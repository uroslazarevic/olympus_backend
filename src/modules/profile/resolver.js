import { processUpload } from './service';

export const profileResolver = {
    Query: {},
    Mutation: {
        fileUpload: async (parent, { file, id }, { models }) => processUpload(file, id, models),
        profileSettings: async (parent, { settings }, { models }) => {
            const { id, name, pseudonym, city, country } = settings;
            await models.User.update({ name, pseudonym, city, country }, { where: { id } });
            return true;
        },
    },
};
