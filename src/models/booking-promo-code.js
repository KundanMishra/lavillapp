module.exports = (sequelize, DataTypes) => {
    const BookingPromoCode = sequelize.define('booking_promo_code', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        descriptionAr: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        discountPercent: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    return BookingPromoCode;
};