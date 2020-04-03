const tap = require('tap');
const sinon = require('sinon');
const { ObservableClone } = require('../../../utils/observable-clone');

const clock = sinon.useFakeTimers();
tap.teardown(() => clock.restore());

tap.test('observable', async (t) => {
    await t.test('clone', async (t) => {
        await t.test('normal values', (t) => {
            const value = new ObservableClone();

            t.plan(2);

            const data = [1, 2, 3];
            value(data);
            t.notEqual(value.value, data, 'clone observable stores a copy of the value');
            t.deepEqual(value.value, [1, 2, 3], 'clone observable should have value [1, 2, 3]');
        });
        await t.test('date values', (t) => {
            const value = new ObservableClone();

            t.plan(3);

            const data = new Date('2014-01-01T23:28:56.000Z');
            value(data);
            t.notEqual(value.value, data, 'clone observable stores a copy of the value');
            t.deepEqual(value.value, data, 'clone observable should have value 2014-01-01T23:28:56.000Z');
            t.pass(value.value instanceof Date, 'Is a date object');
        });
    });
});
