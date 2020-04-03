const contrib = require('blessed-contrib');
const Log = require('./log');

module.exports = (grid, db) => {
    const build = grid.set(3, 6, 3, 6, Log, { fg: "green", selectedFg: "green", label: 'Build Client', bufferLength: 60, db });
    return build;
};
