const config = require('config')
const axios = require('axios');

class Tuling123 {
    constructor() {
        this.api = config.get('tuling123.api')
        let keys = config.get('tuling123.keys');

        let index = Math.floor((Math.random() * keys.length));

        this.key = keys[index];

    }

    async getResult(openid, text, location = null) {

        let params = {
            "reqType": 0,
            "perception": {
                "inputText": {
                    "text": text
                },
            },
            "userInfo": {
                "apiKey": this.key,
                "userId": openid,
            }
        }

        if (location) {
            params.perception.selfInfo = {
                "location": {
                    "city": location.city,
                    "province": location.province,
                }
            }
        }

        try {
            let response = await axios.post(this.api, JSON.stringify(params))
            let data = response.data
            if (data.intent.code < 10000) {
                return false;
            }
            return data.results;

        } catch (err) {
            return false;
        }
    }
}

module.exports = Tuling123;