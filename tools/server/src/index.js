import m from 'mithril';
import IO from 'socket.io-client';
import debug from 'debug';
import { Observable } from './utils/observable';
import { App } from './app';

import 'spectre.css/dist/spectre.min.css';
import 'spectre.css/dist/spectre-icons.min.css';
import './main.scss';

const log = debug('{main}');

const Main = {
    oninit() {
        this.socket = new Observable();
        const disposables = [];
        connect(this.socket, disposables);
    },

    view() {
        if (this.socket.value) {
            return <App socket={this.socket.value} />;
        }
        return (
            <div class="container">
                <div class="loading loading-lg"></div>
            </div>
        );
    }
};

const rootElement = document.querySelector('.content');
m.mount(rootElement, Main);

function connect(onInit = () => {}, disposables = []) {
    const socket = IO();
    const listen = socket.on.bind(socket);
    socket.on = (topic, listener) => {
        const dispose = () => socket.off(topic, listener);
        dispose.topic = topic;
        dispose.listener = listener;
        disposables.push(dispose);
        listen(topic, listener);
        return () => {
            const dispose = disposables.find(d => d.topic === topic && d.listener === listener);
            if (dispose) {
                dispose();
                const index = disposables.indexOf(dispose);
                disposables.splice(index, 1);
            }
        };
    };
    socket.on('connected', (timestamp) => log(new Date(timestamp)));
    socket.on('disconnect', () => setTimeout(() => {
        disposables.forEach(dispose => dispose());
        disposables.length = 0;
        connect(onInit);
    }, 1000));
    onInit(socket);
    socket.on('connected', m.redraw);
    socket.on('logs', m.redraw);
    socket.on('weather', m.redraw);
    socket.on('message', m.redraw);
    socket.on('exec', m.redraw);
    socket.on('data', m.redraw);
}
