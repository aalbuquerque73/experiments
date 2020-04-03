const blessed = require('blessed');

const { Node, List } = blessed;
function Log(options) {
    if (!(this instanceof Node)) {
        return new Log(options);
    }

    options = options || {};
    options.bufferLength = options.bufferLength || 30;
    options.db = options.db || { emit() {} };
    this.options = options;
    List.call(this, options);

    this.logLines = [];
    this.interactive = false;
}

Log.prototype = Object.create(List.prototype);
Log.prototype.log = function (str, label = 'logs', table = 'logs') {
    if (this.options.db && this.options.db.emit) {
        str.trim()
            .split('\n')
            .map(str => str.trim())
            .filter(str => str)
            .forEach(str => this.options.db.emit(table, str, label));
    }
    str.replace('\r', '')
        .split('\n')
        // .map(line => line.match(/.{1,110}/g))
        .reduce((list, item) => list.concat(item), [])
        .filter(line => line)
        .map(line => line.replace(/[\u001b\u009b]\[\??\d*[GJAKLMPXghil]/g, '').replace(/[\u001b\u009b]\[\d{1,2};\d{1,2}[H]/g, ''))
        .forEach(line => this.logLines.push(line));
    if (this.logLines.length>this.options.bufferLength) {
        this.logLines.shift();
    }
    if (typeof this.options.filter === 'function') {
        const data = this.logLines.filter(this.options.filter);
        this.setItems(data);
        this.scrollTo(data.length);
        return;
    }
    this.setItems(this.logLines);
    this.scrollTo(this.logLines.length);
};
Log.prototype.write = function (ch) {
    if (this.logLines.length === 0) {
        this.logLines.push(ch);
        return;
    }
    this.logLines[this.logLines.length - 1] += ch;
    if (typeof this.options.filter === 'function') {
        const data = this.logLines.filter(this.options.filter);
        this.setItems(data);
        this.scrollTo(data.length);
        return;
    }
    this.setItems(this.logLines);
}
Log.prototype.reflow = function () {
    if (typeof this.options.filter === 'function') {
        const data = this.logLines.filter(this.options.filter);
        this.setItems(data);
        this.scrollTo(data.length);
        return;
    }
    this.setItems(this.logLines);
    this.scrollTo(this.logLines.length);
};
Log.prototype.type = 'log';

module.exports = Log;
