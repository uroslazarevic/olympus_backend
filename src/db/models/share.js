export default (sequelize, DataTypes) => {
    const Share = sequelize.define('Share', {
        sharableId: { type: DataTypes.INTEGER, allowNull: false },
        // authorPost, sharedPost, userPhoto, tweetPhoto, blogPhoto, latestVideo
        sharable: { type: DataTypes.STRING, allowNull: false },
        userIds: { type: DataTypes.JSON, allowNull: false },
    });

    Share.associate = () => {
        // Write association in associated models
    };

    return Share;
};
