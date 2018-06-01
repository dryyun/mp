const moment = require('moment')
const config = require('config')

const status = require('../config/status.json')

const models = require('../models');
const NoticeListModel = models.NoticeListModel;

module.exports = (sequelize, DataTypes) => {
    let Notice = sequelize.define('notice', {
        openid: {type: DataTypes.STRING, allowNull: false},
        title: DataTypes.STRING,
        content: DataTypes.STRING,
        notice_time: {
            type: DataTypes.DATE,
            get() {
                return moment(this.getDataValue('notice_time')).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        repeat_frequency: {
            type: DataTypes.ENUM,
            values: ['day', 'week', 'month', 'year', 'never'],
            defaultValue: 'never'
        },
        repeat_end_options: {
            type: DataTypes.ENUM,
            values: ['never', 'after_date'],
            defaultValue: 'never'
        },
        repeat_end_setting: DataTypes.DATE,
        alert_time_options: {
            type: DataTypes.ENUM,
            values: ['five_minutes_before', 'thirty_minutes_before', 'one_day_before', 'two_days_before'],
            defaultValue: 'five_minutes_before'
        },
        alert_time: DataTypes.DATE,
        status: DataTypes.TINYINT,

        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        tableName: 'notice',
    });


    // 转换成秒数
    let alertTimeOptionsMap = {
        'five_minutes_before': 300,
        'thirty_minutes_before': 1800,
        'one_day_before': 86400,
        'two_days_before': 172800,
    }

    /**
     * 根据 repeat 频率查找
     * @param repeat
     * @param options
     */
    Notice.listByRepeat = function (repeat, options) {
        let where = {
            repeat_frequency: repeat,
            status: status.notice.available,
        };

        where = Object.assign(where, options)
        return Notice.findAll({
            where
        })
    }


    Notice.listByOpenId = async function (openid) {
        try {
            let where = {
                openid: openid,
                status: status.notice.available,
            };

            console.log(where)

            let list = await Notice.findAll({
                where
            })

            return list;
        } catch (err) {
            return [];
        }
    }

    /**
     *
     * 计算出提醒时间
     * @param noticeTime 提醒时间
     * @param alertTimeOption 提前时间
     * @param repeatFrequency 提醒频率
     * @returns {[null,null]} 返回 alert 时间戳  和 notice 时间
     */
    Notice.calAlertTime = function (noticeTime, alertTimeOption, repeatFrequency) {

        let day = '';
        let hour = moment(noticeTime).format('HH:mm:ss');// 提醒的时分秒
        if (repeatFrequency === 'never') {
            day = moment(noticeTime).format('YYYY-MM-D');
        } else if (repeatFrequency === 'day') {
            day = moment().format('YYYY-MM-D');
        }

        noticeTime = `${day} ${hour}`;

        let noticeTimeStamp = moment(noticeTime).format('X')

        let alertTimeStamp = noticeTimeStamp - alertTimeOptionsMap[alertTimeOption];

        return [alertTimeStamp, noticeTime];
    }


    Notice.generateSendPromise = function (notice, noticeTime) {

        let templateId = 'W2-SNySrzfylFOImHRxmwm1lz9ux6KhjsSlB59yLXYI';
        const WeixinAction = require('../lib/WeixinAction');

        return new Promise((resolve, reject) => {
            let wxAction = new WeixinAction();

            NoticeListModel.findOrCreate({
                where: {notice_id: notice.id, notice_time: noticeTime},
                defaults: {notice_id: notice.id, notice_time: noticeTime},
            })
                .spread((noticeList, created) => {
                    if (created) {

                        let url = config.get('server.url') + '/notice/' + noticeList.id + '/confirm';

                        return wxAction.templateSend(notice.openid, templateId, url, null, {
                            'first': {
                                value: '你有新的待办事项',
                            },
                            'keyword1': {
                                value: notice.title,
                            },
                            'keyword2': {
                                value: '待确认，可点击详情确认',
                            },
                            'keyword3': {
                                value: noticeTime,
                            },
                            'remark': {
                                value: notice.content
                            }
                        });
                    } else {
                        return Promise.resolve('finish');
                    }
                })
                .then(res => {
                    let day = moment(noticeTime).format('YYYY-MM-D');

                    if (notice.repeat_frequency === 'never') { // 一次性消息
                        notice.status = status.notice.overdue;
                        return notice.save();
                    } else if (notice.repeat_end_options === 'after_date' && notice.repeat_end_setting === day) {
                        notice.status = status.notice.overdue;
                        return notice.save();
                    } else {
                        return resolve(res);
                    }
                })
                .catch(err => {
                    return resolve(err)
                })
        })
    }

    Notice.addNotice = async function (openid, reqBody) {
        try {
            let data = {
                openid,
                title: reqBody.title,
                content: reqBody.content,
                notice_time: reqBody.datepicker,
                repeat_frequency: reqBody.repeatSet,
                repeat_end_options: reqBody.repeatSet === 'never' ? 'never' : reqBody.repeatEndSet,
                repeat_end_setting: reqBody.repeatEndSet === 'never' || reqBody.repeatSet === 'never' ? null : reqBody.alertpicker,
                alert_time_options: reqBody.alertSet
            }

            let notice = await Notice.create(data);
            return notice;
        } catch (err) {
            return Promise.reject(err);
        }
    }

    return Notice;

}