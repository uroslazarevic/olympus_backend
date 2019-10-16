// 'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Posts', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            authorId: { type: Sequelize.INTEGER, allowNull: false },
            description: { type: Sequelize.STRING, allowNull: false },
            type: { type: Sequelize.STRING, allowNull: false }, // video, image, text
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE },
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('Posts');
    },
};

// Post.hasOne(Video) as videoLink
// Post.hasOne(Photo) as imageLink

// Post.hasMany(Like)
// Post.hasMany(Comment)
// Post.hasMany(Share)

// Post.belongsToMany(User) through SharedPost
