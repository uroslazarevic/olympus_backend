export default (sequelize, DataTypes) => {
    const Friend = sequelize.define('Friend', {
        friendIds: { type: DataTypes.JSON, allowNull: false },
    });

    Friend.associate = (models) => {
        Friend.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return Friend;
};
