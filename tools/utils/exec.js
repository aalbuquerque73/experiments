const { spawn } = require('child_process');

function exec(cmd, args = [], spawnOptions = {}, logger = {}, callback = () => {}) {
    const resolver = (resolve, reject) => {
        const p = spawn(cmd, args, spawnOptions);
        callback(p);
        if (logger && typeof logger.log === 'function') {
            p.stdout && p.stdout.on('data', data => logger.log(`${data}`));
            p.stderr && p.stderr.on('data', data => logger.log(`${data}`));
        }
        p.on('error', err => logger.log(`Error: ${err.message}`));
        p.on('close', code => {
            if (code) {
                reject(code);
                return;
            }
            resolve({ child: p, code });
        });
    };
    return new Promise(resolver);
}
module.exports = exec;
