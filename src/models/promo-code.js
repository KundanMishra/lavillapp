const sequelizePaginate = require('sequelize-paginate')
module.exports = (sequelize, DataTypes) => {
    const PromoCode = sequelize.define('promo_code', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique:true
        },
        description:{
            type: DataTypes.TEXT+ ' CHARACTER SET utf8mb4 COLLATE utf8mb4_bin',
            allowNull: false
        },
        descriptionAr:{
            type: DataTypes.TEXT+ ' CHARACTER SET utf8mb4 COLLATE utf8mb4_bin',
            allowNull: true
        },
        discountPercent: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        global: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        expDate:{
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        status:{
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    sequelizePaginate.paginate(PromoCode);
    return PromoCode;
};