const contrib = require('blessed-contrib');
const request = require('request');

const fetch = (url) => new Promise((resolve, reject) => request(url, (err, res, body) => {
    if (err) {
        reject(err);
        return;
    }
    resolve(body);
}));
const apiKey = 'aab82c2f8fc43e06eb5286bbf2555c3d';
const weather = city => fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`).then(JSON.parse);

function updateMap(map, log, screen, DB) {
    Promise.all([weather('Malmo, SE'), weather('Castro Daire, PT')])
        .then(list => list.forEach((w) => {
            DB.emit('weather', w, 'weather');
            map.addMarker(Object.assign({
                color: w.main.temp < 0 ? 'red' : w.main.temp < 15 ? 'yellow' : 'green',
                char: `${w.sys.country} ${w.main.temp}°`
            }, w.coord));
        }))
        .then(() => setTimeout(() => updateMap(map, log, screen, DB), 30 * 60 * 1000))
        .then(() => screen.render())
        .catch(error => log.log(`WeatherStation\t| ${error.message}`));
}
const weatherOptions = {
    label: 'Weather Station',
    excludeAntartica: true,
    style: {
        shapeColor: 'green'
    },
};
module.exports = (grid, log, DB) => {
    const map = grid.set(6, 6, 6, 6, contrib.map, weatherOptions);
    setTimeout(() => updateMap(map, log, grid.screen, DB), 1000);
    return map;
};
