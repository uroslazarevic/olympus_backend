export default (sequelize, DataTypes) => {
    const Like = sequelize.define('Like', {
        likeableId: { type: DataTypes.INTEGER, allowNull: false },
        // post, userPhoto, tweetPhoto, blogPhoto, latestVideo
        likeable: { type: DataTypes.STRING, allowNull: false },
        userIds: { type: DataTypes.JSON, allowNull: false },
    });

    Like.associate = () => {
        // Write association in associated models
    };

    return Like;
};
