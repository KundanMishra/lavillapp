const sequelizePaginate = require('sequelize-paginate')
module.exports = (sequelize, DataTypes) => {
    const Loyalty = sequelize.define('loyalty', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        minTotalBookingAmountPassLoyalty: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        oneQAREqualPoint: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        minTotalBookingAmountForUsing: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        minTotalBookingAmountToGetLoyalty: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    sequelizePaginate.paginate(Loyalty);
    return Loyalty;
};