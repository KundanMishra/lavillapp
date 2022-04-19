const sequelizePaginate = require('sequelize-paginate')
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.DOUBLE(10,0),
            allowNull: false,
            unique:true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique:true
        },
        image:{
            type: DataTypes.STRING,
            allowNull: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        permissionLevel: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        availablePoint: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue:0
        },
        status:{
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        otp:{
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: DataTypes.DATE,
    });
    sequelizePaginate.paginate(User);
    return User;
};