'use strict';
module.exports = (sequelize, DataTypes) => {
  const favorite = sequelize.define('favorite', {
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    url: DataTypes.STRING,
    eventid: DataTypes.STRING,
    notes: DataTypes.STRING,
    img: DataTypes.STRING
  }, {});
  favorite.associate = function(models) {

    models.favorite.belongsTo( models.user );
  };
  return favorite;
};