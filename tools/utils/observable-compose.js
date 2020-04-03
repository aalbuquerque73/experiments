const _ = require('underscore');
const { Observable } = require('./observable');

function ObservableCompose(...list) {
    return new Observable(this._value, (internal, res) => {
        const pendingArgs = list.map(observable => ({ newValue: observable.value, oldValue: observable.value }));
        const notify = _.debounce(() => {
            const args = [
                pendingArgs.reduce((curr, next) => curr.concat(next.newValue), []),
                pendingArgs.reduce((curr, next) => curr.concat(next.oldValue), [])
            ];
            internal.subscribers.forEach(listener => listener(...args));
            list.forEach((observable, index) => pendingArgs[index] = { newValue: observable.value, oldValue: observable.value });
        }, 1);
        const observableNotify = observable => (newValue, oldValue) => {
            const index = list.findIndex(item => item === observable);
            if (index > -1) {
                pendingArgs[index] = { newValue, oldValue };
                notify();
            }
        };
        const disposables = [];
        const subscribe = (observer) => {
            if (internal.subscribers.length === 0) {
                list.forEach(observable => disposables.push(observable.subscribe(observableNotify(observable))));
            }
            internal.subscribers.push(observer);
            return () => {
                internal.subscribers.splice(internal.subscribers.indexOf(observer), 1);
                if (internal.subscribers.length === 0) {
                    disposables.forEach(dispose => dispose());
                    disposables.length = 0;
                }
            };
        };
        Object.defineProperty(res, 'value', { get: () => list.map(observable => observable.value), enumerable: true });
        Object.defineProperty(res, 'subscribe', { value: observer => subscribe(observer), enumerable: true });
        Object.defineProperty(res, 'notify', { value: notify });
    });
}
module.exports.ObservableCompose = ObservableCompose;
