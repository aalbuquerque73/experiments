export default class Functions {
    constructor() {
        this.fn1 = function() { return this; };
        this.fn2 = () => this;
        this.fn4 = this.fn3.bind(this);
    }

    fn3() {
        return this;
    }
}
