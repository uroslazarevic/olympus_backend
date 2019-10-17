// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Videos', [
            {
                id: 1,
                viewableId: 1,
                viewable: 'latestVideo',
                videoCode: 'tAGnKpE4NCI',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                viewableId: 1,
                viewable: 'post',
                videoCode: 'tAGnKpE4NCI',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Videos', null, {});
    },
};
