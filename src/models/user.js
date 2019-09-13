export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING, unique: true },
        isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
        password: DataTypes.STRING,
    });

    User.associate = () => {};

    return User;
};
