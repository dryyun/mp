const config = require('config');

const CheckSignature = require('./lib/CheckSignature');
const WebAuthorize = require('./lib/WebAuthorize.js');

let app = require('./app');
/**
 * 验证服务器 token 签名
 */
app.get('/', (req, res) => {

    let signature = req.query.signature;
    if (!signature) {
        return res.send('api for mp')
    }

    if (!CheckSignature(req)) {
        return res.send("fail")
    }

    return res.send(req.query.echostr)

});

/**
 * 处理微信服务器发送的 post 消息
 */
app.post('/', (req, res) => {

    const MsgCrypt = require('./lib/MsgCrypt');
    const MsgHandler = require('./msgHandlers').MsgHandler;
    let msgCrypt = new MsgCrypt(config.get('mp.token'), config.get('mp.encodingAESKey'), config.get('mp.appid'));

    if (!CheckSignature(req)) {
        return res.send("fail")
    }

    msgCrypt.decryptMsg(req.query.msg_signature, req.query.timestamp, req.query.nonce, req.body)
        .then(decryptXmlObj => {
            console.log(decryptXmlObj)
            return MsgHandler.replyMsg(decryptXmlObj, msgCrypt)
        })
        .then(encryptXml => {
            return res.send(encryptXml)
        })
        .catch(err => {
            return res.send('fail')
        })
});


/**
 * notices 网页设置
 */
app.get('/notices', (req, res) => {

    let state = 'notices123state';
    let scope = 'snsapi_base';

    if (req.session.webauthorize) {

        const models = require('./models');
        const NoticeModel = models.NoticeModel;

        NoticeModel.listByOpenId(req.session.webauthorize.openid)
            .then(list => {
                return res.render('notices.html', {title: '消息提醒', list: list});
            })
            .catch(err => {
                return res.render('notices.html', {title: '消息提醒', list: []});
            })

    } else if (req.query.state === state && req.query.code) {

        WebAuthorize.getDataByCode(req.query.code)
            .then(data => {
                req.session.webauthorize = data;
                return res.redirect('/notices')
            })
            .catch(err => {
                console.log(err)
                return res.redirect('/')
            })

    } else {

        let oauthUrl = WebAuthorize.generateOAuthUrl('/notices', scope, state);

        return res.redirect(oauthUrl);
    }

});

/**
 * 增加提醒表单页
 */
app.get('/notice/add', (req, res) => {
    if (!req.session.webauthorize) {
        return res.redirect('/notices');
    }
    console.log(req.session.webauthorize);
    res.render('notice_add.html', {title: '增加消息提醒'});
})

/**
 * 增加提醒 post
 */
app.post('/notice/add', (req, res) => {
    if (!req.session.webauthorize) {
        return res.redirect('/notices');
    }
    const models = require('./models');
    const NoticeModel = models.NoticeModel;

    NoticeModel.addNotice(req.session.webauthorize.openid, req.body)
        .then(success => {
            return res.render('success.html', {title: 'Success'});
        })
        .catch(err => {
            return res.render('failed.html', {title: 'Failed'});
        })
})


app.get('/notice/:noticeId/delete', (req, res) => {

    if (!req.session.webauthorize) {
        return res.redirect('/notices');
    }
    const models = require('./models');
    const NoticeModel = models.NoticeModel;

    NoticeModel.findOne({
        where: {
            id: req.params.noticeId
        }
    })
        .then(notice => {
            notice.status = 10;
            return notice.save();
        })
        .then(success => {
            return res.render('success.html', {title: 'Success'});
        })
        .catch(err => {
            return res.render('failed.html', {title: 'Failed'});
        })
    
})

// notice list confirm
app.get('/notice/:noticeListId/confirm', (req, res) => {

    const models = require('./models');
    const NoticeListModel = models.NoticeListModel;

    NoticeListModel
        .noticeConfirm(req.params.noticeListId)
        .then(success => {
            console.log(success)
        })
        .catch(err => {
            console.log(err);
        })

    res.render('notice_confirm.html', {title: '提醒确认'});
})


app.listen(config.get('server.port'), () => {
    console.log(`mp start on port ${config.get('server.port')}... `)
});


