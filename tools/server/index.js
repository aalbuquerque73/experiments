const fs = require('fs');
const path = require('path');
const low = require('lowdb');
const _ = require('lodash');
const FileSync = require('lowdb/adapters/FileSync');
const HttpServer = require('./http-server');
const WebSockets = require('./web-sockets');

const folder = path.join(__dirname, 'data');
if (!fs.existsSync(folder)){
    fs.mkdirSync(folder, { recursive: true });
}

const adapter = new FileSync(path.join(folder, 'db.json'));
const db = low(adapter);
db.setState({})
  .write();


const filters = {};
const DB = {
    get(data, io, socket) {
        if (data && data.table) {
            const payload = {
                meta: {
                    table: data.table,
                    currentPage: data.page || 1,
                    pageSize: data.size || 25
                },
                data: []
            };
            const table = data.distinct
                ? db.defaults({ [data.table]: [] })
                    .get(data.table)
                    .reverse()
                    .uniqBy(data.distinct)
                    .reverse()
                    .filter(item => !filters[data.table] || item.label.indexOf(filters[data.table]) > -1)
                    .chunk(payload.meta.pageSize)
                    .value()
                : db.defaults({ [data.table]: [] })
                    .get(data.table)
                    .filter(item => !filters[data.table] || item.label.indexOf(filters[data.table]) > -1)
                    .chunk(payload.meta.pageSize)
                    .value();
            payload.data = table[payload.meta.currentPage - 1];
            payload.meta.pageCount = table.length;
            payload.meta.total = table.reduce((current, next) => current + next.length, 0);
            socket.emit('data', payload);
        }
    },

    put(tableName, data) {
        const table = db.defaults({ [tableName]: [] })
            .get(tableName);
        return table
            .push(data)
            .last()
            .assign({ id: Date.now() })
            .write();
    },

    filter(filter, observable, io, socket) {
        const data = observable.value;
        const payload = {
            meta: {
                table: data.table,
                currentPage: data.page || 1,
                pageSize: data.size || 25
            },
            data: []
        };
        filters[data.table] = filter;
        const table = data.distinct
            ? db.defaults({ [data.table]: [] })
                .get(data.table)
                .reverse()
                .uniqBy(data.distinct)
                .reverse()
                .filter(item => !filter || item.label.indexOf(filter) > -1)
                .chunk(payload.meta.pageSize)
                .value()
            : db.defaults({ [data.table]: [] })
                .get(data.table)
                .filter(item => !filter || item.label.indexOf(filter) > -1)
                .chunk(payload.meta.pageSize)
                .value();
        payload.data = table[payload.meta.currentPage - 1];
        payload.meta.pageCount = table.length;
        payload.meta.total = table.reduce((current, next) => current + next.length, 0);
        socket.emit('data', payload);
    },

    clear(table) {
        if (table) {
            db.defaults({ [table]: [] })
                .set(table, [])
                .write();
            return;
        }
        db.setState({})
            .write();
    },

    shrink() {
        const state = db.getState();

        Object.keys(state)
            .forEach((key) => {
                state[key] = state[key]
                    .map((payload) => {
                        if (typeof payload.message === 'string') {
                            payload.message = payload.message.replace(/[\u001b\u009b]\[\??\d*[GJABKLMPXghil]/g, '');
                        }
                        return payload;
                    })
                    .filter(payload => !_.isEmpty(payload.message));
            });
        db.setState(state)
            .write();
    },
};

WebSockets.init(HttpServer, DB);
HttpServer.listen(1234, () => console.log('Server started on port 1234'));

module.exports = {
    emit(topic, message, label) {
        const table = db.defaults({ [topic]: [] })
            .get(topic);
        const newPost = table
            .push({ topic, message, label })
            .last()
            .assign({ id: Date.now() })
            .write();
        WebSockets.emit(topic, newPost);
    },
    on(...args) {
        return WebSockets.on(...args);
    }
};
