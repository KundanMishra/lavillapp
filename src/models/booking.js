const sequelizePaginate = require('sequelize-paginate')
module.exports = (sequelize, DataTypes) => {
    const Booking = sequelize.define('booking', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        displayID: {
            type: DataTypes.STRING,
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
        checkIn: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        checkOut: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        actualCheckOut: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        roomCount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        finalPrice: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        cardUpdateNeeded: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        cardUpdateDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        checkOutFinalPrice: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        cancellationAmount: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    sequelizePaginate.paginate(Booking);
    return Booking;
};