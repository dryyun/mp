const CronJob = require('cron').CronJob;
const moment = require('moment');
const sequelize = require('sequelize');

const WeixinAction = require('./lib/WeixinAction');
const models = require('./models');
const MetaModel = models.MetaModel;
const UserModel = models.UserModel;
const NoticeModel = models.NoticeModel;

const status = require('./config/status.json');

// 每隔一小时获取 access_token
(new CronJob('0 0 */1 * * *', async function () {

    const AT = require('./lib/AccessToken');

    try {
        let at = new AT();
        let token = await at.getToken();

        let expire = moment().format('X') - 0 + 3600; // 一小时刷新一次

        await AT.setAccessToken(token, expire);

        console.log('save access token success = ' + token);

    } catch (err) {
        console.log(err);
    }

}, null, true, 'PRC')).start();

// 每隔一小时重置 answer_mode
(new CronJob('0 0 */1 * * *', async function () {

    const Op = sequelize.Op;

    let time = moment.unix(moment().format('X') - 3600).format('YYYY-MM-D H:m:s')

    MetaModel
        .findAll({
            where: {
                key: 'answer_mode',
                value: 'robot_answer',
                updatedAt: {
                    [Op.lte]: time
                }
            }
        })
        .then(list => {
            return Promise.all(list.map(item => {
                    item.value = 'normal_answer';
                    return item.save();
                })
            );
        })
        .then(res => {
            console.log(res.length);
        })
        .catch(err => {
            console.log(err)
        })

}, null, true, 'PRC')).start();

// 每隔一小时尝试获取 status = 11 的 user 信息
(new CronJob('0 30 */1 * * *', function () {

    let wxAction = new WeixinAction();

    UserModel
        .findAll({
            where: {
                'status': status.user.pending,
            }
        })
        .then(list => {

            return Promise.all(list.map(item => {
                    return wxAction.getUserInfo(item.openid)
                        .then(userInfo => {
                            UserModel.saveUserByApiData(item.openid, userInfo)
                        })

                })
            );
        })
        .then(res => {
            console.log(res.length)
        })
        .catch(err => {
            console.log(err)
        })

}, null, true, 'PRC')).start();


// 每隔 5 分钟发送周期性通知
(new CronJob('0 */5 * * * *', async function () {

    let list = await NoticeModel.listByRepeat('day');

    let pas = [];
    list.forEach((item) => {
        [alertTimeStamp, noticeTime] = NoticeModel.calAlertTime(item.notice_time, item.alert_time_options, item.repeat_frequency)

        let now = moment().format('X');
        if (now >= alertTimeStamp && now <= alertTimeStamp + 300) {
            pas.push(NoticeModel.generateSendPromise(item, noticeTime))
        }
    })

    Promise.all(pas)
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
        })

}, null, true, 'PRC')).start();

// 每隔 5 分钟发送一次性通知
(new CronJob('0 */5 * * * *', async function () {

    let list = await NoticeModel.listByRepeat('never');

    let pas = [];
    list.forEach((item) => {
        [alertTimeStamp, noticeTime] = NoticeModel.calAlertTime(item.notice_time, item.alert_time_options, item.repeat_frequency)

        let now = moment().format('X');
        if (now >= alertTimeStamp && now <= alertTimeStamp + 300) {
            pas.push(NoticeModel.generateSendPromise(item, noticeTime))
        }
    })

    Promise.all(pas)
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
        })


}, null, true, 'PRC')).start();
