const { Observable } = require('./observable');

function ObservableEmitter(emitter) {
    const subscriptions = [];
    const value = new Observable(null);
    return new Observable(emitter, (internal, res) => {
        Object.defineProperty(res, 'on', {
            value: (topic) => {
                emitter.addListener(topic, value);
                subscriptions.push(() => emitter.removeListener(topic, value));
                subscriptions[subscriptions.length - 1].topic = topic;
                return res;
            },
            enumerable: true
        });
        Object.defineProperty(res, 'off', {
            value: (topic) => {
                if (topic) {
                    const disposables = subscriptions.filter(item => item.topic === topic);
                    disposables.forEach(dispose => dispose());
                    disposables.reverse().forEach(item => subscriptions.splice(subscriptions.indexOf(item), 1));
                    return res;
                }
                subscriptions.forEach(dispose => dispose());
                return res;
            },
            enumerable: true
        });
        Object.defineProperty(res, 'subscribe', { value: observer => value.subscribe(observer), enumerable: true });
        Object.defineProperty(res, 'each', { value: (observer) => {
            value.each(observer);
            return res;
        }, enumerable: true });
        Object.defineProperty(res, 'notify', {
            value: (...args) => {
                value.notify(...args);
                return res;
            },
            enumerable: true
        });
        Object.defineProperty(res, 'value', {
            value: () => value.value,
            enumerable: true
        });
    });
}
module.exports.ObservableEmitter = ObservableEmitter;
