export default (sequelize, DataTypes) => {
    const Suggestion = sequelize.define('suggestion', {
        text: DataTypes.STRING,
    });

    Suggestion.associate = () => {};

    return Suggestion;
};
