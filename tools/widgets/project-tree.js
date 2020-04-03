const path = require('path');
const util = require('util');
const glob = require('glob');
const { tree } = require('blessed-contrib');
const exec = require('../utils/exec');

const pglob = util.promisify(glob);

const nodes = {};
const data = {
    extended: true
};

const treeOptions = {
    mouse: true,
    clickable: true,
    label: 'Projects [p]',
    effects: {
        focus: {
            border: {
                fg: 'white',
            },
        },
    },
    focusEffect: {
        border: {
            fg: 'white',
        },
    },
    style: {
        item: {
            fg: 'green',
        },
        selected: {
            bg: 'blue',
        },
    },
};
module.exports = (grid,  options, log, DB) => {
    const ptree = grid.set(0, 6, 3, 2, tree, treeOptions);
    const toggleCmd = (node) => {
        const name = node.name;
        const cmd = nodes[name];
        log.log(`selected: ${name}`);
        if (!cmd) {
            log.log(`No node found for name "${node.name}`, 'projects');
            log.log(JSON.stringify(node), 'projects');
            return;
        }
        const cmdLog = {
            log(...args) {
                log.log(...args, `projects ${name}`);
            }
        };
        if (!cmd.running) {
            cmd.running = true;
            data.children[name] = { extended: true, children: { running: {} } };
            DB && DB.emit && DB.emit('projects', nodes);
            // JSON.stringify(data, null, 2).split('\n').map(line => log.log(line), `projects ${name}`)
            Promise.resolve(data)
                .then(JSON.stringify)
                .then(JSON.parse)
                .then(data => ptree.setData(data))
                .then(() => grid.screen.render())
                .catch(console.error);
            exec('dotnet', ['watch', '--project', name, 'run'], options, cmdLog, p => cmd.pid = p.pid)
                .then(proc => log.log(`node ${node.name} exit with exit code ${proc.code}`, `projects ${name}`))
                .catch(code => log.log(`node ${node.name} exit with exit code ${code}`, `projects ${name}`))
                .then(() => data.children[node.name] = {})
                .then(() => cmd.running = false)
                .then(() => DB && DB.emit && DB.emit('projects', nodes))
                .then(() => data)
                .then(JSON.stringify)
                .then(JSON.parse)
                .then(data => ptree.setData(data))
                .then(() => grid.screen.render())
                .catch(console.error);
        } else {
            cmd.running = false;
            log.log(`killing ${cmd.pid}!`, `projects ${name}`);
            process.kill(cmd.pid, 'SIGINT');
        }
    };
    ptree.focus();
    ptree.on('click', () => tree.focus());
    ptree.on('select',function (node) {
        log.log(`${node.name}`, `projects ${name}`);
        if (node.myCustomProperty){
            log.log(node.myCustomProperty, `projects ${name}`);
        }
        toggleCmd(node);
    });
    DB.on('exec', payload => payload.type === 'projects' ? toggleCmd({ name: payload.target }) : null);
    pglob(path.join('*', '*.csproj'), options)
        .then(list => list.map(file => path.dirname(file)))
        .then(list => list.reduce((obj, key) => (obj[key] = { running: false }, obj), {}))
        .then(data => store(data, DB))
        .then(list => Object.assign(data, { children: list }))
        .then(JSON.stringify)
        .then(JSON.parse)
        .then(data => ptree.setData(data))
        .then(() => grid.screen.render())
        .catch(console.error);
    return {
        focus: () => ptree.focus(),
        emit: () => {},
    };
};

function store(data, DB) {
    Object.keys(data).forEach(key => nodes[key] = data[key]);
    if (DB && DB.emit) {
        DB.emit('projects', data);
    }
    return data;
}
