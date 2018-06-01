const status = require('../config/status.json')

module.exports = (sequelize, DataTypes) => {
    let NoticeList = sequelize.define('notice_list', {

        notice_id: {type: DataTypes.INTEGER, unique: 'notice'},
        notice_time: {type: DataTypes.DATE, unique: 'notice'},

        status: DataTypes.TINYINT,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        tableName: 'notice_list',
    });

    NoticeList.noticeConfirm = async function (id) {
        NoticeList.findOne({
            where: {
                id
            }
        }).then(notice_list => {
            if (notice_list) {
                notice_list.status = status.notice_list.confirmed;
                return notice_list.save();
            }
        })
    }


    return NoticeList;
}