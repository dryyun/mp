/**
 * 消息处理
 */
const moment = require('moment')
const xml2js = require('xml2js');

const xmlBuilder = new xml2js.Builder({
    rootName: 'xml',
    cdata: true,
    headless: true,
    renderOpts: {indent: ' ', pretty: 'true'}
});

let handlers = {
    'text': 'TextMsgHandler',
    'event': 'EventMsgHandler',
    'voice': 'VoiceMsgHandler',
};

let exps = {};
for (let key of Object.keys(handlers)) {
    let handler = handlers[key]
    exps[handlers[key]] = require(__dirname + '/' + handler)
}

class MsgHandler {

    static async replyMsg(message, msgCrypt) {
        let handler = handlers[message.MsgType];

        let timeStamp = moment().format('X')

        if (handler) {

            let replyMsgXml = null;
            try {
                let content = await exps[handler](message)

                if (content) {

                    let replyMsgObj = MsgHandler.replyTextMsg(content);

                    replyMsgObj = Object.assign(replyMsgObj, {
                        "ToUserName": message.FromUserName,
                        "FromUserName": message.ToUserName,
                        "CreateTime": timeStamp
                    });

                    replyMsgXml = xmlBuilder.buildObject(replyMsgObj);

                    replyMsgXml = msgCrypt.encryptMsg(replyMsgXml, timeStamp, timeStamp);

                } else {
                    replyMsgXml = 'fail';
                }
            } catch (err) {
                console.log(err);
                replyMsgXml = 'fail';
            }

            return replyMsgXml;

        } else {
            throw new Error(`Can't get msgHandler`);
        }
    }


    static replyTextMsg(content) {
        console.log(content)
        return {
            "MsgType": "text",
            "Content": content,
        }
    }
}

exps.MsgHandler = MsgHandler;
module.exports = exps;
