// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Comments', [
            {
                id: 1,
                commentableId: 1,
                commentable: 'post',
                userIds: '[2]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                commentableId: 2,
                commentable: 'post',
                userIds: '[2]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 3,
                commentableId: 3,
                commentable: 'post',
                userIds: '[]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Comments', null, {});
    },
};
