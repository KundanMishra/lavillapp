const sequelizePaginate = require('sequelize-paginate');
module.exports = (sequelize, DataTypes) => {
    const Room = sequelize.define('room', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        }, 
        descriptionAr: {
            type: DataTypes.TEXT,
            allowNull: true
        }, 
        adultCount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        childCount: {
            type: DataTypes.INTEGER,
            allowNull: false
        }, 
        BBAOnePercent: {
            type: DataTypes.INTEGER,
            allowNull: false
        }, 
        BBATwoPercent: {
            type: DataTypes.INTEGER,
            allowNull: false
        }, 
        ROATwoPercent: {
            type: DataTypes.INTEGER,
            allowNull: false
        }, 
        count: {
            type: DataTypes.INTEGER,
            allowNull: true
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
    sequelizePaginate.paginate(Room);
    return Room;
};