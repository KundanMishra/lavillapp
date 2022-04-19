const sequelizePaginate = require('sequelize-paginate')
module.exports = (sequelize, DataTypes) => {
    const Property = sequelize.define('property', {
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
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        descriptionAr: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        bedroomNo: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        bathroomNo: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        plotArea: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        carParking: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        furnished: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        phone: {
            type: DataTypes.DECIMAL(10,0),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        addressAr: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        lat: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        lng: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        featured: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    sequelizePaginate.paginate(Property);
    return Property;
};