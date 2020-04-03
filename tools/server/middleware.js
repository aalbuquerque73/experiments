const reusify = require('reusify');
const URL = require('url');

function MiddleWare() {
    const middleware = [];
    const pool = reusify(Holder);

    this.use = (f) => storeIn(middleware, f);
    this.run = (req, res) => {
        if (middleware.length === 0) {
            return;
        }
        const holder = pool.get();
        holder.context = {
            url: URL.parse(req.url),
            req,
            res
        };
        holder.done();
    };

    function Holder() {
        this.context = {};
        this.current = 0;

        this.done = (err) => {
            const current = this.current++;
            if (this.context.res.finished === true) {
                this.context = {};
                this.current = 0;
                pool.release(this);
                return;
            }
            if (err || this.current >= middleware.length) {
                this.context = {};
                this.current = 0;
                pool.release(this);
                return;
            }
            const callback = middleware[current];
            callback(this.context, this.done);
        };
    }
}

function storeIn(array, callback) {
    if (Array.isArray(callback)) {
        callback.filter(item => typeof item === 'function')
            .forEach(item => storeIn(array, item, logger));
    } else if (typeof callback === 'function') {
        array.push(callback);
    }
}

module.exports = new MiddleWare();
module.exports.MiddleWare = MiddleWare;
