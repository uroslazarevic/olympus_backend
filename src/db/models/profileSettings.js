export default (sequelize, DataTypes) => {
    const ProfileSettings = sequelize.define('ProfileSettings', {
        name: { type: DataTypes.STRING, allowNull: false },
        avatar: { type: DataTypes.TEXT, allowNull: false },
        pseudonym: { type: DataTypes.STRING, allowNull: false },
        city: { type: DataTypes.STRING, allowNull: false },
        country: { type: DataTypes.STRING, allowNull: false },
    });

    ProfileSettings.associate = (models) => {
        ProfileSettings.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return ProfileSettings;
};
