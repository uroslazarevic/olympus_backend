// 'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('FriendshipRequests', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            userId: { type: Sequelize.INTEGER, allowNull: false },
            friendId: { type: Sequelize.STRING, allowNull: false },
            status: { type: Sequelize.STRING, allowNull: false }, // pending,accepted
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE },
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('FriendshipRequests');
    },
};

// FriendshipRequest.belongsTo(User)
