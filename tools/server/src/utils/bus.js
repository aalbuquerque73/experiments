import debug from 'debug';
import { EventEmitter } from 'events';

const Log = debug('{bus}');

const emitter = new EventEmitter();

export const Bus = {};

Bus.listen = (topic, callback) => {
    const logger = (...args) => {
        Log(`listen (%s) ${args.map(() => '%o').join(' ')}`, topic, ...args);
        callback(...args);
    };
    emitter.on(topic, logger);
    return () => emitter.removeListener(topic, logger);
};

Bus.emit = (...args) => {
    Bus.emitLocal(...args);
    Log('Send %o', args);
};


Bus.emitLocal = (...args) => {
    emitter.emit(...args);
};


Bus.emitEvent = (name, data, dom = document) => {
    const event = new CustomEvent(name, { detail: data });
    dom.dispatchEvent(event);
};

Bus.listenEvent = (name, callback, dom = document) => {
    const logger = (...args) => {
        Log(`listen (%s) event ${args.map(() => '%o').join(' ')}`, name, ...args);
        callback(...args);
    };
    dom.addEventListener(name, logger);
    return () => dom.removeEventListener(name, logger);
};

Bus.emit.local = Bus.emitLocal;
Bus.emit.event = Bus.emitEvent;
Bus.listen.event = Bus.listenEvent;
Bus.emit.window = (name, data) => window.dispatchEvent(new CustomEvent(name, { detail: data }));
Bus.listen.window = (name, callback) => {
    const logger = (...args) => {
        Log(`listen window ${args.map(() => '%o').join(' ')}`, ...args);
        callback(...args);
    };
    window.addEventListener(name, logger);
    return () => document.removeEventListener(name, logger);
};


// TODO: http://transportlead.westeurope.cloudapp.azure.com/issues/63
export function MiniBus() {
    const bus = new EventEmitter();
    return {
        listen(topic, callback) {
            bus.addListener(topic, callback);
            return () => bus.removeListener(topic, callback);
        },
        emit(topic, ...args) {
            bus.emit(topic, ...args);
            return this; // allows to chain emits
        }
    };
}
