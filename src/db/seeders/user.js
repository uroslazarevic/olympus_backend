// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Users', [
            {
                id: 1,
                username: 'User1',
                // password: 'user1',
                password: '$2b$12$EsAapCv7xRIxr9Dp8OhQ9uSC4G8YeGM0NPKROh8UeDDAzH4LRQ7B.',
                email: 'user1@gmail.com',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                username: 'User2',
                // password: 'user2',
                password: '$2b$12$uh846RrDZuijRtPEuL95bOuC7dfKT2Li3.XJzQvrDUMYydha/zWZa',
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
