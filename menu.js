const WxAction = require('./lib/WeixinAction');

let wxAction = new WxAction();

wxAction.menuReCreate(require('./config/menu.json'))
    .then(s => {
        console.log(s);
        process.exit(1);
    })
    .catch(e =>
        console.log(e)
    )

