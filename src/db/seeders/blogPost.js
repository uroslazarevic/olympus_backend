// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('BlogPosts', [
            {
                id: 1,
                userId: 1,
                topic: 'Blog Topic 1',
                text: 'Blog Text 1',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('BlogPosts', null, {});
    },
};
