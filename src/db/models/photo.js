export default (sequelize, DataTypes) => {
    const Photo = sequelize.define('Photo', {
        photoableId: { type: DataTypes.INTEGER, allowNull: false },
        photoable: { type: DataTypes.STRING, allowNull: false },
        base64: { type: DataTypes.TEXT, allowNull: false },
    });

    Photo.associate = () => {};

    return Photo;
};
