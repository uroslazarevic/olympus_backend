export default (sequelize, DataTypes) => {
    const SharedPost = sequelize.define('SharedPost', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
        authorId: { type: DataTypes.INTEGER, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false },
    });

    SharedPost.associate = (models) => {
        SharedPost.belongsTo(models.User, { foreignKey: 'userId' });
        SharedPost.hasMany(models.Comment, {
            foreignKey: 'commentableId',
            constraints: false,
            scope: {
                commentable: 'sharedPost',
            },
        });
        SharedPost.hasMany(models.Like, {
            foreignKey: 'likeableId',
            constraints: false,
            scope: {
                likeable: 'sharedPost',
            },
        });
        SharedPost.hasMany(models.Share, {
            foreignKey: 'sharableId',
            constraints: false,
            scope: {
                sharable: 'sharedPost',
            },
        });
        SharedPost.hasOne(models.Video, {
            as: 'videoLink',
            foreignKey: 'viewableId',
            constraints: false,
            scope: {
                viewable: 'sharedPost',
            },
        });
        SharedPost.hasOne(models.Photo, {
            as: 'imageLink',
            foreignKey: 'photoableId',
            constraints: false,
            scope: {
                photoable: 'sharedPost',
            },
        });
    };

    return SharedPost;
};
