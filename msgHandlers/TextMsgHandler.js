const Tuling123 = require('../lib/Tuling123')

const models = require('../models')
const LocationModel = models.LocationModel;
const MetaModel = models.MetaModel;

module.exports = async function (message) {
    let openid = message.FromUserName;
    let content = message.Content;

    let msgContent = content + "\n" + content;
    try {
        let answerMode = await MetaModel.getAnswerMode(openid)
        if (answerMode === 'robot_answer') {

            let location = await LocationModel.getLastLocation(openid)
            let tuling = new Tuling123();
            let result = await tuling.getResult(openid, content, location.city ? location : null);

            if (result) {
                msgContent = '';
                result.forEach((item, index) => {
                    let type = item.resultType;
                    msgContent += item.values[type] + "\n";
                })
            } else {
                msgContent = '机器人异常，请稍后再试';
            }
        }
    } catch (err) {
        console.log(err);
    }

    return msgContent;
}
