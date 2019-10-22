export default (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            username: { type: DataTypes.STRING },
            email: { type: DataTypes.STRING, unique: true },
            isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
            password: DataTypes.STRING,
        },
        { onDelete: 'CASCADE' }
    );

    User.associate = (models) => {
        User.hasOne(models.ProfileSettings, { foreignKey: 'userId' });
        User.hasOne(models.FriendList, { as: 'friendList', foreignKey: 'userId' });
        User.hasOne(models.FriendshipRequest, { foreignKey: 'userId' });
        User.hasMany(models.BioFact, { foreignKey: 'userId' });
        User.hasMany(models.BlogPost, { foreignKey: 'userId' });
        User.hasMany(models.Tweet, { foreignKey: 'userId' });
        User.hasMany(models.LatestVideo, { foreignKey: 'userId' });
        User.hasMany(models.Post, { foreignKey: 'userId' });
        User.hasMany(models.SharedPost, { foreignKey: 'userId' });
        User.hasMany(models.Photo, {
            foreignKey: 'photoableId',
            constraints: false,
            scope: {
                photoable: 'user',
            },
        });
    };

    return User;
};
