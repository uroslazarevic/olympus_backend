// 'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('ProfileSettings', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            userId: { type: Sequelize.INTEGER, allowNull: false },
            name: { type: Sequelize.STRING, allowNull: false },
            avatar: { type: Sequelize.TEXT, allowNull: false },
            pseudonym: { type: Sequelize.STRING, allowNull: false },
            city: { type: Sequelize.STRING, allowNull: false },
            country: { type: Sequelize.STRING, allowNull: false },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE },
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('ProfileSettings');
    },
};
// ProfileSetting.belongsTo(User)
