export default (sequelize, DataTypes) => {
    const LatestVideo = sequelize.define('LatestVideo', {
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
    });

    LatestVideo.associate = (models) => {
        LatestVideo.belongsTo(models.User, { foreignKey: 'userId' });
        LatestVideo.hasMany(models.Video, {
            foreignKey: 'viewableId',
            constraints: false,
            scope: {
                viewable: 'latestVideo',
            },
        });
    };

    return LatestVideo;
};
