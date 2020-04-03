#!/usr/bin/env node
'use strict';

const path = require('path');
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const request = require('request');

const screen = blessed.screen({
    smartCSR: true,
    autoPadding: true,
    mouse: true,
    cursor: {
        shape: 'underline',
        blink: true,
        color: 'white',
        sendFocus: true,
        title: 'Weather Dashboard'
    },
    ignoreLocked: ['C-c']
});

const fetch = (url) => new Promise((resolve, reject) => request(url, (err, res, body) => {
    if (err) {
        reject(err);
        return;
    }
    resolve(body);
}));
const apiKey = 'aab82c2f8fc43e06eb5286bbf2555c3d';
const weather = city => fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`).then(JSON.parse);

const weatherOptions = {
    label: 'Weather Station',
    excludeAntartica: true,
    style: {
        shapeColor: 'green'
    },
};
const map = new contrib.map(weatherOptions);
screen.append(map);
function updateMap() {
    Promise.all([weather('Malmo, SE'), weather('Castro Daire, PT')])
        .then(list => list.forEach((w) => {
            map.addMarker(Object.assign({
                color: w.main.temp < 0 ? 'red' : w.main.temp < 15 ? 'yellow' : 'green',
                char: `${w.sys.country} ${w.main.temp}°`
            }, w.coord));
        }))
        .then(() => setTimeout(() => updateMap(), 30 * 60 * 1000))
        .then(() => screen.render())
        .catch(error => console.error(`WeatherStation\t| ${error.message}`));
}
setTimeout(updateMap, 1000);

screen.key(['q', 'C-c'], () => process.exit(-1));

screen.render();
