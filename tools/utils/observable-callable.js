const _ = require('underscore');
const returnable = require('./returnable');
const { Observable } = require('./observable');

function ObservableCallable(value) {
    return new Observable(value, (internal, res) => {
        const call = returnable((...args) => typeof value === 'function' ? value(...args) : null, res);
        Object.defineProperty(res, 'call', { value: call, enumerable: true });
    });
}
module.exports.ObservableCallable = ObservableCallable;
