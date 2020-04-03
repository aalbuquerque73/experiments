const tap = require('tap');
const sinon = require('sinon');
const { EventEmitter } = require('events');
const childProcess = require('child_process');

const sandbox = sinon.createSandbox();
const spawner = new EventEmitter();
spawner.stdout = new EventEmitter();
spawner.stderr = new EventEmitter();

sandbox.stub(childProcess, 'spawn').returns(spawner);
tap.teardown(() => sandbox.restore());

const exec = require('../../../utils/exec');

tap.test('exec', async (t) => {
    await t.test('callback', (t) => {
        const logger = {
            log: sandbox.stub(),
        };
        t.plan(1);
        const tester = child => t.equal(child, spawner, 'should pass spawner through a callback');
        exec('ls', ['-las'], { cwd: '.' }, logger, tester);
    });
    await t.test('stdout', (t) => {
        let log = null;
        const logger = {
            log: sandbox.stub(message => log = message),
        };
        t.plan(1);
        exec('ls', ['-las'], { cwd: '.' }, logger)
            .then(res => t.equal(log, 'stdout', 'should read from stdout') || res);;
        spawner.stdout.emit('data', 'stdout');
        spawner.emit('close', 0);
    });
    await t.test('stderr', (t) => {
        let log = null;
        const logger = {
            log: sandbox.stub(message => log = message),
        };
        t.plan(1);
        exec('ls', ['-las'], { cwd: '.' }, logger)
            .then(res => t.equal(log, 'stderr', 'should read from stderr') || res);;
        spawner.stderr.emit('data', 'stderr');
        spawner.emit('close', 0);
    });
    await t.test('error', (t) => {
        let log = null;
        const logger = {
            log: sandbox.stub(message => log = message),
        };
        t.plan(1);
        exec('ls', ['-las'], { cwd: '.' }, logger)
            .then(res => t.equal(log, 'Error: an error occur', 'should catch errors') || res);;
        spawner.emit('error', new Error('an error occur'));
        spawner.emit('close', 0);
    });
    await t.test('exit code', async (t) => {
        await t.test('code 0', (t) => {
            t.plan(2);
            exec('ls', ['-las'], { cwd: '.' })
                .then(res => {
                    t.equal(res.child, spawner, 'should have spawner as child');
                    t.equal(res.code, 0, 'should have exit code 0') ;
                })
            spawner.emit('close', 0);
        });
        await t.test('code non 0', (t) => {
            t.plan(1);
            exec('ls', ['-las'], { cwd: '.' })
                .catch(code => t.equal(code, 1, 'should have exit code 1'));
            spawner.emit('close', 1);
        });
    });
});
