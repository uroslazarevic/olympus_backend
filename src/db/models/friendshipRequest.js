export default (sequelize, DataTypes) => {
    const FriendshipRequest = sequelize.define('FriendshipRequest', {
        friendId: { type: DataTypes.INTEGER, allowNull: false },
        status: { type: DataTypes.STRING, allowNull: false },
    });

    FriendshipRequest.associate = (models) => {
        FriendshipRequest.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return FriendshipRequest;
};
