const path = require('path');
const util = require('util');
const glob = require('glob');
const contrib = require('blessed-contrib');
const exec = require('../utils/exec');

const pglob = util.promisify(glob);

const nodes = {};
const data = { extended: true };
const treeOptions = {
    clickable: true,
    label: 'NPM [o]',
    style: {
        item: {
            fg: 'green',
        },
        selected: {
            bg: 'blue',
        },
    },
};
module.exports = (grid, options, log, DB) => {
    const tree = grid.set(0, 8, 3, 2, contrib.tree, treeOptions);
    const toggleCmd = (node) => {
        const cmd = nodes[node.name];
        if (!cmd) {
            log.log(`No node found for name "${node.name}`, 'npm');
            log.log(JSON.stringify(node), 'npm');
            return;
        }
        const cmdLog = {
            log(...args) {
                log.log(...args, `npm ${node.name}`);
            }
        };
        if (!cmd.running) {
            const args = ['/c/Program Files/nodejs/npm', 'run', cmd.key];
            exec('bash', args, { cwd: path.join(options.cwd, cmd.cwd)}, cmdLog, p => cmd.pid = p.pid)
                .then(proc => log.log(`node ${node.name} exit with exit code ${proc.code}`, `npm ${node.name}`))
                .catch(code => log.log(`node ${node.name} exit with exit code ${code}`, `npm ${node.name}`))
                .then(() => data.children[node.name] = {})
                .then(() => cmd.running = false)
                .then(() => DB && DB.emit && DB.emit('npm', nodes))
                .then(() => data)
                .then(JSON.stringify)
                .then(JSON.parse)
                .then(data => tree.setData(data))
                .then(() => grid.screen.render())
                .catch(console.error);
            cmd.running = true;
            data.children[node.name] = { extended: true, children: { running: {} } };
            DB && DB.emit && DB.emit('npm', nodes);
            Promise.resolve(data)
                .then(JSON.stringify)
                .then(JSON.parse)
                .then(data => tree.setData(data))
                .then(() => grid.screen.render())
                .catch(console.error);
        } else {
            cmd.running = false;
            log.log(`killing ${cmd.pid}!`, `npm ${node.name}`);
            process.kill(cmd.pid, 'SIGINT');
        }
    };
    tree.on('click', () => tree.focus());
    tree.on('select',function (node) {
        log.log(`${node.name}`, `npm ${node.name}`);
        if (node.myCustomProperty){
            log.log(node.myCustomProperty, `npm ${node.name}`);
        }
        toggleCmd(node);
    });
    DB.on('exec', payload => payload.type === 'npm' ? toggleCmd({ name: payload.target }) : null);
    pglob(path.join('**', 'package.json'), { cwd: options.cwd, ignore: ["**/node_modules/**", "./node_modules/**"]})
        .then(list => list.map(file => ({ file, package: require(path.join(options.cwd, `./${file}`)) })))
        .then(list => list.filter(item => item.package.scripts))
        .then(list => list.filter(item => Object.keys(item.package.scripts)))
        .then(objectify)
        .then(data => store(data, DB))
        .then(list => Object.assign(data, { children: list }))
        .then(JSON.stringify)
        .then(JSON.parse)
        .then(data => tree.setData(data))
        .then(() => grid.screen.render())
        .catch(err => log.log(err.toString(), `npm ${node.name}`));
    return {
        focus: () => tree.focus(),
        emit: () => {},
    };
};

function store(data, DB) {
    Object.keys(data).forEach(key => nodes[key] = data[key]);
    if (DB && DB.emit) {
        DB.emit('npm', data);
    }
    return data;
}

function objectify(list) {
    const obj = {};
    list.forEach(
        item => Object.keys(item.package.scripts)
            .forEach(key => obj[`${item.package.name} ${key}`] = { key, cwd: path.dirname(item.file), script: item.package.scripts[key], running: false })
    )
    return obj;
}
