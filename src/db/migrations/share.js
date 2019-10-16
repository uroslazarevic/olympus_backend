// 'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Shared', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            sharableId: { type: Sequelize.INTEGER, allowNull: false },
            // authorPost, sharedPost, userPhoto, tweetPhoto, blogPhoto, latestVideo
            sharable: { type: Sequelize.STRING, allowNull: false },
            userIds: { type: Sequelize.JSON, allowNull: false },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE },
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('Shared');
    },
};

// Share.belongsToMany(Post)
