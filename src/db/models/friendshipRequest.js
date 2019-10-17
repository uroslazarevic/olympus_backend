export default (sequelize, DataTypes) => {
    const FriendshipRequest = sequelize.define('FriendshipRequest', {
        friendIds: { type: DataTypes.INTEGER, allowNull: false },
    });

    FriendshipRequest.associate = (models) => {
        FriendshipRequest.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return FriendshipRequest;
};
