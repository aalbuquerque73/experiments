const tap = require('tap');
const sinon = require('sinon');
const { ObservableCallable } = require('../../../utils/observable-callable');

const clock = sinon.useFakeTimers();
tap.teardown(() => clock.restore());

tap.test('observable', async (t) => {
    await t.test('call', (t) => {
        const observer = sinon.fake();
        const value = new ObservableCallable(observer);

        t.plan(2);
        value.call(1, 2, 3);
        t.pass(observer.calledOnce, 'observer should have been called once');
        t.pass(observer.calledWith(1, 2, 3), 'observer should have been called with value (1, 2, 3)');
    });
});
