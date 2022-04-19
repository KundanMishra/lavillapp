module.exports = (sequelize, DataTypes) => {
    const RoomAmenities = sequelize.define('room_amenities', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        }, 
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    return RoomAmenities;
};