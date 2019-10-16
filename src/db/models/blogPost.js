export default (sequelize, DataTypes) => {
    const BlogPost = sequelize.define('BlogPost', {
        topic: { type: DataTypes.STRING, allowNull: false },
        text: { type: DataTypes.STRING, allowNull: false },
    });

    BlogPost.associate = (models) => {
        BlogPost.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return BlogPost;
};
