const _ = require('underscore');
const returnable = require('./returnable');
const { Observable } = require('./observable');

function ObservableHistory(value, limit = 0) {
    const history = [value];
    let index = 0;
    let navigating = false;
    const push = (value) => {
        if (!navigating) {
            history.push(value);
            if (limit > 0) {
                history.splice(0, history.length - limit);
            }
        }
    };
    return new Observable(value, (internal, res) => {
        internal.subscribers.push(push);
        internal.subscribers.push(() => (!navigating ? index = history.length - 1 : null));
        internal.subscribers.push(() => navigating = false);

        const map = returnable((map) => internal.mappers.push((...args) => !navigating ? map(...args) : args[0]), res);
        const prev = () => returnable(() => {
            navigating = true;
            if (index > 0) {
                index -= 1;
            }
            res(history[index]);
        }, res);
        const next = () => returnable(() => {
            navigating = true;
            if (index < history.length - 1) {
                index += 1;
            }
            res(history[index]);
        }, res);
        const first = () => returnable(() => {
            navigating = true;
            if (index > 0) {
                index = 0;
            }
            res(history[index]);
        }, res);
        const last = () => returnable(() => {
            navigating = true;
            if (index < history.length - 1) {
                index = history.length - 1;
            }
            res(history[index]);
        }, res);
        Object.defineProperty(res, 'map', { value: map, enumerable: true });
        Object.defineProperty(res, 'prev', { value: prev, enumerable: true });
        Object.defineProperty(res, 'next', { value: next, enumerable: true });
        Object.defineProperty(res, 'first', { value: first, enumerable: true });
        Object.defineProperty(res, 'last', { value: last, enumerable: true });
    });
}
module.exports.ObservableHistory = ObservableHistory;
