const http = require('http');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const middleware = require('./middleware');

const mkdir = promisify(fs.mkdir);

module.exports = http.createServer(requestHandler);

function requestHandler(req, res) {
    middleware.run(req, res);
}

middleware.use((ctx, next) => {
    if (ctx.url.pathname.indexOf('/weather/') === 0) {
        const filePath = path.resolve(path.join(__dirname, 'cache', ctx.url.pathname));
        try {
            fs.accessSync(filePath, fs.constants.R_OK);
            ctx.file = {
                name: filePath,
            };
        } catch(e) {
            let url = null;
            if (ctx.url.pathname.indexOf('/weather/flags/') === 0) {
                url = `http://openweathermap.org/images/flags/${ctx.url.pathname.replace(/^\/weather\/flags\//, '')}`;
            } else if (ctx.url.pathname.indexOf('/weather/icons/') === 0) {
                url = `http://openweathermap.org/img/wn/${ctx.url.pathname.replace(/^\/weather\/icons\//, '')}`;
            }
            if (url) {
                http.get(
                    url,
                    (res) => {
                        Promise.resolve()
                            .then(() => mkdir(path.dirname(filePath), { recursive: true }))
                            .then(() => fs.createWriteStream(filePath))
                            .then((file) => new Promise((resolve) => {
                                res.pipe(file);
                                res.on('end', () => {
                                    file.close();
                                    resolve();
                                });
                            }))
                            .catch(console.log)
                            .then(next);
                    }
                );
                return;
            }
        }
    }
    next();
});
middleware.use((ctx, next) => {
    if (!ctx.file) {
        const file = path.join(__dirname, 'public', ctx.url.pathname);
        ctx.file = {
            name: path.resolve(file)
        };
        try {
            if (fs.lstatSync(file).isDirectory()) {
                ctx.file.name = path.resolve(file, 'index.html');
            }
        } catch(e) {}
    }
    next();
});
middleware.use((ctx, next) => {
    if (fs.existsSync(ctx.file.name)) {
        fs.createReadStream(ctx.file.name).pipe(ctx.res);
        return;
    }
    next();
});
middleware.use((ctx, next) => {
    ctx.res.writeHead(200, {'Content-type': 'application/json'});
    ctx.res.write(JSON.stringify([ctx.url, ctx.file]));
    ctx.res.end();
});
