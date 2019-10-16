// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('LatestVideos', [
            {
                id: 1,
                userId: 1,
                title: 'YT Video Title 1',
                description: 'YT Video Description 1',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('LatestVideos', null, {});
    },
};
