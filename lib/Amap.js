/**
 * 高德地图相关 API
 */
const axios = require('axios');

class Amap {
    constructor(key, api) {
        this.key = key;
        this.api = api;
    }

    /**
     * 逆地理编码
     * @param longitude 精度
     * @param latitude 纬度
     * @param options 其他可选参数
     */
    geocodeRegeo(longitude, latitude, options = {}) {
        let url = '/geocode/regeo';

        options = Object.assign(options, {
            "location": `${longitude},${latitude}`,
        })

        return this.request(url, options)
    }

    async request(url, params, method = 'GET') {
        let requestUrl = this.api + url;
        params = Object.assign({
            "key": this.key
        }, params)


        try {
            let response = await axios.get(requestUrl, {params});
            if (response.status !== 200) {
                return Promise.reject('amap http status:' + response.status)
            }
            if (response.data.status !== '1') {
                return Promise.reject('amap request ' + response.data.info + response.data.infocode)
            }

            return response.data;

        } catch (err) {
            return Promise.reject(err)
        }
    }
}

module.exports = Amap;