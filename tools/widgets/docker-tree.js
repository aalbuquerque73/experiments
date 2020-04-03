const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const util = require('util');
const glob = require('glob');
const contrib = require('blessed-contrib');
const exec = require('../utils/exec');

const pglob = util.promisify(glob);

const nodes = {};
const data = { extended: true };
const treeOptions = {
    clickable: true,
    label: 'Docker [c]',
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
    const tree = grid.set(0, 10, 3, 2, contrib.tree, treeOptions);
    const toggleCmd = (node) => {
        const cmd = nodes[node.name];
        if (!cmd) {
            log.log(`No node found for name "${node.name}`, 'docker');
            log.log(JSON.stringify(node), 'docker');
            return;
        }
        const cmdLog = {
            log(...args) {
                log.log(...args, `docker ${cmd.service}`);
            }
        };
        if (!cmd.running) {
            const args = ['up', cmd.service];
            exec('docker-compose', args, { cwd: path.join(options.cwd, cmd.cwd)}, cmdLog)
                .then(proc => log.log(`node ${node.name} exit with exit code ${proc.code}`, `docker ${cmd.service}`))
                .catch(code => log.log(`node ${node.name} exit with exit code ${code}`, `docker ${cmd.service}`))
                .then(() => data.children[node.name] = {})
                .then(() => cmd.running = false)
                .then(() => DB && DB.emit && DB.emit('docker', nodes))
                .then(() => data)
                .then(JSON.stringify)
                .then(JSON.parse)
                .then(data => tree.setData(data))
                .then(() => grid.screen.render())
                .catch(console.error);
            cmd.running = true;
            data.children[node.name] = { extended: true, children: { running: {} } };
            DB && DB.emit && DB.emit('docker', nodes);
            Promise.resolve(data)
                .then(JSON.stringify)
                .then(JSON.parse)
                .then(data => tree.setData(data))
                .catch(console.error);
        } else {
            cmd.running = false;
            log.log(`docker-compose stop ${cmd.service}!`, `docker ${cmd.service}`);
            const args = ['stop', cmd.service];
            exec('docker-compose', args, { cwd: path.join(options.cwd, cmd.cwd)}, cmdLog)
                .catch(code => log.log(`docker-compose ${node.name} exit with exit code ${code}`, `docker ${cmd.service}`));
        }
    };
    tree.on('click', () => tree.focus());
    tree.on('click', () => log.log('click', `docker ${cmd.service}`));
    tree.on('select',function (node) {
        log.log(`${node.name}`, `docker ${cmd.service}`);
        toggleCmd(node);
    });
    DB.on('exec', payload => payload.type === 'docker' ? toggleCmd({ name: payload.target }) : null);
    pglob(path.join('**', 'docker-compose.yml'), { cwd: options.cwd, ignore: ["**/node_modules/**", "./node_modules/**"]})
        .then(list => list.map(file => ({ file, package: yaml.safeLoad(fs.readFileSync(path.join(options.cwd, `./${file}`), 'utf8')) })))
        .then(list => list.filter(item => item.package.services))
        .then(list => list.filter(item => Object.keys(item.package.services)))
        .then(objectify)
        .then(data => store(data, DB))
        .then(list => Object.assign(data, { children: list }))
        .then(JSON.stringify)
        .then(JSON.parse)
        .then(data => tree.setData(data))
        .catch(err => log.log(err.toString(), `docker ${cmd.service}`));
    return {
        focus: () => tree.focus(),
        emit: () => {},
    };
};

function store(data, DB) {
    Object.keys(data).forEach(key => nodes[key] = data[key]);
    if (DB && DB.emit) {
        DB.emit('docker', data);
    }
    return data;
}

function objectify(list) {
    const obj = {};
    list.forEach(
        item => Object.keys(item.package.services)
            .forEach(key => obj[`${path.basename(path.dirname(item.file))}/${key}`] = { key, cwd: path.dirname(item.file), service: key, running: false })
    )
    return obj;
}
