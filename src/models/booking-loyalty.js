module.exports = (sequelize, DataTypes) => {
    const BookingLoyalty = sequelize.define('booking_loyalty', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        usedPoint: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        loyaltyValue: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    return BookingLoyalty;
};
