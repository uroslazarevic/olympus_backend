// ('use strict');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert('BioFacts', [
            {
                id: 1,
                userId: 1,
                topic: 'Topic 1',
                content: 'BioFact Content 1',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('BioFacts', null, {});
    },
};
