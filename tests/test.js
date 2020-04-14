const glob = require('glob');
const path = require('path');

Promise.resolve('specs/**/*.spec.js')
    .then(pattern => promisify(glob, pattern))
    .then(list => list.map(filename => path.resolve(filename)))
    .then(list => list.map(filename => require(filename)))
    .catch(console.error.bind(console, 'Error:'));

function promisify(fn, ...args) {
    const resolver = (resolve, reject) => {
        const callback = (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        };
        fn(...args, callback);
    };
    return new Promise(resolver);
}