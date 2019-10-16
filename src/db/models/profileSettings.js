export default (sequelize, DataTypes) => {
    const ProfileSettings = sequelize.define(
        'ProfileSettings',
        {
            name: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
            avatar: { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
            pseudonym: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
            city: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
            country: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
        },
        {
            name: {
                singular: 'ProfileSettings',
            },
        }
    );

    ProfileSettings.associate = (models) => {
        ProfileSettings.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return ProfileSettings;
};
