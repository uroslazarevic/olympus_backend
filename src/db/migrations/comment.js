// 'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Comments', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            commentableId: { type: Sequelize.INTEGER, allowNull: false },
            // authorPost, sharedPost, userPhoto, tweetPhoto, blogPhoto, latestVideo
            commentable: { type: Sequelize.STRING, allowNull: false },
            list: { type: Sequelize.JSON, allowNull: false }, // "['{userId, comment}']""
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE },
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('Comments');
    },
};

// Comment.belongsToMany(Post)
