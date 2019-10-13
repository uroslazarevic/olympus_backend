// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('SharedPosts', [
            {
                id: 1,
                userId: 1,
                postId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('SharedPosts', null, {});
    },
};
