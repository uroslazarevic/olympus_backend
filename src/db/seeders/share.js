// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Shares', [
            {
                id: 1,
                sharableId: 1,
                sharable: 'post',
                userIds: '[2]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                sharableId: 2,
                sharable: 'post',
                userIds: '[2]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 3,
                sharableId: 3,
                sharable: 'post',
                userIds: '[]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Shares', null, {});
    },
};
