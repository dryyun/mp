module.exports = async function (message) {
    message.Content = message.Recognition;

    return require('./TextMsgHandler')(message);
}
