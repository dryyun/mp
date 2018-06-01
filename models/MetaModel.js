module.exports = (sequelize, DataTypes) => {
    let Meta = sequelize.define('meta', {
        key: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
        openid: {type: DataTypes.STRING, allowNull: false, primaryKey: true},
        value: DataTypes.STRING,
        extra: DataTypes.TEXT,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        tableName: 'meta',
    });

    Meta.getMetaByKey = async function (openid, key, attributes = ['value', 'extra']) {
        return Meta.findOne({
            attributes,
            where: {
                key,
                openid
            }
        })
    }

    Meta.setMetaByKey = async function (openid, key, value, extra = null) {

        try {
            let res = await Meta.findOrCreate({where: {key, openid}, defaults: {key, openid, value, extra}});
            let meta = res[0];
            let created = res[1];
            if (created) {
                return meta.value;
            }
            meta.value = value
            meta.extra = extra

            let update = await meta.save();

            return update.value;

        } catch (err) {
            return Promise.reject(err);
        }
    }

    Meta.getAnswerMode = async function (openid) {
        let key = 'answer_mode';
        let defaultMode = 'normal_answer';

        try {
            let answerMode = await Meta.getMetaByKey(openid, key);
            if (answerMode && answerMode.value) {
                defaultMode = answerMode.value;
            }
        } catch (err) {
            console.log(err);
        }

        return defaultMode;
    }

    return Meta;
}

