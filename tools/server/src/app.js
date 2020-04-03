import m from 'mithril';
import debug from 'debug';
import { Bus } from './utils/bus';
import { Observable } from './utils/observable';
import { Panel } from './component/panel';
import { Header } from './header';
import { Pagination } from './pagination';
import { List } from './list';
import { Terminal } from './terminal';

const logs = {
    page: debug('{page}'),
    date: debug('{date}'),
    meta: debug('{meta}'),
    payload: debug('{payload}'),
};

const empty = [];
export const App = {
    oninit({ attrs }) {
        this._disposables = [];
        const page = new Observable(0)
            .filter((value, old) => value !== old)
            .map(value => value === 'Next' ? this.meta.value.currentPage + 1 : value)
            .map(value => value === 'Previous' ? this.meta.value.currentPage - 1 : value)
            .map(value => parseInt(value, 10))
            .each(logs.page);

        this.useLatest = new Observable(false)
            .filter((value, old) => value !== old)
            .map((value, old) => !old)
        this.scrollToLast = new Observable(false)
            .filter((value, old) => value !== old)
            .map((value, old) => !old);

        this.meta = new Observable({})
            .filter((value, old) => value !== old)
            .each(value => this.useLatest.value && page.value !== value.pageCount ? page(value.pageCount) : null)
            .each(logs.meta);

        this.data = new Observable(empty)
            .filter((value, old) => value !== old)
            .map(value => value.map(line => (line.message = line.message.replace(/[\u001b\u009b]\[\??\d*[GJABKLMPXghil]/g, ''), line)));

        this.filter = new Observable('')
            .filter((value, old) => value !== old)
            .filter(value => typeof value === 'string', true)
            .map(value => value.target ? value.target.value : value)
            .each(value => socket.emit('filter', value));

        this.highlight = new Observable('')
            .filter((value, old) => value !== old)
            .filter(value => typeof value === 'string', true)
            .map(value => value.target ? value.target.value : value)
            .map(value => value.toLowerCase());

        const payload = new Observable()
            .filter(value => value.meta && (value.meta.table === 'logs'))
            .each(value => this.meta(value.meta))
            .each(value => this.data(value.data || empty))
            .each(logs.payload);

        this._disposables.push(Bus.listen('page', page));
        const { socket } = attrs;
        this._disposables.push(socket.on('data', payload));
        socket.emit('message', { type: 'get', table: 'logs', size: 50 });
        page.subscribe(page => socket.emit('message', { type: 'get', table: 'logs', page, size: 50 }));

        this.clear = () => socket.emit('clear');
        this.shrink = () => socket.emit('shrink');
    },
    onremove() {
        this._disposables.forEach(dispose => dispose());
    },
    view({ attrs }) {
        const { socket } = attrs;
        return [
            <Header socket={socket}></Header>,
            <div class="container">
                <div class="columns">
                    <Panel class="col-8 dashboard">
                        <Panel class="horizontal no-border mb-2 columns bottom">
                            <table class="display col-6">
                                <tr>
                                    <td colSpan="2"><label><input type="checkbox" checked={this.useLatest.value} onclick={ev => this.useLatest(ev)} /> Display last page</label></td>
                                </tr>
                                <tr>
                                    <td colSpan="2"><label><input type="checkbox" checked={this.scrollToLast.value} onclick={ev => this.scrollToLast(ev)} /> Scroll to last message</label></td>
                                </tr>
                                <tr>
                                    <td><label for="filter">Filter:</label></td> <td><input id="filter" oninput={ev => this.filter(ev)} value={this.filter.value} /></td>
                                </tr>
                                <tr>
                                    <td><label for="highlight">Highlight:</label></td> <td><input id="highlight" oninput={ev => this.highlight(ev)} value={this.highlight.value} /></td>
                                </tr>
                            </table>
                            {/* <ul class="display col-6">
                                <li><button class="btn" type="button" onclick={this.clear}>Clear</button></li>
                                <li><button class="btn" type="button" onclick={this.shrink}>Shrink</button></li>
                            </ul> */}
                        </Panel>
                        <Pagination {...this.meta.value}></Pagination>
                        <Panel class="scrollable">
                            <div><List class="display" scrollToLast={this.scrollToLast.value} data={this.data.value} highlight={this.highlight}></List></div>
                        </Panel>
                        <Pagination {...this.meta.value}></Pagination>
                    </Panel>
                    <Panel class="col-4 pane">
                        <Terminal socket={socket} table="projects"></Terminal>
                        <Terminal socket={socket} table="npm"></Terminal>
                        <Terminal socket={socket} table="docker"></Terminal>
                    </Panel>
                </div>
            </div>
        ];
    }
};
