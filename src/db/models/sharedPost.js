export default (sequelize, DataTypes) => {
    const SharedPost = sequelize.define('SharedPost', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    });

    SharedPost.associate = (models) => {
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
        // SharedPost.hasOne(models.Video, {
        //     foreignKey: 'viewableId',
        //     constraints: false,
        //     scope: {
        //         viewable: 'sharedPost',
        //     },
        // });
        // SharedPost.hasOne(models.Photo, {
        //     foreignKey: 'photoableId',
        //     constraints: false,
        //     scope: {
        //         photoable: 'sharedPost',
        //     },
        // });
    };

    return SharedPost;
};
