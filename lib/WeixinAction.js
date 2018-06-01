const config = require('config')
const axios = require('axios');

const AccessToken = require('./AccessToken');

class WeixinAction {
    constructor() {
        this.api = config.get('mp.api')
    }

    async getUserInfo(openid) {
        let api = '/cgi-bin/user/info';

        let userInfo = null;

        try {
            let access_token = await AccessToken.getAccessToken();

            let response = await axios.get(this.api + api, {
                params: {
                    'access_token': access_token,
                    'openid': openid,
                    'lang': 'zh_CN',
                }
            })
            response = response.data;

            if (response && response.errcode) { // 请求错误

            } else if (response && response.subscribe != 1) { // 没有关注

            } else {
                userInfo = response;
            }
        } catch (err) {
            console.log(err);
        }
        return userInfo;
    }

    async templateSend(openid, templateId, url = null, miniprogram = null, data = {}) {
        let api = '/cgi-bin/message/template/send';
        let params = {
            'touser': openid,
            'template_id': templateId,
            'data': data,
        }
        if (url) {
            params.url = url;
        }
        if (miniprogram) {
            params.miniprogram = miniprogram;
        }

        try {
            let access_token = await AccessToken.getAccessToken();
            api = api + '?access_token=' + access_token;
            let response = await axios.post(this.api + api, JSON.stringify(params))

            if (response.status !== 200) {
                return Promise.reject('template send http status:' + response.status)
            }

            if (response.data.errcode !== 0) {
                return Promise.reject(response.data.errmsg)
            }

            return response.data;
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * 创建菜单，会先默认执行删除菜单操作
     * @param data
     * @param deleteFirst
     * @returns {Promise.<void>}
     */
    async menuReCreate(data, deleteFirst = true) {
        let createApi = '/cgi-bin/menu/create';
        let deleteApi = '/cgi-bin/menu/delete';

        try {
            let access_token = await AccessToken.getAccessToken();
            createApi = createApi + '?access_token=' + access_token;
            deleteApi = deleteApi + '?access_token=' + access_token;

            let response = null;
            if (deleteFirst) {
                response = await axios.post(this.api + deleteApi)

                if (response.status !== 200) {
                    return Promise.reject('delete menu http status:' + response.status)
                }
                if (response.data.errcode !== 0) {
                    return Promise.reject(response.data.errmsg)
                }
            }

            response = await axios.post(this.api + createApi, JSON.stringify(data))
            if (response.status !== 200) {
                return Promise.reject('create menu http status:' + response.status)
            }
            if (response.data.errcode !== 0) {
                return Promise.reject(response.data.errmsg)
            }

            return 'create menu ok';

        } catch (err) {
            return Promise.reject(err);
        }
    }
}

module.exports = WeixinAction;


