const tap = require('tap');
const sinon = require('sinon');
const { Observable } = require('../../../utils/observable');

const clock = sinon.useFakeTimers();
tap.teardown(() => clock.restore());

tap.test('observable', async (t) => {
    await t.test('value', (t) => {
        const value = new Observable(0);

        t.plan(4);

        t.equal(value(), 0, 'observable should return 0');
        t.equal(value.value, 0, 'observable should have value 0');
        value(2);
        t.equal(value(), 2, 'observable should return 2');
        t.equal(value.value, 2, 'observable should have value 2');
    });

    await t.test('toString', (t) => {
        const value = new Observable();

        t.plan(6);

        t.equal(typeof value.toString(), 'string', 'observable toString should return a string');
        t.equal(value.toString(), 'undefined', 'observable toString should return string "undefined"');
        value(null);
        t.equal(typeof value.toString(), 'string', 'observable toString should return a string');
        t.equal(value.toString(), 'null', 'observable toString should return string "null"');
        value(2);
        t.equal(typeof value.toString(), 'string', 'observable toString should return a string');
        t.equal(value.toString(), '2', 'observable toString should return string "2"');
    });

    await t.test('subscribe', async (t) => {
        await t.test('function', (t) => {
            const value = new Observable(0);
            const observer = sinon.fake();

            t.plan(2);

            value.subscribe(observer);
            value(10);
            t.ok(observer.calledOnce, 'observer should have been called');
            t.ok(observer.calledWith(10), 'observer should have been called with value 10');
        });
        await t.test('non function', (t) => {
            const value = new Observable(0);
            const observer = 'test';

            t.plan(2);

            const dispose = value.subscribe(observer);
            value(10);
            t.equal(value.value, 10, 'observer should have value 10');
            t.equal(typeof dispose, 'function', 'observable subscribe should return a function');
        });
    });

    await t.test('unsubscribe', (t) => {
        const value = new Observable(0);
        const observer = sinon.fake();
        const dispose = value.subscribe(observer);

        t.plan(2);

        value(10);
        dispose();
        value(20);
        t.ok(observer.calledOnce, 'observer should have been called only once');
        t.ok(observer.calledWith(10), 'observer should have been called with value 10');
    });

    await t.test('map', (t) => {
        const value = new Observable(0).map(x => x + 1);
        const observer = sinon.fake();
        value.subscribe(observer);

        t.plan(6);

        t.equal(value(), 0, 'observable should return 0');
        t.equal(value.value, 0, 'observable should have value 0');
        value(1);
        t.equal(value(), 2, 'observable should return 2');
        t.equal(value.value, 2, 'observable should have value 2');
        t.ok(observer.calledOnce, 'observer should have been called only once');
        t.ok(observer.calledWithExactly(2, 0), 'observer should have been called with (2, 0)');
    });

    await t.test('filter', (t) => {
        const value = new Observable(0).filter(x => x > 1);
        const observer = sinon.fake();
        value.subscribe(observer);

        t.plan(6);

        value(1);
        t.equal(value(), 0, 'observable should return 0');
        t.equal(value.value, 0, 'observable should have value 0');

        value(2);
        t.equal(value(), 2, 'observable should return 2');
        t.equal(value.value, 2, 'observable should have value 2');
        t.ok(observer.calledOnce, 'observer should have been called only once');
        t.ok(observer.calledWithExactly(2, 0), 'observer should have been called with (2, 0)');
    });

    await t.test('each', (t) => {
        const observer = sinon.fake();
        const value = new Observable(0).each(observer);

        t.plan(8);

        value(1);
        t.equal(value(), 1, 'observable should return 0');
        t.equal(value.value, 1, 'observable should have value 0');
        t.ok(observer.calledOnce, 'observer should have been called only once');
        t.ok(observer.calledWithExactly(1, 0), 'observer should have been called with (1, 0)');

        value(2);
        t.equal(value(), 2, 'observable should return 2');
        t.equal(value.value, 2, 'observable should have value 2');
        t.ok(observer.calledTwice, 'observer should have been called twice');
        t.ok(observer.calledWithExactly(2, 1), 'observer should have been called with (2, 1)');
    });

    await t.test('chain operators', async (t) => {
        await t.test('.map.map', (t) => {
            const value = new Observable(0).map(x => x - 1).map(x => x * 2);
            const observer = sinon.fake();
            value.subscribe(observer);

            t.plan(10);

            value(1);
            t.equal(value(), 0, 'observable should return 0');
            t.equal(value.value, 0, 'observable should have value 0');
            t.ok(observer.calledOnce, 'observer should have been only once');
            t.ok(observer.calledWithExactly(0, 0), 'observer should have been called with (0, 0)');

            value(2);
            t.equal(value(), 2, 'observable should return 2');
            t.equal(value.value, 2, 'observable should have value 2');
            t.ok(observer.calledTwice, 'observer should have been twice');
            t.ok(observer.calledWithExactly(2, 0), 'observer should have been called with (2, 0)');

            value(3);
            t.equal(value(), 4, 'observable should return 4');
            t.equal(value.value, 4, 'observable should have value 4');
        });
        await t.test('.filter.map', (t) => {
            const value = new Observable(0).filter(x => x > 1).map(x => x * 2);
            const observer = sinon.fake();
            value.subscribe(observer);

            t.plan(6);

            value(1);
            t.equal(value(), 0, 'observable should return 0');
            t.equal(value.value, 0, 'observable should have value 0');

            value(2);
            t.equal(value(), 4, 'observable should return 4');
            t.equal(value.value, 4, 'observable should have value 4');
            t.ok(observer.calledOnce, 'observer should have been only once');
            t.ok(observer.calledWithExactly(4, 0), 'observer should have been called with (4, 0)');
        });
        await t.test('.map.filter', (t) => {
            const value = new Observable(0).map(x => x * 2).filter(x => x > 1);
            const observer = sinon.fake();
            value.subscribe(observer);

            t.plan(6);

            value(1);
            t.equal(value(), 0, 'observable should return 0');
            t.equal(value.value, 0, 'observable should have value 0');

            value(2);
            t.equal(value(), 4, 'observable should return 4');
            t.equal(value.value, 4, 'observable should have value 4');
            t.ok(observer.calledOnce, 'observer should have been called only once');
            t.ok(observer.calledWithExactly(4, 0), 'observer should have been called with (4, 0)');
        });
        await t.test('.filter.filter', (t) => {
            const value = new Observable(0).filter(x => x > 1).filter(x => x < 4);
            const observer = sinon.fake();
            value.subscribe(observer);

            t.plan(8);

            value(1);
            t.equal(value(), 0, 'observable should return 0');
            t.equal(value.value, 0, 'observable should have value 0');

            value(2);
            t.equal(value(), 2, 'observable should return 2');
            t.equal(value.value, 2, 'observable should have value 2');
            t.ok(observer.calledOnce, 'observer should have been called only once');
            t.ok(observer.calledWithExactly(2, 0), 'observer should have been called with (2, 0)');

            value(4);
            t.equal(value(), 2, 'observable should return 2');
            t.equal(value.value, 2, 'observable should have value 2');
        });
    });

    await t.test('Observable.unwrap', (t) => {
        const value = {
            name: new Observable(''),
            type: new Observable(''),
            value: null,
            list: undefined
        };

        t.plan(2);

        t.deepEqual(Observable.unwrap(value), { name: '', type: '', value: null, list: undefined }, 'Observable initialized with empty name and type');
        value.name('John Doe');
        value.type({ id: 1, name: 'Doe' });
        t.deepEqual(Observable.unwrap(value), { name: 'John Doe', type: { id: 1, name: 'Doe' }, value: null, list: undefined }, 'Observable unwrap to an object');
    });

    await t.test('Observable.unwrap map', (t) => {
        const value = {
            name: new Observable(''),
            type: new Observable(''),
        };
        const map = (value, key) => {
            if (key === 'type' && typeof value === 'string') {
                return { name: value }
            }
            return value;
        };

        t.plan(2);

        t.deepEqual(Observable.unwrap(value, map), { name: '', type: { name: '' } }, 'Observable initialized with empty name and type');
        value.name('John Doe');
        value.type({ id: 1, name: 'Doe' });
        t.deepEqual(Observable.unwrap(value, map), { name: 'John Doe', type: { id: 1, name: 'Doe' } }, 'Observable unwrap to an object');
    });
});
