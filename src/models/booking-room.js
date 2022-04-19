const sequelizePaginate = require('sequelize-paginate')
module.exports = (sequelize, DataTypes) => {
    const BookingRoom = sequelize.define('booking_room', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        BBATwoCount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        BBAOneCount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        ROAOneCount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        ROATwoCount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        BBATwoPrice: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        BBAOnePrice: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        ROAOnePrice: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        ROATwoPrice: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    sequelizePaginate.paginate(BookingRoom);
    return BookingRoom;
};