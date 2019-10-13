// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('FriendshipRequests', [
            {
                id: 1,
                userId: 1,
                friendId: 2,
                status: 'accepted',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('FriendshipRequests', null, {});
    },
};
