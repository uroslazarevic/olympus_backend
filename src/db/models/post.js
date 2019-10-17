export default (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false },
    });

    Post.associate = (models) => {
        Post.belongsTo(models.User, { foreignKey: 'userId' });
        Post.hasOne(models.Comment, {
            as: 'comments',
            foreignKey: 'commentableId',
            constraints: false,
            scope: {
                commentable: 'post',
            },
        });
        Post.hasOne(models.Like, {
            as: 'likes',
            foreignKey: 'likeableId',
            constraints: false,
            scope: {
                likeable: 'post',
            },
        });
        Post.hasOne(models.Share, {
            as: 'shares',
            foreignKey: 'sharableId',
            constraints: false,
            scope: {
                sharable: 'post',
            },
        });
        Post.hasOne(models.Video, {
            as: 'videoLink',
            foreignKey: 'viewableId',
            constraints: false,
            scope: {
                viewable: 'post',
            },
        });
        Post.hasOne(models.Photo, {
            as: 'imageLink',
            foreignKey: 'photoableId',
            constraints: false,
            scope: {
                photoable: 'post',
            },
        });
    };

    return Post;
};
