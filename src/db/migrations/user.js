// 'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            'Users',
            {
                id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
                username: { type: Sequelize.STRING, allowNull: false },
                email: { type: Sequelize.STRING, allowNull: false },
                password: { type: Sequelize.STRING, allowNull: false },
                isAdmin: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
                createdAt: { allowNull: false, type: Sequelize.DATE },
                updatedAt: { allowNull: false, type: Sequelize.DATE },
            },
            // Important bcs of error: "cannot drop table "Users" because other objects depend on it"
            { onDelete: 'CASCADE' }
        );
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('Users');
    },
};

// User.hasMany(ProfileSetting)
// User.hasMany(ProfileSetting)
// User.hasMany(ProfileSetting)
// User.hasMany(ProfileSetting)
// User.hasMany(ProfileSetting)
// User.hasMany(ProfileSetting)
