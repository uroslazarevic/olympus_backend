// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Comments', [
            {
                id: 1,
                commentableId: 1,
                commentable: 'post',
                list: JSON.stringify([
                    {
                        id: 2,
                        comment:
                            'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Lorem ipsum, dolor sit amet consectetur adipisicing elit.',
                        createdAt: '1571753183337',
                    },
                ]),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                commentableId: 1,
                commentable: 'post-comment-reply',
                list: JSON.stringify([
                    {
                        id: 7,
                        comment:
                            'Now for manners use has company believe parlors. Least nor party who wrote while did. Excuse formed as is agreed admire so on result parish. Put use set uncommonly announcing and travelling. Allowance sweetness direction to as necessary. Principle oh explained excellent do my suspected conveying in. Excellent you did therefore perfectly supposing described. ',
                        createdAt: '1571753183337',
                    },
                    {
                        id: 8,
                        comment:
                            'Boy desirous families prepared gay reserved add ecstatic say. Replied joy age visitor nothing cottage. Mrs door paid led loud sure easy read. Hastily at perhaps as neither or ye fertile tedious visitor.',
                        createdAt: '1571753183337',
                    },
                ]),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 3,
                commentableId: 1,
                commentable: 'post-comment-reply',
                list: JSON.stringify([
                    {
                        id: 5,
                        comment:
                            'Lorem ipsum, consectetur adipisicing elit dolor sit amet consectetur adipisicing elit. Lorem ipsum, dolor sit amet consectetur adipisicing elit amet consectetur.',
                        createdAt: '1571753183337',
                    },
                ]),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 4,
                commentableId: 2,
                commentable: 'post',
                list: '[]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 5,
                commentableId: 3,
                commentable: 'post',
                list: JSON.stringify([
                    {
                        id: 2,
                        comment: 'Comment of post 3.',
                        createdAt: '1571753183337',
                    },
                ]),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Comments', null, {});
    },
};
