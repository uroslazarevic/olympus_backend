export default (sequelize, DataTypes) => {
    const ChatHistory = sequelize.define('ChatHistory', {
        id: { type: DataTypes.STRING, primaryKey: true },
        chatHistory: { type: DataTypes.JSON, allowNull: false },
    });

    ChatHistory.associate = () => {};

    return ChatHistory;
};
