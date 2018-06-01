/**
 * 网页授权
 */

const config = require('config')
const axios = require('axios');

class WebAuthorize {
    constructor() {

    }

    static async getDataByCode(code) {
        let api = '/sns/oauth2/access_token';
        api = config.get('mp.api') + api;

        try {
            let response = await axios.get(api, {
                params: {
                    'appid': config.get('mp.appid'),
                    'secret': config.get('mp.appsecret'),
                    'code': code,
                    'grant_type': 'authorization_code',
                }
            })

            let data = response.data
            if (data.errcode) {
                return Promise.reject(data.errmsg)
            }
            return data;

        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     *
     * @param redirectUrl
     * @param scope 可选值 snsapi_userinfo | snsapi_base
     * @param state
     * @returns {string}
     */
    static generateOAuthUrl(redirectUrl, scope, state) {
        let url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid={APPID}&redirect_uri={REDIRECT_URI}&response_type=code&scope={SCOPE}&state={STATE}#wechat_redirect';

        redirectUrl = config.get('server.url') + redirectUrl;

        let mapObj = {
            "{APPID}": config.get('mp.appid'),
            "{REDIRECT_URI}": encodeURIComponent(redirectUrl),
            "{SCOPE}": scope,
            "{STATE}": state,
        };
        url = url.replace(/{APPID}|{REDIRECT_URI}|{SCOPE}|{STATE}/gi, function (matched) {
            return mapObj[matched];
        });

        return url
    }
}

module.exports = WebAuthorize;