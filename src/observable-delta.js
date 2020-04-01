import { Observable } from './observable';

export function ObservableDelta(value) {
    return new Observable(value, (observable, res) => {
        const prev = new Observable(value);
        observable.each(res, (value, old) => prev(old));

        observable.defineProperty(res, 'delta', { get: () => observable.value() - prev.value });
        observable.defineProperty(res, 'prev', { get: () => prev.value });
    });
}
Observable.Delta = ObservableDelta;
