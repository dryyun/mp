const moment = require('moment')
const status = require('../config/status.json')

module.exports = (sequelize, DataTypes) => {
    const Op = sequelize.Op;

    let Location = sequelize.define('location', {
        openid: DataTypes.STRING,
        latitude: DataTypes.STRING,
        longitude: DataTypes.STRING,
        precision: DataTypes.STRING,
        county: DataTypes.STRING,
        province: DataTypes.STRING,
        city: DataTypes.STRING,
        district: DataTypes.STRING,
        source: DataTypes.STRING,
        original_data: DataTypes.TEXT,
        status: DataTypes.TINYINT,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        tableName: 'location',
    });

    Location.addLocationToday = async function (openid, data) {

        try {
            let todayLocation = await Location.getLocationToday(openid)

            if (!todayLocation) {
                todayLocation = await Location.create(data);
            }
            return todayLocation;

        } catch (err) {
            return Promise.reject(err);
        }
    }

    Location.getLastLocation = function (openid) {
        return Location.findOne({
            where: {
                openid: openid,
                status: status.location.available,
            },
            order: [
                ['createdAt', 'DESC'],
            ]
        });
    }

    Location.getLocationToday = function (openid) {

        let todayStart = moment().format('YYYY-MM-D 00:00:00')
        let todayEnd = moment().format('YYYY-MM-D 23:59:59')

        return Location.findOne({
            where: {
                openid: openid,
                createdAt: {
                    [Op.gte]: todayStart,
                    [Op.lte]: todayEnd,
                },
                status: status.location.available,
            }
        });
    }

    Location.clearLocationToday = async function (openid) {
        try {
            let todayLocation = await Location.getLocationToday(openid)
            if (todayLocation) {
                todayLocation.status = status.location.deleted;
                todayLocation = await todayLocation.save();
            }

            return todayLocation;
        } catch (err) {
            console.log(err)
            return Promise.reject(err)
        }
    }

    return Location;
}

