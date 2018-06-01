let argv = require('yargs')
    .usage('node $0 -c [args]')
    .option('config', {
        alias: "c",
        default: "config.json",
        describe: 'The config file'
    })
    .demandOption(['c'])
    .help()
    .argv

if (!argv.c || typeof argv.c !== 'string') {
    console.log('You must specify a config file.');
    process.exit(1);
}

let configFile = argv.c

let exist = require('fs').existsSync(configFile)

if (!exist) {
    console.log(`config file ${configFile} is not exist`);
    process.exit(1);
}

console.log(`Using ${configFile}`);


