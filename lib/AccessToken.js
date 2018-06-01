const config = require('config')
const axios = require('axios');
const moment = require('moment');

const models = require('../models');
const MetaModel = models.MetaModel;

let metaKey = 'access_token';

class AccessToken {

    constructor() {
        this.appid = config.get('mp.appid')
        this.appsecret = config.get('mp.appsecret')
        this.api = config.get('mp.api')
    }

    async getToken() {
        let api = '/cgi-bin/token';

        try {
            let response = await axios.get(this.api + api, {
                params: {
                    'grant_type': 'client_credential',
                    'appid': this.appid,
                    'secret': this.appsecret
                }
            })

            let data = response.data
            if (data.errcode) {
                return Promise.reject(data.errmsg)
            }

            return data.access_token;

        } catch (err) {
            return Promise.reject(err);
        }
    }

    static async setAccessToken(token, expire) {
        return await MetaModel.setMetaByKey('root', metaKey, token, expire)
    }

    static async getAccessToken() {
        let metaToken = await MetaModel.getMetaByKey('root', metaKey);
        return metaToken.value
    }

}

module.exports = AccessToken;