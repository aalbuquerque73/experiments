const tap = require('tap');
const sinon = require('sinon');
const { ObservableCompose } = require('../../../utils/observable-compose');
const { Observable } = require('../../../utils/observable');

tap.test('observable', async (t) => {
    await t.test('compose', async (t) => {
        const value1 = new Observable(1);
        const value2 = new Observable(2);

        await t.test('initial value', (t) => {
            const compose = new ObservableCompose(value1, value2);
            t.plan(1);
            t.deepEqual(compose.value, [1, 2], 'compose observable should have value [1, 2]');
        });

        await t.test('subscribe', (t) => {
            const compose = new ObservableCompose(value1, value2);
            const observer = sinon.fake();
            compose.subscribe(observer);

            t.plan(6);

            Promise.resolve(2)
                .then(value1)
                .then(delay(1))
                .then(() => {
                    t.deepEqual(compose.value, [2, 2], 'compose observable should have value [2, 2]');
                    t.pass(observer.calledOnce, 'compose observer should have been called once');
                    t.pass(observer.calledWith([2, 2], [1, 2]), 'compose observer should have been called with value ([2, 2], [1, 2])');
                })
                .then(() => 3)
                .then(value2)
                .then(delay(1))
                .then(() => {
                    t.deepEqual(compose.value, [2, 3], 'compose observable should have value [2, 3]');
                    t.pass(observer.calledTwice, 'compose observer should have been called twice');
                    t.pass(observer.calledWith([2, 3], [2, 2]), 'compose observer should have been called with value ([2, 3], [2, 2])');
                });
        });

        await t.test('unsubscribe', (t) => {
            const compose = new ObservableCompose(value1, value2);
            const observer = sinon.fake();
            const dispose = compose.subscribe(observer);

            t.plan(5);

            Promise.resolve(1)
                .then(value1)
                .then(delay(1))
                .then(() => {
                    t.deepEqual(compose.value, [1, 3], 'compose observable should have value [1, 3]');
                    t.pass(observer.calledOnce, 'compose observer should have been called once');
                    t.pass(observer.calledWith([1, 3], [2, 3]), 'compose observer should have been called with value ([1, 3], [2, 3])');
                })
                .then(dispose)
                .then(() => 2)
                .then(value2)
                .then(delay(1))
                .then(() => {
                    t.deepEqual(compose.value, [1, 2], 'compose observable should have value [1, 2]');
                    t.pass(observer.calledOnce, 'compose observer should have been called once');
                });
        });
    });
});

function delay(delay) {
    const resolver = resolve => setTimeout(resolve, delay);
    return new Promise(resolver);
}
