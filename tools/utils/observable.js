const returnable = require('./returnable');

class Observable {
    constructor(value, factory = () => true) {
        const subscribers = [];
        const mappers = [];
        const filters = [];
        const store = { value, oldValue: value };

        const res = (value) => {
            if (value !== undefined) {
                const filter = filters.reduce((current, filter) => current && filter(value, store.value), true);
                if (filter) {
                    store.oldValue = store.value;
                    store.value = mappers.reduce((current, map) => [map(...current), current[0]], [value, store.oldValue])[0];
                    res.notify(store.value, store.oldValue);
                }
            }
            return res.value;
        };
        factory({ subscribers, mappers, filters, store }, res);
        const subscribe = (observer) => {
            if (typeof observer === 'function') {
                subscribers.push(observer);
                return () => subscribers.splice(subscribers.indexOf(observer), 1);
            }
            return () => {};
        }
        const map = returnable(map => mappers.push(map), res);
        const each = returnable(listener => subscribers.push(listener), res);
        const filter = returnable(filter => filters.push(filter), res);
        const notify = returnable((...args) => subscribers.forEach(observer => observer(...args)), res);
        const toString = () => store.value != null ? store.value.toString() : store.value === null ? 'null' : 'undefined';
        const valueOf = () => +store.value;

        !res.hasOwnProperty('value') && Object.defineProperty(res, 'value', { get: () => store.value, enumerable: true });
        !res.hasOwnProperty('isObservable') && Object.defineProperty(res, 'isObservable', { value: true, enumerable: true });
        !res.hasOwnProperty('subscribe') && Object.defineProperty(res, 'subscribe', { value: subscribe, enumerable: true });

        !res.hasOwnProperty('map') && Object.defineProperty(res, 'map', { value: map, enumerable: true });
        !res.hasOwnProperty('each') && Object.defineProperty(res, 'each', { value: each, enumerable: true });
        !res.hasOwnProperty('filter') && Object.defineProperty(res, 'filter', { value: filter, enumerable: true });
        !res.hasOwnProperty('notify') && Object.defineProperty(res, 'notify', { value: notify, enumerable: true });
        !res.hasOwnProperty('toString') && Object.defineProperty(res, 'toString', { value: toString, enumerable: true });
        !res.hasOwnProperty('valueOf') && Object.defineProperty(res, 'valueOf', { value: valueOf, enumerable: true });
        return res;
    }
}

Observable.unwrap = function (observable, map = item => item, key = null) {
    if (observable && observable.isObservable) {
        return map(observable.value, key);
    }
    if (observable && typeof observable === 'object') {
        return Object.keys(observable).reduce((result, key) => {
            result[key] = Observable.unwrap(observable[key], map, key);
            return result;
        }, Array.isArray(observable) ? [] : {});
    }
    return observable;
};

module.exports.Observable = Observable;
