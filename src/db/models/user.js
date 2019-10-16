export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        username: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING, unique: true },
        isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
        password: DataTypes.STRING,
    });

    User.associate = (models) => {
        User.hasOne(models.ProfileSettings, { foreignKey: 'userId' });
        User.hasMany(models.Friend, { foreignKey: 'userId' });
        User.hasMany(models.FriendshipRequest, { foreignKey: 'userId' });
        User.hasMany(models.BioFact, { foreignKey: 'userId' });
        User.hasMany(models.BlogPost, { foreignKey: 'userId' });
        User.hasMany(models.Tweet, { foreignKey: 'userId' });
        User.hasMany(models.LatestVideo, { foreignKey: 'userId' });
        User.belongsToMany(models.Post, { through: models.SharedPost });
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
