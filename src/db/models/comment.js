export default (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        commentableId: { type: DataTypes.INTEGER, allowNull: false },
        // authorPost, sharedPost, userPhoto, tweetPhoto, blogPhoto, latestVideo
        commentable: { type: DataTypes.STRING, allowNull: false },
        userIds: { type: DataTypes.JSON, allowNull: false },
    });

    Comment.associate = () => {
        // Write association in associated models
    };

    return Comment;
};
