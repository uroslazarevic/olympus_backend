// 'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('FriendList', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            userId: { type: Sequelize.INTEGER, allowNull: false },
            friendIds: { type: Sequelize.JSON, allowNull: false },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE },
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('FriendList');
    },
};

// Friend.belongsTo(User)
