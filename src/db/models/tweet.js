export default (sequelize, DataTypes) => {
    const Tweet = sequelize.define('Tweet', {
        text: { type: DataTypes.STRING, allowNull: false },
        tags: { type: DataTypes.JSON, allowNull: false },
    });

    Tweet.associate = (models) => {
        Tweet.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return Tweet;
};
