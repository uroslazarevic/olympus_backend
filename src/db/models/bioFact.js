export default (sequelize, DataTypes) => {
    const BioFact = sequelize.define('BioFact', {
        topic: { type: DataTypes.STRING, allowNull: false },
        content: { type: DataTypes.STRING, allowNull: false },
    });

    BioFact.associate = (models) => {
        BioFact.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return BioFact;
};
