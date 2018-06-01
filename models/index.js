/**
 * 数据库表对应的 model 定义
 */

const Sequelize = require('sequelize');
const config = require('config')

const sequelize = new Sequelize(
    config.get('mysql.database'),
    config.get('mysql.user'),
    config.get('mysql.password'),
    {
        "host": config.get('mysql.host'),
        "port": config.get('mysql.port'),
        "logging": config.get('debug') ? console.log : false,
        "dialect": "mysql",
        "pool": {
            "max": 5,
            "min": 1,
            "acquire": 30000,
            "idle": 10000
        },
        timezone: '+08:00'
    }
);


// load models ，注意顺序，需要被其他 model 引用的 model 要放在前面
let models = [
    'LocationModel',
    'MetaModel',
    'UserModel',
    'NoticeListModel',
    'NoticeModel',
];

models.forEach(function (model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});

module.exports.sequelize = sequelize;
