const _ = require('underscore');
const { Observable } = require('./observable');

function ObservableArray(list = [], ...args) {
    if (!Array.isArray(list)) {
        list = [list].concat(args);
    }
    return new Observable(this._value, (internal, res) => {
        const pendingArgs = list.map(observable => ({ newValue: observable.value, oldValue: observable.value }));
        const notify = _.debounce(() => {
            const args = [
                pendingArgs.reduce((curr, next) => curr.concat(next.newValue), []),
                pendingArgs.reduce((curr, next) => curr.concat(next.oldValue), [])
            ];
            internal.subscribers.forEach(listener => listener(...args));
            list.forEach((observable, index) => pendingArgs[index] = { newValue: observable.value, oldValue: observable.value });
        }, 0);
        const observableNotify = observable => (newValue, oldValue) => {
            const index = list.findIndex(item => item === observable);
            if (index > -1) {
                pendingArgs[index] = { newValue, oldValue };
                notify();
            }
        };
        const disposables = [];
        list.forEach((item, index) => {
            if (!item || !item.isObservable) {
                list[index] = item = new Observable(item);
            }
            disposables.push(item.subscribe(observableNotify(item)));
        });
        const subscribe = (observer) => {
            if (internal.subscribers.length === 0) {
                list.forEach(observable => disposables.push(observable.subscribe(observableNotify(observable))));
            }
            internal.subscribers.push(observer);
            return () => {
                internal.subscribers.splice(observable._subscribers.indexOf(observer), 1);
                if (internal.subscribers.length === 0) {
                    disposables.forEach(dispose => dispose());
                    disposables.length = 0;
                }
            };
        };
        const get = (index) => list[index] || new Observable();
        const put = (index, observable) => {
            if (list[index] && list[index].isObservable) {
                list[index](observable);
                return res;
            }
            if (!observable || !observable.isObservable) {
                observable = new Observable(observable).map(value => value && value.isObservable ? value.value : value);
            }
            pendingArgs[index] = { newValue: observable.value, oldValue: observable.value };
            list[index] = observable;
            if (disposables[index]) {
                disposables[index]();
            }
            disposables[index] = observable.subscribe(observableNotify(observable));
            return res;
        };
        const keys = (strict = false) => {
            return Object.keys(list).filter(key => !strict || typeof key !== 'number');
        };
        const push = (observable) => {
            if (!observable || !observable.isObservable) {
                observable = new Observable(observable);
            }
            pendingArgs.push({ newValue: observable.value, oldValue: observable.value });
            list.push(observable);
            disposables.push(observable.subscribe(observableNotify(observable)));
            return res;
        };
        const pop = () => {
            const dispose = disposables.pop();
            dispose();
            pendingArgs.pop();
            return list.pop();
        };
        const unshift = (observable) => {
            if (!observable || !observable.isObservable) {
                observable = new Observable(observable);
            }
            pendingArgs.unshift({ newValue: observable.value, oldValue: observable.value });
            list.unshift(observable);
            disposables.unshift(observable.subscribe(observableNotify(observable)));
            return res;
        };
        const shift = () => {
            const dispose = disposables.shift();
            dispose();
            pendingArgs.shift();
            return list.shift();
        };
        const map = (map) => {
            list.forEach((value, index) => list[index] = value.map(map));
            return res;
        };
        const find = (finder) => {
            const res = list.find(finder) || new Observable();
            return res;
        };
        const filter = (filter) => {
            return new ObservableArray(list.filter(filter));
        };
        const forEach = (callback) => {
            list.forEach(value => callback(value));
            return res;
        };

        Object.defineProperty(res, 'map', { value: map, enumerable: true });
        Object.defineProperty(res, 'value', { get: () => list.map(observable => observable.value), enumerable: true });
        Object.defineProperty(res, 'subscribe', { value: subscribe, enumerable: true });
        Object.defineProperty(res, 'notify', { value: notify, enumerable: true });
        Object.defineProperty(res, 'get', { value: get, enumerable: true });
        Object.defineProperty(res, 'put', { value: put, enumerable: true });
        Object.defineProperty(res, 'keys', { value: keys, enumerable: true });
        Object.defineProperty(res, 'push', { value: push, enumerable: true });
        Object.defineProperty(res, 'pop', { value: pop, enumerable: true });
        Object.defineProperty(res, 'unshift', { value: unshift, enumerable: true });
        Object.defineProperty(res, 'shift', { value: shift, enumerable: true });
        Object.defineProperty(res, 'length', { get: () => list.length, enumerable: true });
        Object.defineProperty(res, 'find', { value: find, enumerable: true });
        Object.defineProperty(res, 'filter', { value: filter, enumerable: true });
        Object.defineProperty(res, 'forEach', { value: forEach, enumerable: true });
        Object.defineProperty(res, 'toString', { get: () => list.toString(), enumerable: true });
        Object.defineProperty(res, 'valueOf', { get: () => list.length, enumerable: true });
    });
}
module.exports.ObservableArray = ObservableArray;
