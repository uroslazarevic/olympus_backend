// 'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Videos', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            viewableId: { type: Sequelize.INTEGER, allowNull: false },
            viewable: { type: Sequelize.STRING, allowNull: false }, // latestVideo, post
            videoCode: { type: Sequelize.STRING, allowNull: false },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE },
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('Videos');
    },
};

// Video.belongsTo(LatestVideo)
// Video.belongsTo(Post)
