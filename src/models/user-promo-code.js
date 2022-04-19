module.exports = (sequelize, DataTypes) => {
    const UserPromoCode = sequelize.define('user_promo_code', {
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
    return UserPromoCode;
};