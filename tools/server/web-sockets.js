const SIO = require('socket.io');
const { EventEmitter } = require('events');
const { Observable } = require('../utils/observable');
const { ObservableEmitter } = require('../utils/observable-emitter');
const { ObservableArray } = require('../utils/observable-array');

const emitter = new EventEmitter();

module.exports = {
    init(server, DB) {
        const io = new SIO(server);

        io.on('connection', function connection(socket) {
            socket.emit('connected', Date.now());
            io.emit(`user ${socket.id} connected`);

            const payload = new ObservableArray()
                .map(value => ({ page: 1, ...value }));

            const listener = new ObservableEmitter(emitter)
                .on('logs')
                .on('docker')
                .on('npm')
                .on('projects')
                .each(value => DB.get(payload.get(value.topic).value, io, socket))
                .each(value => socket.emit('data', value));

            socket.on('disconnect', function close() {
                io.emit(`user ${socket.id} disconnected`);
                listener.off();
            });
            socket.on('message', function incoming(data) {
                if (typeof DB[data.type] === 'function') {
                    payload.put(data.table, data);
                    DB[data.type](data, io, socket);
                }
            });
            socket.on('exec', function incoming(data) {
                const newPost = DB.put('logs', { message: JSON.stringify(data), label: 'exec' });
                emitter.emit('logs', newPost);
                emitter.emit('exec', data);
            });
            socket.on('filter', function incoming(filter) {
                DB.filter(filter, payload.get('logs'), io, socket);
            });
            socket.on('clear', function incoming() {
                DB.clear('logs');
                payload.forEach(observable => DB.get(observable.value, io, socket));
            });
            socket.on('shrink', function incoming() {
                DB.shrink();
                payload.forEach(observable => DB.get(observable.value, io, socket));
            });
        });
    },
    emit(topic, post) {
        emitter.emit(topic, post);
    },
    on(topic, callback) {
        emitter.on(topic, callback);
        return () => emitter.removeListener(topic, callback);
    }
};
