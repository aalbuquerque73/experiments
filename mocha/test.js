import chai from 'chai';

const expect = chai.expect;

before(function() {
	console.log('> global before');
	expect(true).to.be.ok;
});

beforeEach(function() {
	console.log('> global before each');
	expect(true).to.be.ok;
});

afterEach(function() {
	console.log('> global after each');
	expect(true).to.be.ok;
});

after(function() {
	console.log('> global after');
	expect(true).to.be.ok;
});

describe('first level', function() {
	before(function() {
		console.log('=> first level before');
		expect(true).to.be.ok;
	});

	beforeEach(function() {
		console.log('=> first level before each');
		expect(true).to.be.ok;
	});

	afterEach(function() {
		console.log('=> first level after each');
		expect(true).to.be.ok;
	});

	after(function() {
		console.log('=> first level after');
		expect(true).to.be.ok;
	});

	it('should pass', function() {
		expect(true).to.be.ok;
	});

	describe('second level', function() {
		before(function() {
			console.log('==> second level before');
			expect(true).to.be.ok;
		});

		beforeEach(function() {
			console.log('==> second level before each');
			expect(true).to.be.ok;
		});

		afterEach(function() {
			console.log('==> second level after each');
			expect(true).to.be.ok;
		});

		after(function() {
			console.log('==> second level after');
			expect(true).to.be.ok;
		});

		it('should pass', function() {
			expect(false).to.not.be.ok;
		});

		it('should also pass', function() {
			expect(true).to.be.ok;
		});

		describe('third level', function() {
			before(function() {
				console.log('===> third level before');
				expect(true).to.be.ok;
			});

			beforeEach(function() {
				console.log('===> third level before each');
				expect(true).to.be.ok;
			});

			afterEach(function() {
				console.log('===> third level after each');
				expect(true).to.be.ok;
			});

			after(function() {
				console.log('===> third level after');
				expect(true).to.be.ok;
			});

			it('should be ok', function() {
				expect(true).to.be.ok;
			});

			it('should not be ok', function() {
				expect(true).to.not.be.ok;
			});
		});
	});

	describe('another second level', function() {
		before(function() {
			console.log('==> another second level before');
			expect(true).to.be.ok;
		});

		beforeEach(function() {
			console.log('==> another second level before each');
			expect(true).to.be.ok;
		});

		afterEach(function() {
			console.log('==> another second level after each');
			expect(true).to.be.ok;
		});

		after(function() {
			console.log('==> another second level after');
			expect(true).to.be.ok;
		});

		it('should be ok', function() {
			expect(true).to.be.ok;
		});

		it('should also be ok', function() {
			expect(false).to.not.be.ok;
		});
	});
});
