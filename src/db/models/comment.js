export default (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        commentableId: { type: DataTypes.INTEGER, allowNull: false },
        // authorPost, sharedPost, userPhoto, tweetPhoto, blogPhoto, latestVideo
        commentable: { type: DataTypes.STRING, allowNull: false },
        list: { type: DataTypes.JSON, allowNull: false },
    });

    Comment.associate = (models) => {
        // Write association in associated models
        Comment.hasOne(models.Comment, {
            as: 'replies',
            foreignKey: 'commentableId',
            constraints: false,
            scope: {
                commentable: 'post-comment-reply',
            },
        });
        Comment.hasOne(models.Like, {
            as: 'likes',
            foreignKey: 'likeableId',
            constraints: false,
            scope: {
                likeable: 'post-comment-like',
            },
        });
    };

    return Comment;
};
