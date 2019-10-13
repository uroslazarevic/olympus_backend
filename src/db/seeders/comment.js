// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Comments', [
            {
                id: 1,
                commentableId: 1,
                commentable: 'authorPost',
                userIds: '[2]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Comments', null, {});
    },
};
