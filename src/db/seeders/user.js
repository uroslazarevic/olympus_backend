// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Users', [
            {
                id: 1,
                username: 'User1',
                password: 'user1',
                email: 'user1@gmail.com',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                username: 'User2',
                password: 'user2',
                email: 'user2@gmail.com',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Users', null, {});
    },
};
