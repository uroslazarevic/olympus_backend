export default (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        authorId: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false },
    });

    Post.associate = (models) => {
        Post.belongsToMany(models.User, { through: models.SharedPost });
        Post.hasMany(models.Comment, {
            foreignKey: 'commentableId',
            constraints: false,
            scope: {
                commentable: 'authorPost',
            },
        });
        Post.hasMany(models.Like, {
            foreignKey: 'likeableId',
            constraints: false,
            scope: {
                likeable: 'authorPost',
            },
        });
        Post.hasMany(models.Share, {
            foreignKey: 'sharableId',
            constraints: false,
            scope: {
                sharable: 'authorPost',
            },
        });
        Post.hasOne(models.Video, {
            foreignKey: 'viewableId',
            constraints: false,
            scope: {
                viewable: 'post',
            },
        });
        Post.hasOne(models.Photo, {
            foreignKey: 'photoableId',
            constraints: false,
            scope: {
                photoable: 'post',
            },
        });
    };

    return Post;
};
