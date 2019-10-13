// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Shared', [
            {
                id: 1,
                sharableId: 1,
                sharable: 'authorPost',
                userIds: '[2]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Shared', null, {});
    },
};
