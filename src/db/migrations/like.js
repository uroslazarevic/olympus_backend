// 'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Likes', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            likeableId: { type: Sequelize.INTEGER, allowNull: false },
            // authorPost, sharedPost, userPhoto, tweetPhoto, blogPhoto, latestVideo
            likeable: { type: Sequelize.STRING, allowNull: false },
            userIds: { type: Sequelize.JSON, allowNull: false },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE },
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('Likes');
    },
};

// Like.belongsToMany(Post)
