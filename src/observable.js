
export class Observable {
    constructor(value, factory = () => true) {
        this._disposables = [];
        this._subscribers = [];
        this._valueMappers = [];
        this._mappers = [];
        this._filters = [];
        this._afterFilters = [];
        this._value = value;
        const res = (value) => {
            if (value !== undefined) {
                const filter = this._filters.reduce((current, filter) => (current && filter(value, this._value)), true);
                if (filter) {
                    const oldValue = this._value;
                    const newValue = this._mappers.reduce((current, map) => map(current, oldValue), value);
                    const filter = this._afterFilters.reduce((current, filter) => (current && filter(newValue, this._value)), true);
                    if (filter) {
                        this._value = newValue;
                        res.notify(this._value, oldValue);
                    }
                }
            }
            return res.value;
        };
        factory(this, res);
        this.defineProperty(res, 'value', { get: () => this.value(), enumerable: true });
        this.defineProperty(res, 'isObservable', { value: true, enumerable: true });
        this.defineProperty(res, 'subscribe', { value: (...args) => this.subscribe(...args), enumerable: true });
        this.defineProperty(res, 'map', { value: (...args) => this.map(res, ...args), enumerable: true });
        this.defineProperty(res, 'each', { value: (...args) => this.each(res, ...args), enumerable: true });
        this.defineProperty(res, 'filter', { value: (...args) => this.filter(res, ...args), enumerable: true });
        this.defineProperty(res, 'clone', { value: () => this.clone(), enumerable: true });
        this.defineProperty(res, 'dispose', { value: () => this.dispose(), enumerable: true });
        this.defineProperty(res, 'toString', { value: () => this.toString() });
        this.defineProperty(res, 'notify', { value: (...args) => this.notify(res, ...args) });
        return res;
    }

    defineProperty(object, property, attributes) {
        if (!object.hasOwnProperty(property)) {
            Object.defineProperty(object, property, attributes);
        }
        return this;
    }

    value() {
        return this._valueMappers.reduce((current, map) => map(current), this._value);
    }

    subscribe(observer) {
        if (typeof observer === 'function') {
            this._subscribers.push(observer);
            return () => this._subscribers.splice(this._subscribers.indexOf(observer), 1);
        }
        return () => {};
    }

    map(res, map, forValue = false) {
        if (forValue) {
            this._valueMappers.push(map);
        } else {
            this._mappers.push(map);
        }
        return res;
    }

    each(res, listener) {
        this._subscribers.push(listener);
        return res;
    }

    filter(res, filter, after = false) {
        if (after) {
            this._afterFilters.push(filter);
        } else {
            this._filters.push(filter);
        }
        return res;
    }

    clone() {
        const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.{0,1}\d*))(?:Z|(\+|-)([\d|:]*))?$/;
        const parser = (key, value) => {
            let parsedValue = value;
            if (typeof value === 'string') {
                const a = reISO.exec(value);
                if (a) {
                    parsedValue = new Date(value);
                }
            }
            return parsedValue;
        };
        return new Observable(this._value, (observable) => {
            observable._filters = observable._filters.concat(this._filters);
            observable._afterFilters = observable._afterFilters.concat(this._afterFilters);
            observable._mappers = observable._mappers.concat(value => JSON.parse(JSON.stringify(value), parser), this._mappers);
            observable._valueMappers = observable._valueMappers.concat(this._valueMappers);
            observable._subscribers = observable._subscribers.concat(this._subscribers);
        });
    }

    dispose() {
        this._disposables
            .filter(observer => typeof observer === 'function')
            .forEach(dispose => dispose());
    }

    notify(res, value, oldValue) {
        this._subscribers
            .filter(observer => typeof observer === 'function')
            .forEach(observer => observer(value, oldValue));
        return res;
    }

    toString() {
        if (this._value == null) {
            return '';
        }
        return this._value.toString();
    }
}

Observable.unwrap = function (observable, map = item => item, key = null) {
    if (!observable) {
        return observable;
    }
    if (observable.isObservable) {
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

Observable.compose = (...args) => new Observable(args.map(item => item.value), (observable, res) => {
    const subscriber = () => res(args.map(item => item.value));
    args.forEach(partial => observable._disposables.push(partial.subscribe(subscriber)));
    const mapper = (map, forValue) => {
        if (!forValue) {
            observable._value = map(observable._value);
        }
        return observable.map(res, map, forValue);
    };
    Object.defineProperty(res, 'map', { value: mapper, enumerable: true });
});
