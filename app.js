const express = require('express')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const rfs = require('rotating-file-stream')
const swig = require('swig')
const serveStatic = require('serve-static')
const config = require('config')
const session = require('express-session');
const FileStore = require('session-file-store')(session);


let app = express();

app.use(bodyParser.text({type: "text/xml"}))
app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
    name: "mp.sid",
    store: new FileStore(),
    resave: false,
    secret: 'dddd yunseeer',
    saveUninitialized: true
}));

// log
let logDirectory = path.join(__dirname, 'log')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

let accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
})

morgan.token('date', function () {
    let p = new Date().toString().replace(/[A-Z]{3}\+/, '+').split(/ /);
    return ( p[2] + '/' + p[1] + '/' + p[3] + ':' + p[4] + ' ' + p[5] );
});

// function logResponseBody(req, res, next) {
//     var oldWrite = res.write,
//         oldEnd = res.end;
//     var chunks = [];
//     res.write = function (chunk) {
//         chunks.push(chunk);
//
//         oldWrite.apply(res, arguments);
//     };
//     res.end = function (chunk) {
//         if (chunk)
//             chunks.push(chunk);
//
//         var body = Buffer.concat(chunks).toString('utf8');
//
//         res.body = body;
//         oldEnd.apply(res, arguments);
//     };
//     next();
// }

// app.use(logResponseBody);

app.use(morgan(function (tokens, req, res) {

    let reqBody = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body
    let resBody = typeof res.body === 'object' ? JSON.stringify(res.body) : res.body

    return [
        tokens.date(req, res),
        tokens['remote-addr'](req, res),
        tokens['remote-user'](req, res),
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        "\n" + reqBody,
        "\n" + resBody,
    ].join(' ')

}, {stream: accessLogStream}));


function setCustomCacheControl(res, path) {
    if (serveStatic.mime.lookup(path) === 'text/html') {
        // Custom Cache-Control for HTML files
        res.setHeader('Cache-Control', 'public, max-age=0')
    }
}

app.use(serveStatic(path.join(__dirname, 'public'), {
    maxAge: '1d',
    setHeaders: setCustomCacheControl

}))

// view engine setup
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
if (config.get('debug')) {
    swig.setDefaults({cache: false});
}


module.exports = app;