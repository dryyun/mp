const status = require('../config/status.json')

module.exports = (sequelize, DataTypes) => {
    let User = sequelize.define('user', {
        openid: {type: DataTypes.STRING, allowNull: false},
        nickname: DataTypes.STRING,
        sex: DataTypes.TINYINT,
        country: DataTypes.STRING,
        province: DataTypes.STRING,
        city: DataTypes.STRING,

        original_data: DataTypes.TEXT,
        status: DataTypes.TINYINT,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        tableName: 'user',
    });

    User.saveUserByApiData = async function (openid, apiData, force = true) {

        let data = {};

        if (apiData) {
            data = {
                'openid': openid,
                'nickname': apiData.nickname,
                'sex': apiData.sex,
                'city': apiData.city,
                'country': apiData.country,
                'province': apiData.province,
                'status': status.user.available,
                'original_data': JSON.stringify(apiData)
            }
        } else {
            data = {
                'openid': openid,
                'status': status.user.pending,
            }
        }

        try {
            let user = await User.findOne({
                where: {
                    openid
                }
            })

            if (user && force) {

                for (let key of Object.keys(data)) {
                    user[key] = data[key];
                }

                await user.save();

            } else if (!user) {
                await User.create(data);
            }
        } catch (err) {
            console.log(err);
        }

        return data;
    }


    return User;
}