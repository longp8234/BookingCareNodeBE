'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Doctors_Infor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Doctors_Infor.belongsTo(models.User, { foreignKey: 'doctorId' })
      
      Doctors_Infor.belongsTo(models.Allcode, { foreignKey: 'priceId', targetKey: 'keyMap', as: 'priceTypeData' })
      Doctors_Infor.belongsTo(models.Allcode, { foreignKey: 'paymentId', targetKey: 'keyMap', as: 'paymentTypeData' })
      Doctors_Infor.belongsTo(models.Allcode, { foreignKey: 'provinceId', targetKey: 'keyMap', as: 'provinceTypeData' })

    }
  };
  Doctors_Infor.init({
    doctorId: DataTypes.INTEGER,
    specialtyId: DataTypes.INTEGER,
    clinicId: DataTypes.INTEGER,
    priceId: DataTypes.STRING,
    provinceId: DataTypes.STRING,
    paymentId: DataTypes.STRING,
    addressClinic: DataTypes.STRING,
    nameClinic: DataTypes.STRING,
    note: DataTypes.STRING,
    count: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Doctors_Infor',
    freezeTableName: true
  });
  return Doctors_Infor;
};