// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Likes', [
            {
                id: 1,
                likeableId: 1,
                likeable: 'post',
                userIds: '[2, 1]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                likeableId: 2,
                likeable: 'post',
                userIds: '[1]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 3,
                likeableId: 3,
                likeable: 'post',
                userIds: '[]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Likes', null, {});
    },
};
