module.exports = (sequelize, DataTypes) => {
    const PropertyAmenities = sequelize.define('property_amenities', {
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
    return PropertyAmenities;
};