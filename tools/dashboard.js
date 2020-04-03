#!/usr/bin/env node
'use strict';

const path = require('path');
const blessed = require('blessed');
const contrib = require('blessed-contrib');

const Logs = require('./widgets/logs');
const WeatherStation = require('./widgets/weather-station');
const Logo = require('./widgets/logo');
const Build = require('./widgets/build');
const ProjectTree = require('./widgets/project-tree');
const NodeJsTree = require('./widgets/nodejs-tree');
const DockerTree = require('./widgets/docker-tree');
const exec = require('./utils/exec');

const Server = require('./server');

const options = {
    cwd: path.resolve(__dirname, '..')
};

const screen = blessed.screen({
    smartCSR: true,
    autoPadding: true,
    mouse: true,
    cursor: {
        shape: 'underline',
        blink: true,
        color: 'white',
        sendFocus: true,
    },
    title: 'Developer Dashboard',
    ignoreLocked: ['C-c'],
});
const grid = new contrib.grid({
    rows: 12,
    cols: 12,
    selectedFg: 'white',
    selectedBg: 'black',
    interactive: true,
    screen
});
grid.screen = screen;

const log = Logs(grid, Server);
const logo = Logo(grid);
const weather = WeatherStation(grid, log, Server);
const build = Build(grid, Server);
const project = ProjectTree(grid, options, log, Server);
const nodeJs = NodeJsTree(grid, options, build, Server);
const docker = DockerTree(grid, options, log, Server);

screen.key(['q', 'C-c'], () => exec('docker-compose', ['down'], options, log).then(() => process.exit(0)).catch(code => process.exit(code)));
screen.key(['p', 'P'], () => project.focus());
screen.key(['o', 'O'], () => nodeJs.focus());
screen.key(['c', 'C'], () => docker.focus());
screen.key(['tab'], () => screen.focusNext());
screen.key(['shift-tab'], () => screen.focusPrevious());

screen.on('resize', function() {
    [log, logo, weather, build, project, nodeJs, docker]
        .forEach(instance => instance.emit('attach'));
});

setTimeout(() => screen.render(), 1000);

screen.render();
