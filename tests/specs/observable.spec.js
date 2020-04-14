const tap = require('tap');
const sinon = require('sinon');
const { Observable } = require('../../src/observable');

tap.test('observable', async (t) => {
    await t.test('value', (t) => {
        const value = new Observable(0);

        t.equal(value(), 0, 'observable should return 0');
        t.equal(value.value, 0, 'observable should have value 0');
        value(2);
        t.equal(value(), 2, 'observable should return 2');
        t.equal(value.value, 2, 'observable should have value 2');
        t.end();
    });
    await t.test('subscribe', (t) => {
        let v1 = 1, v2 = v1;
        const value = new Observable(v1);
        value.subscribe(value => v1 = value);
        value.subscribe(value => v2 = value);
        
        t.equal(v1, value.value);
        t.equal(v2, value.value);
        t.equal(value.value, 1);

        value(2);
        t.equal(v1, value.value);
        t.equal(v2, value.value);
        t.equal(value.value, 2);

        value(3);
        t.equal(v1, value.value);
        t.equal(v2, value.value);
        t.equal(value.value, 3);
        t.end();
    });
    await t.test('dispose', (t) => {
        let v = 1;
        const value = new Observable(v);
        const dispose = value.subscribe(value => v = value);
        
        t.equal(v, value.value);
        t.equal(value.value, 1);

        value(2);
        t.equal(v, value.value);
        t.equal(value.value, 2);
        dispose();

        value(3);
        t.equal(v, value.value - 1);
        t.equal(value.value, 3);

        value(4);
        t.equal(v, value.value - 2);
        t.equal(value.value, 4);
        t.end();
    });
    await t.test('each', (t) => {
        let v1 = 1, v2 = v1;
        const value = new Observable(v1);
        value.each(value => v1 = value);
        value.each(value => v2 = value);
        
        t.equal(v1, value.value);
        t.equal(v2, value.value);
        t.equal(value.value, 1);

        value(2);
        t.equal(v1, value.value);
        t.equal(v2, value.value);
        t.equal(value.value, 2);

        value(3);
        t.equal(v1, value.value);
        t.equal(v2, value.value);
        t.equal(value.value, 3);
        t.end();
    });
    await t.test('map', (t) => {
        let v = 1;
        const value = new Observable(v)
            .map(value => value * 2)
            .each(value => v = value);
        
        t.equal(v, value.value);
        t.equal(value.value, 1);

        value(2);
        t.equal(v, value.value);
        t.equal(value.value, 4);

        value(3);
        t.equal(v, value.value);
        t.equal(value.value, 6);
        t.end();
    });
    await t.test('filter', (t) => {
        let v = 1;
        const value = new Observable(v)
            .filter(value => value > 2)
            .each(value => v = value);
        
        t.equal(v, value.value);
        t.equal(value.value, 1);

        value(2);
        t.equal(v, value.value);
        t.equal(value.value, 1);

        value(3);
        t.equal(v, value.value);
        t.equal(value.value, 3);
        t.end();
    });
    await t.test('filter after', (t) => {
        let v = 0;
        const value = new Observable(v)
            .filter(value => value > 2, true)
            .map(value => value * 2)
            .each(value => v = value);
        
        t.equal(v, value.value);
        t.equal(value.value, 0);

        value(1);
        t.equal(v, value.value);
        t.equal(value.value, 0);

        value(2);
        t.equal(v, value.value);
        t.equal(value.value, 4);

        value(3);
        t.equal(v, value.value);
        t.equal(value.value, 6);
        t.end();
    });

    await t.test('Observable.unwrap', (t) => {
        const value = {
            name: new Observable(''),
            type: new Observable(''),
        };

        t.deepEqual(Observable.unwrap(value), { name: '', type: '' }, 'Observable initialized with empty name and type');
        value.name('John Doe');
        value.type({ id: 1, name: 'Doe' });
        t.deepEqual(Observable.unwrap(value), { name: 'John Doe', type: { id: 1, name: 'Doe' } }, 'Observable unwrap to an object');
        t.end();
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

        t.deepEqual(Observable.unwrap(value, map), { name: '', type: { name: '' } }, 'Observable initialized with empty name and type');
        value.name('John Doe');
        value.type({ id: 1, name: 'Doe' });
        t.deepEqual(Observable.unwrap(value, map), { name: 'John Doe', type: { id: 1, name: 'Doe' } }, 'Observable unwrap to an object');
        t.end();
    });

    await t.test('clone', async (t) => {
        await t.test('normal values', (t) => {
            const value1 = new Observable(1);
            const value2 = value1.clone();
            
            t.equal(value1.value, 1);
            t.equal(value2.value, 1);
    
            value1(2);
            t.equal(value1.value, 2);
            t.equal(value2.value, 1);
    
            value1(3);
            t.equal(value1.value, 3);
            t.equal(value2.value, 1);
    
            value2(2);
            t.equal(value1.value, 3);
            t.equal(value2.value, 2);
    
            value2(3);
            t.equal(value1.value, 3);
            t.equal(value2.value, 3);
            t.end();
        });
        await t.test('date values', (t) => {
            const value1 = new Observable(1);
            const value2 = value1.clone();

            const data = new Date('2014-01-01T23:28:56.000Z');
            value1(data);
            t.deepEqual(value1.value, data);
            t.equal(value2.value, 1);
            t.ok(value1.value instanceof Date);
            t.equal(typeof value2.value, 'number');
            t.end();
        });
    });
});
