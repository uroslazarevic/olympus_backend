export default (sequelize, DataTypes) => {
    const Video = sequelize.define('Video', {
        viewableId: { type: DataTypes.INTEGER, allowNull: false },
        viewable: { type: DataTypes.STRING, allowNull: false },
        videoCode: { type: DataTypes.STRING, allowNull: false },
    });

    Video.associate = () => {};

    return Video;
};
