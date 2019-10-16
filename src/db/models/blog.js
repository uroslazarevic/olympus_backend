export default (sequelize, DataTypes) => {
    const Blog = sequelize.define('Blog', {
        topic: { type: DataTypes.STRING, allowNull: false },
        text: { type: DataTypes.STRING, allowNull: false },
    });

    Blog.associate = (models) => {
        Blog.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return Blog;
};
