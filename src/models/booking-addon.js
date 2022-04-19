module.exports = (sequelize, DataTypes) => {
    const BookingAddon = sequelize.define('booking_addon', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        count: {
            type: DataTypes.INTEGER,
            allowNull: false
        }, 
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    return BookingAddon;
};
