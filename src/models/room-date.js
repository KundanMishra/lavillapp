module.exports = (sequelize, DataTypes) => {
    const RoomDate = sequelize.define('room_date', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        date:{
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        BBAOne: {
            type: DataTypes.FLOAT,
            allowNull: true
        }, 
        BBATwo: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        ROAOne: {
            type: DataTypes.FLOAT,
            allowNull: false
        }, 
        ROATwo: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        bookedCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    return RoomDate;
};