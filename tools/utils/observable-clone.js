const _ = require('underscore');
const { Observable } = require('./observable');

function ObservableClone(value) {
    return new Observable(value, (internal) => {
        const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.{0,1}\d*))(?:Z|(\+|-)([\d|:]*))?$/;
        const parser = (key, value) => {
            let parsedValue = value;
            if (typeof value === 'string') {
                const a = reISO.exec(value);
                if (a) {
                    parsedValue = new Date(value);
                }
            }
            return parsedValue;
        };
        internal.mappers.push(value => JSON.parse(JSON.stringify(value), parser));
    });
}
module.exports.ObservableClone = ObservableClone;
