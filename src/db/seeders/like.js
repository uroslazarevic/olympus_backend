// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Likes', [
            // First post likes
            {
                id: 1,
                likeableId: 1,
                likeable: 'post',
                userIds: '[2,3,4,5,6,7,8]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // First post first comment likes
            {
                id: 2,
                likeableId: 1,
                likeable: 'post-comment-like',
                userIds: '[4,5,6,7]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // First post first comment-reply likes
            {
                id: 3,
                likeableId: 2,
                likeable: 'post-comment-like',
                userIds: '[4,5,6,7]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // First post second comment-reply likes
            {
                id: 4,
                likeableId: 3,
                likeable: 'post-comment-like',
                userIds: '[1]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 5,
                likeableId: 2,
                likeable: 'post',
                userIds: '[]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 6,
                likeableId: 3,
                likeable: 'post',
                userIds: '[]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Likes', null, {});
    },
};
