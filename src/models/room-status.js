module.exports = (sequelize, DataTypes) => {
    const RoomStatus = sequelize.define('room_status', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        nameAr:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    return RoomStatus;
};