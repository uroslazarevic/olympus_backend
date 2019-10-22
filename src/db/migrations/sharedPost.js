// 'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('SharedPosts', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            userId: { allowNull: false, type: Sequelize.INTEGER },
            authorId: { type: Sequelize.INTEGER, allowNull: false },
            title: { type: Sequelize.STRING, allowNull: false },
            description: { type: Sequelize.STRING, allowNull: false },
            type: { type: Sequelize.STRING, allowNull: false }, // video, image, text
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE },
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('SharedPosts');
    },
};

// Post.belongsToMany(User) through SharedPost
// User.belongsToMany(Post) through SharedPost
