export default (sequelize, DataTypes) => {
    const FriendList = sequelize.define(
        'FriendList',
        {
            friendIds: { type: DataTypes.JSON, allowNull: false },
        },
        {
            // I've created table with singular name, and I am commanding sequelize to follow that name
            freezeTableName: true,
        }
    );

    FriendList.associate = (models) => {
        FriendList.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return FriendList;
};
