const Log = require('./log');

module.exports = (grid, db) => {
    const logOptions = {
        label: 'Logs',
        bufferLength: 1000,
        mouse: true,
        db,
        style: {
            fg: 'green',
            scrollbar: {
                style: {
                    fg: 'yellow',
                },
            },
            selected: {
                fg: 'green'
            },
            focus: { border: { fg: 'white' } },
        }
    };
    const log = grid.set(4, 0, 8, 6, Log, logOptions);

    return log;
}
