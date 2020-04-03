const path = require('path');
const contrib = require('blessed-contrib');

module.exports = (grid) => {
    const img = grid.set(0, 0, 4, 6, contrib.picture, { file: path.join(__dirname, '..', 'logo-smaller.png'), cols: 90 });
    return img;
};
