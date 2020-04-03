import m from 'mithril';
import { Observable } from './utils/observable';
import logo from './logo.png';
import './header.scss';

const empty = [];
export const Header = {
    oninit({ attrs }) {
        const { socket } = attrs;
        this._disposables = [];
        this.date = new Observable(new Date())
            .map(value => new Date(+value))
            .each(console.log);

        this.data = new Observable(empty)
            .filter((value, old) => value !== old)
            .map(data => data.map(line => line.message))
            .each(console.log.bind(console, '{data}'));
        const payload = new Observable()
            .filter(value => value.meta && (value.meta.table === 'weather'))
            .each(value => this.data(value.data || empty))
            .each(console.log.bind(console, '{payload}'));
        this._disposables.push(socket.on('connected', this.date));
        this._disposables.push(socket.on('data', payload));
        socket.emit('message', { type: 'get', table: 'weather', distinct: 'message.name', size: 50 });
    },
    onremove() {
        this._disposables.forEach(dispose => dispose());
    },
    view() {
        return (
            <section class="header">
                <h1 class="header"><img class="logo" src={logo} /> Developer Dashboard</h1>
                <div class="expandable"></div>
                <table class="header">
                    <tr class="legend">
                        <th colSpan="4">{this.date}</th>
                    </tr>
                    {this.data.value.map(w => <Weather data={w}></Weather>)}
                </table>
            </section>
        );
    }
};

const Weather = {
    view({ attrs }) {
        const { data } = attrs;
        const className = data.main.temp < 0 ? 'red' : data.main.temp < 15 ? 'yellow' : 'green';
        return (
            <tr class={data.label}>
                <td>{data.name}, {data.sys.country}:</td>
                <td class={className}>{data.main.temp}°</td>
                <td><img src={`/weather/flags/${data.sys.country.toLowerCase()}.png`} /></td>
                <td>
                    <ul class="weather">
                        {data.weather.map(w => <li>{w.description} <img class="icon" src={`/weather/icons/${w.icon}@2x.png`} /></li>)}
                    </ul>
                </td>
            </tr>
        );
    }
};
