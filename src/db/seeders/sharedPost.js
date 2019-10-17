// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('SharedPosts', [
            {
                id: 1,
                authorId: 1,
                title: 'Post title 1',
                description: 'Post description 1',
                type: 'video',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('SharedPosts', null, {});
    },
};
