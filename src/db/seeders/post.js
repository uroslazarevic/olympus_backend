/* eslint-disable max-len */
// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Posts', [
            {
                id: 1,
                userId: 1,
                title: 'Post title 1',
                description: 'Post description 1',
                type: 'video',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                userId: 1,
                title: 'Post title 2',
                description: 'Post description 2',
                type: 'image',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 3,
                userId: 1,
                title: 'Post title 3',
                description: 'Post description 3',
                type: 'text',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Posts', null, {});
    },
};
