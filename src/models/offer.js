const sequelizePaginate = require('sequelize-paginate')
module.exports = (sequelize, DataTypes) => {
    const Offer = sequelize.define('offer', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        offerPercent:{
            type: DataTypes.INTEGER,
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
    sequelizePaginate.paginate(Offer);
    return Offer;
};