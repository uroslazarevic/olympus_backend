// 'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('ProfileSettings', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            userId: { type: Sequelize.INTEGER, allowNull: false },
            name: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
            avatar: { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
            pseudonym: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
            city: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
            country: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE },
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('ProfileSettings');
    },
};
// ProfileSetting.belongsTo(User)
