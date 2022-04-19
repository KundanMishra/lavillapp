module.exports = (sequelize, DataTypes) => {
    const BedType = sequelize.define('country', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        nameAr: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        alpha: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        code: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    return BedType;
};