// 'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Photos', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            photoableId: { type: Sequelize.INTEGER, allowNull: false },
            // user and post, mby tweet...
            photoable: { type: Sequelize.STRING, allowNull: false }, // tweet, user, post
            base64: { type: Sequelize.TEXT, allowNull: false },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE },
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('Photos');
    },
};

// Photo.belongsTo(User)
// Photo.belongsTo(Tweet) as tweetPhoto // mby implement later
// Photo.belongsTo(Post) as imageLink
