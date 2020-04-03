import m from 'mithril';
import URL from 'url';
import { Observable } from './utils/observable';
import { Panel } from './component/panel';

export const Terminal = {
    oninit({ attrs }) {
        const { socket, table } = attrs;
        this._disposables = [];
        this.data = new Observable([])
            .filter(value => Array.isArray(value))
            .map(value => value.map(item => item.message))
            .map(value => value.pop());
        this.meta = new Observable({})
            .filter((value, old) => value !== old);
        const payload = new Observable()
            .filter(value => value.meta && (value.meta.table === table))
            .each(value => this.meta(value.meta))
            .each(value => this.data(value.data));
        this._disposables.push(socket.on('data', payload));
        socket.emit('message', { type: 'get', table, size: 50 });
    },

    view({ attrs }) {
        const { socket, table } = attrs;
        return (
            <Panel class="pane shadow">
                <ul class="menu">
                    {Object.keys(this.data.value).map(item => <Item socket={socket} table={table} name={item} data={this.data.value[item]}></Item>)}
                </ul>
            </Panel>
        );
    }
};

const Item = {
    oninit({ attrs }) {
        const { socket, table } = attrs;
        this.onclick =(ev) => {
            ev.preventDefault();
            const url = URL.parse(ev.target.href);
            socket.emit('exec', { type: table, target: url.hash.replace('#', '').replace('%20', ' ') });
        };
    },
    view({ attrs }) {
        const { data, name } = attrs;
        return (
            <li>
                <a class={`${data.running ? 'active' : ''}`} href={`#${name}`} onclick={this.onclick}>
                    {name}
                    {data.running ? <i class="icon icon-stop"></i> : null}
                </a>
            </li>
        );
    }
};
