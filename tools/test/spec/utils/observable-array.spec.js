const tap = require('tap');
const { Observable } = require('../../../utils/observable');
const { ObservableArray } = require('../../../utils/observable-array');

tap.test('observable', async (t) => {
    await t.test('array', async (t) => {
        const value = new ObservableArray();

        await t.equal(value.length, 0, 'observable has length 0');
    });
    await t.test('array get', async (t) => {
        const value = new ObservableArray([0]);

        await t.equal(value.length, 1, 'observable has length 1');
        await t.equal(+value.get(0), 0, 'observable[0] has value 0');
    });
    await t.test('array put', async (t) => {
        const value = new ObservableArray([0]);

        await t.equal(value.length, 1, 'observable has length 1');
        value.put(0, 1);
        await t.equal(+value.get(0), 1, 'observable[0] has value 1');
        value.put('logs', 'test');
        await t.equal(value.get('logs').value, 'test', 'observable["logs"] has value "test"');
    });
    await t.test('array map', async (t) => {
        const value = new ObservableArray().map(x => x + 1);

        await t.equal(value.length, 0, 'observable has length 0');
        value.put(0, 1);
        await t.equal(+value.get(0), 1, 'observable[0] has value 1');
        value.put('logs', 'test');
        await t.equal(value.get('logs').value, 'test', 'observable["logs"] has value "test"');
    });
    await t.test('array contains observable', async (t) => {
        const value = new ObservableArray([0]);

        await t.equal(value.get(0).isObservable, true, 'observable[0] is an observable');
    });
    await t.test('array push', async (t) => {
        const value = new ObservableArray();

        value.push(0);
        await t.equal(value.length, 1, 'observable has length 1');
        await t.equal(+value.get(0), 0, 'observable[0] has value 0');
        value.push(1);
        await t.equal(value.length, 2, 'observable has length 2');
        await t.equal(+value.get(0), 0, 'observable[0] has value 0');
        await t.equal(+value.get(1), 1, 'observable[1] has value 1');
    });
    await t.test('array pop', async (t) => {
        const value = new ObservableArray([1, new Observable(2)]);

        await t.equal(value.length, 2, 'observable has length 1');
        await t.equal(+value.get(0), 1, 'observable[0] has value 1');
        await t.equal(+value.get(1), 2, 'observable[1] has value 2');
        const item = value.pop();
        await t.equal(value.length, 1, 'observable has length 1');
        await t.equal(+value.get(0), 1, 'observable[0] has value 1');
        await t.equal(item.isObservable, true, 'item is an observable');
        await t.equal(item.value, 2, 'item has value 2');
    });
});
