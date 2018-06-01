const config = require('config');
const WeixinAction = require('../lib/WeixinAction');
const status = require('../config/status.json')
const models = require('../models')
const UserModel = models.UserModel;
const LocationModel = models.LocationModel;
const MetaModel = models.MetaModel;

module.exports = async function (message) {
    let event = message.Event;
    let openid = message.FromUserName;

    switch (event) {
        case 'subscribe':
            return subscribeEvent(message);
            break;
        case 'unsubscribe':
            return unsubscribeEvent(message);
            break;
        case 'LOCATION':
            return locationEvent(message);
            break;
        case 'CLICK':
            let eventKey = message.EventKey
            switch (eventKey) {
                case 'clear_location':
                    return clearLocationClickEvent(message);
                    break;
                case 'robot_answer':
                case 'normal_answer':
                    return changeAnswerModeClickEvent(message);
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }

}

async function subscribeEvent(message) {
    let openid = message.FromUserName;

    try {
        let weixinAction = new WeixinAction();
        let userInfo = await weixinAction.getUserInfo(openid)

        await UserModel.saveUserByApiData(openid, userInfo)

    } catch (err) {
        console.log(err)
    }

    return '感谢关注 /::D';
}

async function unsubscribeEvent(message) {
    return '伤心ing';
}

async function locationEvent(message) {
    let openid = message.FromUserName;
    try {
        let todayLocation = await LocationModel.getLocationToday(openid)
        if (todayLocation) {
            return null;
        }
    } catch (err) {
        console.log(err)
        return null;
    }

    let Amap = require('../lib/Amap.js');
    let amap = new Amap(config.get('amap.key'), config.get('amap.api'));

    let longitude = message.Longitude;
    let latitude = message.Latitude;
    let precision = message.Precision;

    let data = {
        openid,
        latitude,
        longitude,
        precision,
    };


    try {
        let location = await amap.geocodeRegeo(longitude, latitude);

        let county = location.regeocode.addressComponent.country
        let province = location.regeocode.addressComponent.province
        let city = location.regeocode.addressComponent.city
        let district = location.regeocode.addressComponent.district;

        data = Object.assign(data, {
            county: county,
            province: province,
            city: city,
            district: district,
            source: 'amap',
            original_data: JSON.stringify(location)
        });

        await LocationModel.addLocationToday(openid, data)

        let msgContent = '您今天的访问地址是：' + county + province + city + district + ' 。此位置信息，保留一天。如果位置更新，可以通过功能菜单清除地理位置，以便重新获取。'

        return msgContent;
    } catch (err) {

        return Promise.reject(err);
    }

}

async function clearLocationClickEvent(message) {
    let openid = message.FromUserName;

    await LocationModel.clearLocationToday(openid)

    return '地理位置信息已经清除，请退出会话重新进入';
}

async function changeAnswerModeClickEvent(message) {
    let openid = message.FromUserName;
    let eventKey = message.EventKey;

    await MetaModel.setMetaByKey(openid, 'answer_mode', eventKey)

    return '你已进入' + (eventKey === 'robot_answer' ? '机器人' : '普通') + '会话模式';
}
