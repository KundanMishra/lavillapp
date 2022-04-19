const sequelizePaginate = require('sequelize-paginate')
module.exports = (sequelize, DataTypes) => {
    const Amenities = sequelize.define('amenities', {
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
        iconName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        featured: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: 0
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    sequelizePaginate.paginate(Amenities);
    return Amenities;
};