// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('Tweets', [
            {
                id: 1,
                userId: 1,
                text: 'Energetic Meal',
                tags: '["yummy", "light"]',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Tweets', null, {});
    },
};
