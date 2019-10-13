// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Likes', [
            {
                id: 1,
                likeableId: 1,
                likeable: 'authorPost',
                userIds: '[2]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Likes', null, {});
    },
};
