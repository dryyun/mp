/**
 * 微信消息加密解密
 * 使用了第三方库 https://github.com/node-webot/wechat-crypto
 */

const bluebird = require("bluebird");
const xml2js = bluebird.promisifyAll(require("xml2js"));
const wechatCrypto = require('wechat-crypto');

class MsgCrypt {
    constructor(token, encodingAesKey, appId) {
        this.wechatCrypto = new wechatCrypto(token, encodingAesKey, appId)
    }

    /**
     * 解密 ，返回 object
     * @param msgSignature , url 的 msg_msg_signature 参数，签名验证
     * @param timestamp , url 的 timestamp 参数，时间戳
     * @param nonce , url 的 nonce 参数，随机数
     * @param encryptXml ， 加密的 xml
     * @returns {Promise}
     */

    async decryptMsg(msgSignature, timestamp, nonce, encryptXml) {
        try {
            let xmlObj = await xml2js.parseStringAsync(encryptXml, {explicitArray: false})
            let encrypt = xmlObj.xml.Encrypt;
            if (this.wechatCrypto.getSignature(timestamp, nonce, encrypt) !== msgSignature) {
                return Promise.reject('signature check failed')
            }
            let decrypt = this.wechatCrypto.decrypt(encrypt)
            let result = await xml2js.parseStringAsync(decrypt.message, {explicitArray: false});

            return result.xml

        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * 加密，返回 xml 的字符串
     * @param replyXml , 回复的 xml
     * @param timeStamp , 时间戳
     * @param nonce , 随机串，可以使用 url 的 nonce 参数
     */
    encryptMsg(replyXml, timeStamp, nonce) {

        let encrypt = this.wechatCrypto.encrypt(replyXml)

        let signature = this.wechatCrypto.getSignature(timeStamp, nonce, encrypt);

        let xmlBuilder = new xml2js.Builder({
            rootName: 'xml',
            cdata: true,
            headless: true,
            renderOpts: {indent: ' ', pretty: 'true'}
        });

        return xmlBuilder.buildObject({
            "Encrypt": encrypt,
            "MsgSignature": signature,
            "TimeStamp": timeStamp,
            "Nonce": nonce,
        })
    }
}

module.exports = MsgCrypt;