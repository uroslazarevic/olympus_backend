export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING, unique: true },
        isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
        password: DataTypes.STRING,
        name: { type: DataTypes.STRING, defaultValue: '' },
        avatar: { type: DataTypes.TEXT, defaultValue: '' },
        pseudonym: { type: DataTypes.STRING, defaultValue: '' },
        city: { type: DataTypes.TEXT, defaultValue: '' },
        country: { type: DataTypes.STRING, defaultValue: '' },
    });

    User.associate = () => {};

    return User;
};
