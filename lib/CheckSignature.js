/**
 * 验证服务器 token
 */

const sha1 = require('sha1')
const config = require('config')

module.exports = function (req) {
    let token = config.get('mp.token')

    let signature = req.query.signature;
    let timestamp = req.query.timestamp;
    let nonce = req.query.nonce;

    let array = [token, timestamp, nonce];
    array.sort();

    let str = sha1(array.join(""));

    return str === signature;
}