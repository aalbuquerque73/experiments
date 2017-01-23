import chai from 'chai';
const expect = chai.expect;

import main from './src/main';
import m1 from './src/module1';
import m2 from './src/module2';
import m3 from './src/module3';

import { Main } from './src/main';
import { Module1 } from './src/module1';
import { Module2 } from './src/module2';
import { Module3 } from './src/module3';

import Functions from './src/functions';

// https://babeljs.io/learn-es2015/
describe('es6', function() {
    describe('imports', function() {
        it('should import internal name', function() {
            expect(main.internalName).to.equal(m1);
        });

        it('should import default as name', function() {
            expect(main.modules.m2).to.equal(m2);
        });

        it('should import default', function() {
            expect(main.modules.m3).to.equal(m3);
        });
    });

    describe('classes', function() {
        const main = new Main();

        it('should create a class', function() {
            expect(main).to.exist;
        });

        it('should have property m1', function() {
            expect(main).to.have.property('m1');
            expect(main.m1).to.be.an.instanceof(Module1);
        });

        it('should have property m2', function() {
            expect(main).to.have.property('m2');
            expect(main.m2).to.be.an.instanceof(Module1);
            expect(main.m2).to.be.an.instanceof(Module2);
        });

        it('should have property m3', function() {
            expect(main).to.have.property('m3');
            expect(main.m3).to.be.an.instanceof(Module3);
        });
    });

    describe('objects', function() {
        const fns = new Functions();
        const fn1 = fns.fn1, fn2 = fns.fn2, fn3 = fns.fn3, fn4 = fns.fn4;

        it('should have properties', function() {
            expect(fns).to.not.be.empty;
        });

        it('should chain', function() {
            expect(fns.fn1(), 'fn1').to.equal(fns);
            expect(fns.fn2(), 'fn2').to.equal(fns);
            expect(fns.fn3(), 'fn3').to.equal(fns);
            expect(fns.fn4(), 'fn4').to.equal(fns);
        });

        it('should have fn1 and fn3 unbound', function() {
            expect(fns.fn1(), 'fn1').to.not.equal(fn1());
            expect(fns.fn3(), 'fn3').to.not.equal(fn3());
        });

        it('should have fn2 and fn4 bound', function() {
            expect(fns.fn2(), 'fn2').to.equal(fn2());
            expect(fns.fn4(), 'fn4').to.equal(fn4());
        });
    });

    describe('template strings', function() {
        const one = 1;
        const two = 2;

        it('should equal one', function() {
            const tOne = `one=${one}`;
            expect(tOne).to.equal('one=1');
        });

        it('should equal two', function() {
            const tTwo = `two=${two}`;
            expect(tTwo).to.equal('two=2');
        });
    });

    describe('destructuring', function() {
        const { x, y } = m1;

        it('should have correct values', function() {
            expect(x).to.equal(m1.x);
            expect(y).to.equal(m1.y);
        });

        it('should be deep equal', function() {
            expect({ x, y }).to.be.deep.equal(m1);
        });
    });

    describe('default, rest, spread', function() {
        const fn = function(a = 0, ...args) { return [a, ...args]; };

        it('should use default argument', function() {
            const args = fn(undefined, 2, 3);
            expect(args, '0').to.contain(0);
            expect(args, '1').to.not.contain(1);
            expect(args, '2').to.contain(2);
            expect(args, '3').to.contain(3);
        });

        it('should give the Rest arguments', function() {
            const args = fn(1, 2, 3);
            expect(args, '1').to.contain(1);
            expect(args, '2').to.contain(2);
            expect(args, '3').to.contain(3);
        });

        it('should give Spread result', function() {
            const args = fn(1, 2, 3);
            const list = [ 0, ...args ];
            expect(list).to.deep.equal([0, 1, 2, 3]);
        });
    });

    describe('promises', function() {
        const promisify = (duration, failDuration=100) => new Promise((resolve, reject) => setTimeout(resolve, duration) && setTimeout(reject, failDuration));

        // async calls need 'done' call
        it('should resolve after \'duration\' delay', function(done) {
            promisify(10)
                .then(() => {
                    expect(true).to.be.true;
                    done();
                });
        });

        it('should reject if duration > 100', function(done) {
            promisify(200)
                .then(() => {
                    expect(true).to.be.false;
                    done();
                })
                .catch(() => {
                    expect(true).to.be.true;
                    done();
                });
        });

        it('should catch errors as reject', function(done) {
            promisify(10)
                .then(() => {
                    throw new Error('an error happened');
                    expect(true).to.be.false;
                    done();
                })
                .catch((err) => {
                    expect(err.message).to.equal('an error happened');
                    done();
                });
        });
    });

    describe('helpers', function() {
        it('should have Number helpers', function() {
            expect(Number.EPSILON).to.exist;
            expect(Number.isInteger).to.exist;
            expect(Number.isNaN).to.exist;
        });

        it('should have Math functions', function() {
            expect(Math.acosh).to.exist;
            expect(Math.hypot).to.exist;
            expect(Math.imul).to.exist;
        });

        it('should have Array helpers', function() {
            const arrayLike = {
                '0': 'a',
                '1': 'b',
                '2': 'c',
                length: 3
            };
            const array = [ 'a', 'b', 'c' ];
            expect(Array.from(arrayLike)).to.deep.equal(['a', 'b', 'c']);
            expect(Array.of(1, 2, 3)).to.deep.equal([1, 2, 3]);
            expect([0, 0, 0].fill(5, 1)).to.deep.equal([0, 5, 5]);
        });

        it('should have Object.assign', function() {
            const point = { x: 1, y: 2 };
            const newPoint = Object.assign({}, point, { origin: { x: 2, y: 3 }});
            expect(newPoint).to.have.property('x');
            expect(newPoint).to.have.property('y');
            expect(newPoint).to.deep.equal({ x: 1, y: 2, origin: { x: 2, y: 3 }});
        });
    });
});
