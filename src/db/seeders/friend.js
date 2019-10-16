// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Friends', [
            {
                id: 1,
                userId: 1,
                friendIds: '[2]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Friends', null, {});
    },
};